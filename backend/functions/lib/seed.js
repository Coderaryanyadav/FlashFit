"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const fs_1 = require("fs");
const path_1 = require("path");
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "localhost:8080";
admin.initializeApp();
const db = admin.firestore();
async function seed() {
    const seedPath = (0, path_1.join)(__dirname, "../../seed-data/seed.json");
    const raw = (0, fs_1.readFileSync)(seedPath, "utf-8");
    const data = JSON.parse(raw);
    let stores = 0;
    let products = 0;
    let drivers = 0;
    let orders = 0;
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
//# sourceMappingURL=seed.js.map