import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 128 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const paintings = mysqlTable("paintings", {
  id: varchar("id", { length: 32 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  artist: varchar("artist", { length: 160 }).notNull(),
  description: text("description").notNull(),
  price: int("price").notNull(),
  imageUrl: varchar("imageUrl", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["available", "sold"]).default("available").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const paintingOrders = mysqlTable("painting_orders", {
  id: int("id").autoincrement().primaryKey(),
  paintingId: varchar("paintingId", { length: 32 }).notNull().references(() => paintings.id),
  customerId: int("customerId").notNull().references(() => users.id),
  status: mysqlEnum("status", ["active", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  cancelledAt: timestamp("cancelledAt"),
});

export const wallBookings = mysqlTable("wall_bookings", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  bookingDate: varchar("bookingDate", { length: 10 }).notNull(),
  wallSize: int("wallSize").notNull(),
  address: text("address").notNull(),
  price: int("price").notNull(),
  status: mysqlEnum("status", ["requested", "confirmed", "declined", "cancelled"]).default("requested").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  bookingDateUnique: uniqueIndex("wall_bookings_booking_date_unique").on(table.bookingDate),
}));

export const potteryItems = mysqlTable("pottery_items", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
});

export const glazes = mysqlTable("glazes", {
  id: varchar("id", { length: 32 }).primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
});

export const potteryRequests = mysqlTable("pottery_requests", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  itemId: varchar("itemId", { length: 32 }).notNull().references(() => potteryItems.id),
  glazeId: varchar("glazeId", { length: 32 }).notNull().references(() => glazes.id),
  quantity: int("quantity").notNull(),
  neededBy: varchar("neededBy", { length: 10 }).notNull(),
  status: mysqlEnum("status", ["requested", "accepted", "declined", "cancelled"]).default("requested").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const studioSettings = mysqlTable("studio_settings", {
  id: int("id").primaryKey(),
  currency: varchar("currency", { length: 8 }).notNull().default("INR"),
  muralRatePerSqFt: int("muralRatePerSqFt").notNull().default(150),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Painting = typeof paintings.$inferSelect;
export type WallBooking = typeof wallBookings.$inferSelect;
export type PotteryRequest = typeof potteryRequests.$inferSelect;
