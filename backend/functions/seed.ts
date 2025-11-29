import * as admin from "firebase-admin";
import { readFileSync } from "fs";
import { join } from "path";

process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";

admin.initializeApp();
const db = admin.firestore();

async function seed() {
  const seedPath = join(__dirname, "../../seed-data/seed.json");
  const raw = readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw);

  let stores = 0; let products = 0; let drivers = 0; let orders = 0;

  for (const s of data.stores) {
    await db.collection("stores").doc(s.id).set(s);
    stores++;
  }

  for (const p of data.products) {
    await db.collection("products").doc(p.id).set(p);
    products++;
  }

  for (const d of data.drivers) {
    await db.collection("drivers").doc(d.id).set(d);
    drivers++;
  }

  for (const o of data.orders) {
    await db.collection("orders").doc(o.id).set(o);
    orders++;
  }

  console.log(JSON.stringify({ stores, products, drivers, orders }));
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
