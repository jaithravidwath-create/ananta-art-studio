import { and, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getDb, getUserByEmail } from "./db";
import { clearSessionCookie, createSession, hashPassword, publicUser, sessionCookie, verifyPassword } from "./auth";
import { glazes, paintings, paintingOrders, potteryItems, potteryRequests, studioSettings, users, wallBookings } from "../drizzle/schema";
import { adminProcedure, customerProcedure, publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const";
import { TRPCError } from "@trpc/server";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const loginInput = z.object({ email: z.string().email(), password: z.string().min(1) });
const paintingInput = z.object({
  title: z.string().trim().min(2).max(255),
  artist: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(4000),
  price: z.coerce.number().int().positive().max(10000000),
  imageUrl: z.string().trim().min(1).max(255),
});

function dbOrThrow() {
  return getDb().then(db => {
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The studio database is not available." });
    return db;
  });
}

function todayUtc() {
  return new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
}

function dateFromString(value: string) {
  if (!datePattern.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() + 1 !== month || parsed.getUTCDate() !== day) return null;
  return parsed;
}

function daysFromToday(value: string) {
  const parsed = dateFromString(value);
  if (!parsed) return null;
  return Math.round((parsed.getTime() - todayUtc().getTime()) / 86400000);
}

function dateError(value: string, min: number, max?: number) {
  const days = daysFromToday(value);
  return days === null || days < min || (max !== undefined && days > max);
}

const conflict = (message: string) => new TRPCError({ code: "CONFLICT", message });

export const appRouter = router({
  system: router({ health: publicProcedure.query(() => ({ ok: true })) }),

  auth: router({
    me: publicProcedure.query(({ ctx }) => publicUser(ctx.user)),
    login: publicProcedure.input(loginInput).mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email.toLowerCase());
      if (!user || !verifyPassword(input.password, user.passwordHash)) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "That email or password is not recognised." });
      }
      const db = await dbOrThrow();
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
      ctx.res.setHeader("Set-Cookie", sessionCookie(await createSession(user)));
      return publicUser(user);
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      if (typeof ctx.res.setHeader === "function") {
        ctx.res.setHeader("Set-Cookie", clearSessionCookie());
      } else if (typeof ctx.res.clearCookie === "function") {
        ctx.res.clearCookie(COOKIE_NAME, { maxAge: -1, secure: true, sameSite: "none", httpOnly: true, path: "/" });
      }
      return { success: true } as const;
    }),
  }),

  catalog: router({
    listAvailable: publicProcedure.query(async () => {
      const db = await dbOrThrow();
      return db.select().from(paintings).where(eq(paintings.status, "available")).orderBy(desc(paintings.createdAt));
    }),
    get: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ input }) => {
      const db = await dbOrThrow();
      const result = await db.select().from(paintings).where(eq(paintings.id, input.id)).limit(1);
      if (!result[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Painting not found." });
      return result[0];
    }),
    meta: publicProcedure.query(async () => {
      const db = await dbOrThrow();
      const setting = (await db.select().from(studioSettings).where(eq(studioSettings.id, 1)).limit(1))[0];
      const [items, glazeOptions] = await Promise.all([
        db.select().from(potteryItems).orderBy(potteryItems.name),
        db.select().from(glazes).orderBy(glazes.name),
      ]);
      return { currency: setting?.currency ?? "INR", muralRatePerSqFt: setting?.muralRatePerSqFt ?? 150, potteryItems: items, glazes: glazeOptions };
    }),
  }),

  paintings: router({
    buy: customerProcedure.input(z.object({ paintingId: z.string().min(1) })).mutation(async ({ input, ctx }) => {
      const db = await dbOrThrow();
      return db.transaction(async tx => {
        const changed = await tx.update(paintings).set({ status: "sold" }).where(and(eq(paintings.id, input.paintingId), eq(paintings.status, "available")));
        if (Number((changed as { affectedRows?: number }).affectedRows ?? 0) !== 1) {
          throw conflict("This painting was just sold or is no longer available. Please return to the gallery.");
        }
        const inserted = await tx.insert(paintingOrders).values({ paintingId: input.paintingId, customerId: ctx.user.id, status: "active" });
        return { success: true, orderId: Number((inserted as { insertId?: number }).insertId ?? 0) };
      });
    }),
    cancelOrder: customerProcedure.input(z.object({ orderId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const db = await dbOrThrow();
      return db.transaction(async tx => {
        const order = (await tx.select().from(paintingOrders).where(and(eq(paintingOrders.id, input.orderId), eq(paintingOrders.customerId, ctx.user.id))).limit(1))[0];
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found." });
        if (order.status !== "active") throw conflict("This order is already cancelled.");
        await tx.update(paintingOrders).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(paintingOrders.id, order.id));
        await tx.update(paintings).set({ status: "available" }).where(eq(paintings.id, order.paintingId));
        return { success: true };
      });
    }),
  }),

  customer: router({
    dashboard: customerProcedure.query(async ({ ctx }) => {
      const db = await dbOrThrow();
      const [orders, bookings, pottery] = await Promise.all([
        db.select({ id: paintingOrders.id, status: paintingOrders.status, createdAt: paintingOrders.createdAt, paintingId: paintings.id, title: paintings.title, artist: paintings.artist, price: paintings.price, imageUrl: paintings.imageUrl }).from(paintingOrders).leftJoin(paintings, eq(paintingOrders.paintingId, paintings.id)).where(eq(paintingOrders.customerId, ctx.user.id)).orderBy(desc(paintingOrders.createdAt)),
        db.select().from(wallBookings).where(eq(wallBookings.customerId, ctx.user.id)).orderBy(desc(wallBookings.bookingDate)),
        db.select({ id: potteryRequests.id, itemId: potteryRequests.itemId, glazeId: potteryRequests.glazeId, quantity: potteryRequests.quantity, neededBy: potteryRequests.neededBy, status: potteryRequests.status, createdAt: potteryRequests.createdAt, itemName: potteryItems.name, glazeName: glazes.name }).from(potteryRequests).leftJoin(potteryItems, eq(potteryRequests.itemId, potteryItems.id)).leftJoin(glazes, eq(potteryRequests.glazeId, glazes.id)).where(eq(potteryRequests.customerId, ctx.user.id)).orderBy(desc(potteryRequests.createdAt)),
      ]);
      return { user: publicUser(ctx.user), orders, bookings, pottery };
    }),
    createBooking: customerProcedure.input(z.object({ bookingDate: z.string(), wallSize: z.coerce.number().int(), address: z.string().trim().min(8).max(1000) })).mutation(async ({ input, ctx }) => {
      if (dateError(input.bookingDate, 7, 90)) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose a date between 7 and 90 days from today." });
      if (input.wallSize < 10 || input.wallSize > 500) throw new TRPCError({ code: "BAD_REQUEST", message: "Wall size must be between 10 and 500 square feet." });
      const db = await dbOrThrow();
      const setting = (await db.select().from(studioSettings).where(eq(studioSettings.id, 1)).limit(1))[0];
      const price = input.wallSize * (setting?.muralRatePerSqFt ?? 150);
      try {
        await db.insert(wallBookings).values({ customerId: ctx.user.id, bookingDate: input.bookingDate, wallSize: input.wallSize, address: input.address, price, status: "requested" });
      } catch (error) {
        const dbError = error as { code?: string; errno?: number };
        if (dbError.code === "ER_DUP_ENTRY" || dbError.errno === 1062) {
          throw conflict("That date is already reserved. Please choose another day.");
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The booking could not be saved right now." });
      }
      return { success: true, price };
    }),
    cancelBooking: customerProcedure.input(z.object({ bookingId: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const db = await dbOrThrow();
      const booking = (await db.select().from(wallBookings).where(and(eq(wallBookings.id, input.bookingId), eq(wallBookings.customerId, ctx.user.id))).limit(1))[0];
      if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
      if (!["requested", "confirmed"].includes(booking.status)) throw conflict("This booking can no longer be cancelled.");
      const days = daysFromToday(booking.bookingDate);
      if (days === null || days < 3) throw conflict("Bookings can only be cancelled until 3 days before the booking date.");
      await db.update(wallBookings).set({ status: "cancelled" }).where(eq(wallBookings.id, booking.id));
      return { success: true };
    }),
    createPottery: customerProcedure.input(z.object({ itemId: z.string(), glazeId: z.string(), quantity: z.coerce.number().int(), neededBy: z.string() })).mutation(async ({ input, ctx }) => {
      if (input.quantity < 1 || input.quantity > 12) throw new TRPCError({ code: "BAD_REQUEST", message: "Quantity must be between 1 and 12." });
      if (dateError(input.neededBy, 14)) throw new TRPCError({ code: "BAD_REQUEST", message: "Needed-by date must be at least 14 days from today." });
      const db = await dbOrThrow();
      const [item, glaze] = await Promise.all([
        db.select().from(potteryItems).where(eq(potteryItems.id, input.itemId)).limit(1),
        db.select().from(glazes).where(eq(glazes.id, input.glazeId)).limit(1),
      ]);
      if (!item[0] || !glaze[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose an item and glaze from the studio catalogue." });
      await db.insert(potteryRequests).values({ customerId: ctx.user.id, itemId: input.itemId, glazeId: input.glazeId, quantity: input.quantity, neededBy: input.neededBy, status: "requested" });
      return { success: true };
    }),
    updatePottery: customerProcedure.input(z.object({ id: z.number().int().positive(), itemId: z.string(), glazeId: z.string(), quantity: z.coerce.number().int(), neededBy: z.string() })).mutation(async ({ input, ctx }) => {
      if (input.quantity < 1 || input.quantity > 12) throw new TRPCError({ code: "BAD_REQUEST", message: "Quantity must be between 1 and 12." });
      if (dateError(input.neededBy, 14)) throw new TRPCError({ code: "BAD_REQUEST", message: "Needed-by date must be at least 14 days from today." });
      const db = await dbOrThrow();
      const request = (await db.select().from(potteryRequests).where(and(eq(potteryRequests.id, input.id), eq(potteryRequests.customerId, ctx.user.id))).limit(1))[0];
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Pottery request not found." });
      if (request.status !== "requested") throw conflict("Only requested pottery can be edited.");
      const [item, glaze] = await Promise.all([
        db.select({ id: potteryItems.id }).from(potteryItems).where(eq(potteryItems.id, input.itemId)).limit(1),
        db.select({ id: glazes.id }).from(glazes).where(eq(glazes.id, input.glazeId)).limit(1),
      ]);
      if (!item[0] || !glaze[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "Choose an item and glaze from the studio catalogue." });
      await db.update(potteryRequests).set({ itemId: input.itemId, glazeId: input.glazeId, quantity: input.quantity, neededBy: input.neededBy }).where(eq(potteryRequests.id, input.id));
      return { success: true };
    }),
    cancelPottery: customerProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ input, ctx }) => {
      const db = await dbOrThrow();
      const request = (await db.select().from(potteryRequests).where(and(eq(potteryRequests.id, input.id), eq(potteryRequests.customerId, ctx.user.id))).limit(1))[0];
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Pottery request not found." });
      if (request.status !== "requested") throw conflict("Only requested pottery can be cancelled.");
      await db.update(potteryRequests).set({ status: "cancelled" }).where(eq(potteryRequests.id, input.id));
      return { success: true };
    }),
  }),

  admin: router({
    dashboard: adminProcedure.query(async () => {
      const db = await dbOrThrow();
      const [allPaintings, orders, bookings, pottery, itemOptions, glazeOptions] = await Promise.all([
        db.select().from(paintings).orderBy(desc(paintings.createdAt)),
        db.select({ id: paintingOrders.id, status: paintingOrders.status, createdAt: paintingOrders.createdAt, customerEmail: users.email, customerName: users.name, paintingId: paintings.id, title: paintings.title, price: paintings.price }).from(paintingOrders).leftJoin(users, eq(paintingOrders.customerId, users.id)).leftJoin(paintings, eq(paintingOrders.paintingId, paintings.id)).orderBy(desc(paintingOrders.createdAt)),
        db.select({ id: wallBookings.id, bookingDate: wallBookings.bookingDate, wallSize: wallBookings.wallSize, address: wallBookings.address, price: wallBookings.price, status: wallBookings.status, customerEmail: users.email, customerName: users.name }).from(wallBookings).leftJoin(users, eq(wallBookings.customerId, users.id)).orderBy(desc(wallBookings.bookingDate)),
        db.select({ id: potteryRequests.id, itemId: potteryRequests.itemId, glazeId: potteryRequests.glazeId, quantity: potteryRequests.quantity, neededBy: potteryRequests.neededBy, status: potteryRequests.status, customerEmail: users.email, customerName: users.name, itemName: potteryItems.name, glazeName: glazes.name }).from(potteryRequests).leftJoin(users, eq(potteryRequests.customerId, users.id)).leftJoin(potteryItems, eq(potteryRequests.itemId, potteryItems.id)).leftJoin(glazes, eq(potteryRequests.glazeId, glazes.id)).orderBy(desc(potteryRequests.createdAt)),
        db.select().from(potteryItems).orderBy(potteryItems.name),
        db.select().from(glazes).orderBy(glazes.name),
      ]);
      return { paintings: allPaintings, orders, bookings, pottery, itemOptions, glazeOptions };
    }),
    addPainting: adminProcedure.input(paintingInput).mutation(async ({ input }) => {
      const db = await dbOrThrow();
      const id = `p-${nanoid(8)}`;
      await db.insert(paintings).values({ id, ...input, status: "available" });
      return { id };
    }),
    updatePainting: adminProcedure.input(paintingInput.extend({ id: z.string().min(1) })).mutation(async ({ input }) => {
      const db = await dbOrThrow();
      const current = (await db.select({ status: paintings.status }).from(paintings).where(eq(paintings.id, input.id)).limit(1))[0];
      if (!current) throw new TRPCError({ code: "NOT_FOUND", message: "Painting not found." });
      if (current.status !== "available") throw conflict("Sold paintings are kept as historical records and cannot be edited.");
      await db.update(paintings).set({ title: input.title, artist: input.artist, description: input.description, price: input.price, imageUrl: input.imageUrl }).where(eq(paintings.id, input.id));
      return { success: true };
    }),
    updateBooking: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["confirmed", "declined"]) })).mutation(async ({ input }) => {
      const db = await dbOrThrow();
      const result = await db.update(wallBookings).set({ status: input.status }).where(and(eq(wallBookings.id, input.id), eq(wallBookings.status, "requested")));
      if (Number((result as { affectedRows?: number }).affectedRows ?? 0) !== 1) throw conflict("Only requested bookings can be confirmed or declined.");
      return { success: true };
    }),
    updatePottery: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["accepted", "declined"]) })).mutation(async ({ input }) => {
      const db = await dbOrThrow();
      const result = await db.update(potteryRequests).set({ status: input.status }).where(and(eq(potteryRequests.id, input.id), eq(potteryRequests.status, "requested")));
      if (Number((result as { affectedRows?: number }).affectedRows ?? 0) !== 1) throw conflict("Only requested pottery can be accepted or declined.");
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
