import { NextResponse } from "next/server";
import { getAdminDb } from "@/utils/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
    const report: any = {
        timestamp: new Date().toISOString(),
        checks: {},
        status: "PENDING"
    };

    try {
        const db = getAdminDb();

        // 1. Check Categories
        try {
            const categoriesSnap = await db.collection('categories').get();
            report.checks.categories = {
                count: categoriesSnap.size,
                items: categoriesSnap.docs.map(d => ({ id: d.id, name: d.data().name }))
            };
        } catch (e: any) {
            report.checks.categories = { error: e.message };
        }

        // 2. Check Products
        try {
            const productsSnap = await db.collection('products').get();
            report.checks.products = {
                total_count: productsSnap.size,
                sample_ids: productsSnap.docs.slice(0, 3).map(d => d.id)
            };

            // 3. Check Pincode Mapping (400059)
            const pincode = "400059";
            const serviceableProducts = productsSnap.docs.filter(doc => {
                const data = doc.data();
                return data.pincodes && Array.isArray(data.pincodes) && data.pincodes.includes(pincode);
            });

            report.checks.pincode_400059 = {
                available_products: serviceableProducts.length,
                is_ok: serviceableProducts.length > 0
            };

        } catch (e: any) {
            report.checks.products = { error: e.message };
        }

        report.status = "SUCCESS";
        return NextResponse.json(report);

    } catch (error: any) {
        report.status = "FAILED";
        report.error = error.message;
        return NextResponse.json(report, { status: 500 });
    }
}
