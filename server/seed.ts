import "dotenv/config";
import { eq } from "drizzle-orm";
import { readFile } from "node:fs/promises";
import { getDb } from "./db";
import { hashPassword } from "./auth";
import { glazes, paintings, potteryItems, studioSettings, users } from "../drizzle/schema";

type Seed = {
  currency: string;
  paintings: Array<{ id: string; title: string; artist: string; description: string; price: number; imageUrl: string; status: "available" | "sold" }>;
  potteryItems: Array<{ id: string; name: string }>;
  glazes: Array<{ id: string; name: string }>;
  mural: { ratePerSqFt: number };
  studioAccount: { email: string; password: string; role: string };
};

export async function seedDatabase() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is required to seed");
  const seed = JSON.parse(await readFile(new URL("./seed/seed.json", import.meta.url), "utf8")) as Seed;

  const existingAdmin = await db.select().from(users).where(eq(users.email, seed.studioAccount.email)).limit(1);
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      openId: seed.studioAccount.email,
      name: "Studio Admin",
      email: seed.studioAccount.email,
      loginMethod: "demo",
      passwordHash: hashPassword(seed.studioAccount.password),
      role: "admin",
    });
  }
  const existingCustomer = await db.select().from(users).where(eq(users.email, "customer@artstudio.in")).limit(1);
  if (existingCustomer.length === 0) {
    await db.insert(users).values({
      openId: "customer@artstudio.in",
      name: "Asha Rao",
      email: "customer@artstudio.in",
      loginMethod: "demo",
      passwordHash: hashPassword("Customer@123"),
      role: "user",
    });
  }

  for (const painting of seed.paintings) {
    const existing = await db.select({ id: paintings.id }).from(paintings).where(eq(paintings.id, painting.id)).limit(1);
    if (existing.length === 0) {
      await db.insert(paintings).values(painting);
    } else {
      await db.update(paintings).set({ title: painting.title, artist: painting.artist, description: painting.description, price: painting.price, imageUrl: painting.imageUrl }).where(eq(paintings.id, painting.id));
    }
  }
  for (const item of seed.potteryItems) {
    await db.insert(potteryItems).values(item).onDuplicateKeyUpdate({ set: { name: item.name } });
  }
  for (const glaze of seed.glazes) {
    await db.insert(glazes).values(glaze).onDuplicateKeyUpdate({ set: { name: glaze.name } });
  }
  const setting = await db.select({ id: studioSettings.id }).from(studioSettings).where(eq(studioSettings.id, 1)).limit(1);
  if (setting.length === 0) {
    await db.insert(studioSettings).values({ id: 1, currency: seed.currency, muralRatePerSqFt: seed.mural.ratePerSqFt });
  } else {
    await db.update(studioSettings).set({ currency: seed.currency, muralRatePerSqFt: seed.mural.ratePerSqFt }).where(eq(studioSettings.id, 1));
  }
  console.log("Ananta seed complete");
  await (db as unknown as { $client?: { end?: () => Promise<void> } }).$client?.end?.();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().catch(error => { console.error(error); process.exitCode = 1; });
}
