"use client";

import { useState } from "react";
import { db } from "@/utils/firebase";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const PRODUCTS = [
    // --- STREETWEAR ---
    {
        title: "Urban Cargo Joggers",
        price: 2499,
        category: "streetwear",
        image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80",
        stock: 45,
        pincodes: ["400059"],
        description: "Tactical cargo joggers with multiple utility pockets and adjustable cuffs.",
        rating: 4.5,
        reviews: 128
    },
    {
        title: "Graffiti Print Hoodie",
        price: 3299,
        category: "streetwear",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        stock: 30,
        pincodes: ["400059"],
        description: "Heavyweight hoodie featuring exclusive street art graphics.",
        rating: 4.8,
        reviews: 85
    },
    {
        title: "Distressed Denim Jacket",
        price: 4599,
        category: "streetwear",
        image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=800&q=80",
        stock: 20,
        pincodes: ["400059"],
        description: "Vintage wash denim jacket with distressed details and custom buttons.",
        rating: 4.2,
        reviews: 45
    },
    {
        title: "Oversized Graphic Tee - Tokyo",
        price: 1499,
        category: "streetwear",
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
        stock: 60,
        pincodes: ["400059"],
        description: "Heavyweight cotton tee with Tokyo street photography print.",
        rating: 4.6,
        reviews: 210
    },
    {
        title: "Techwear Vest",
        price: 2999,
        category: "streetwear",
        image: "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=800&q=80",
        stock: 15,
        pincodes: ["400059"],
        description: "Utility vest with multiple pockets, perfect for layering.",
        rating: 4.7,
        reviews: 32
    },

    // --- OVERSIZED ---
    {
        title: "Essential Oversized Tee - Black",
        price: 1299,
        category: "oversized",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
        stock: 100,
        pincodes: ["400059"],
        description: "The perfect boxy fit tee for everyday comfort and style.",
        rating: 4.6,
        reviews: 210
    },
    {
        title: "Baggy Dad Jeans",
        price: 2999,
        category: "oversized",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        stock: 40,
        pincodes: ["400059"],
        description: "Relaxed fit denim with a classic 90s silhouette.",
        rating: 4.4,
        reviews: 67
    },
    {
        title: "Drop Shoulder Sweatshirt",
        price: 2199,
        category: "oversized",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        stock: 55,
        pincodes: ["400059"],
        description: "Cozy fleece sweatshirt with a trendy drop shoulder cut.",
        rating: 4.8,
        reviews: 150
    },
    {
        title: "Oversized Flannel Shirt",
        price: 2499,
        category: "oversized",
        image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&q=80",
        stock: 35,
        pincodes: ["400059"],
        description: "Heavyweight flannel shirt, perfect for layering.",
        rating: 4.5,
        reviews: 89
    },

    // --- GYM FITS ---
    {
        title: "Performance Pump Cover",
        price: 1999,
        category: "gym_fits",
        image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80",
        stock: 70,
        pincodes: ["400059"],
        description: "Oversized hoodie designed to keep you warm until the pump hits.",
        rating: 4.9,
        reviews: 150
    },
    {
        title: "Pro Compression Tee",
        price: 999,
        category: "gym_fits",
        image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80",
        stock: 80,
        pincodes: ["400059"],
        description: "Moisture-wicking compression fabric for peak performance.",
        rating: 4.7,
        reviews: 95
    },
    {
        title: "Training Shorts 5\"",
        price: 1499,
        category: "gym_fits",
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
        stock: 60,
        pincodes: ["400059"],
        description: "Lightweight shorts with a 5-inch inseam for maximum range of motion.",
        rating: 4.6,
        reviews: 112
    },
    {
        title: "Muscle Stringer Vest",
        price: 799,
        category: "gym_fits",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
        stock: 90,
        pincodes: ["400059"],
        description: "Classic stringer vest to show off those gains.",
        rating: 4.5,
        reviews: 78
    },

    // --- SHAADI CLOSET ---
    {
        title: "Royal Silk Sherwani",
        price: 15999,
        category: "shaadi_closet",
        image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=800&q=80",
        stock: 10,
        pincodes: ["400059"],
        description: "Hand-embroidered silk sherwani for the perfect groom look.",
        rating: 5.0,
        reviews: 12
    },
    {
        title: "Floral Lehenga Choli",
        price: 12499,
        category: "shaadi_closet",
        image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80",
        stock: 15,
        pincodes: ["400059"],
        description: "Designer floral lehenga with intricate zari work.",
        rating: 4.8,
        reviews: 18
    },
    {
        title: "Classic Kurta Pajama",
        price: 2999,
        category: "shaadi_closet",
        image: "https://images.unsplash.com/photo-1622122201714-30783124d9b2?w=800&q=80",
        stock: 40,
        pincodes: ["400059"],
        description: "Elegant cotton silk kurta pajama set for festive occasions.",
        rating: 4.6,
        reviews: 45
    },

    // --- URBAN STYLE ---
    {
        title: "Techwear Windbreaker",
        price: 3999,
        category: "urban_style",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        stock: 25,
        pincodes: ["400059"],
        description: "Water-resistant windbreaker with reflective details.",
        rating: 4.5,
        reviews: 34
    },
    {
        title: "Ripped Skinny Jeans",
        price: 2199,
        category: "urban_style",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        stock: 30,
        pincodes: ["400059"],
        description: "Distressed denim for the edgy urban look.",
        rating: 4.3,
        reviews: 56
    },
    {
        title: "Flannel Overshirt",
        price: 1599,
        category: "urban_style",
        image: "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=800&q=80",
        stock: 40,
        pincodes: ["400059"],
        description: "Checkered flannel shirt, perfect for layering.",
        rating: 4.4,
        reviews: 78
    },

    // --- ACCESSORIES ---
    {
        title: "Cuban Link Chain",
        price: 799,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800&q=80",
        stock: 100,
        pincodes: ["400059"],
        description: "Stainless steel cuban chain, anti-tarnish.",
        rating: 4.3,
        reviews: 220
    },
    {
        title: "Retro Sunglasses",
        price: 499,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
        stock: 80,
        pincodes: ["400059"],
        description: "90s style rectangular sunglasses.",
        rating: 4.2,
        reviews: 145
    },
    {
        title: "Snapback Cap - NY",
        price: 899,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
        stock: 60,
        pincodes: ["400059"],
        description: "Classic snapback cap with embroidery.",
        rating: 4.5,
        reviews: 98
    },

    // --- MEN ---
    {
        title: "Classic Oxford Shirt",
        price: 1499,
        category: "men",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
        stock: 50,
        pincodes: ["400059"],
        description: "Timeless oxford shirt, perfect for formal and casual wear.",
        rating: 4.5,
        reviews: 89
    },
    {
        title: "Slim Fit Chinos",
        price: 1999,
        category: "men",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80",
        stock: 40,
        pincodes: ["400059"],
        description: "Versatile chinos that pair well with anything.",
        rating: 4.4,
        reviews: 120
    },
    {
        title: "Premium Polo T-Shirt",
        price: 999,
        category: "men",
        image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800&q=80",
        stock: 60,
        pincodes: ["400059"],
        description: "High-quality cotton polo for a smart look.",
        rating: 4.6,
        reviews: 150
    },
    {
        title: "Bomber Jacket",
        price: 3499,
        category: "men",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        stock: 25,
        pincodes: ["400059"],
        description: "Classic bomber jacket with a modern fit.",
        rating: 4.7,
        reviews: 45
    },

    // --- WOMEN ---
    {
        title: "Crop Top - Lavender",
        price: 699,
        category: "women",
        image: "https://images.unsplash.com/photo-1583336630454-4474bc240311?w=800&q=80",
        stock: 50,
        pincodes: ["400059"],
        description: "Ribbed crop top, perfect for summer.",
        rating: 4.6,
        reviews: 88
    },
    {
        title: "High Waist Mom Jeans",
        price: 1899,
        category: "women",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80",
        stock: 40,
        pincodes: ["400059"],
        description: "Vintage fit high waist jeans.",
        rating: 4.7,
        reviews: 120
    },
    {
        title: "Oversized Boyfriend Blazer",
        price: 3499,
        category: "women",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
        stock: 20,
        pincodes: ["400059"],
        description: "Chic oversized blazer for a smart-casual look.",
        rating: 4.8,
        reviews: 45
    },
    {
        title: "Floral Summer Dress",
        price: 1599,
        category: "women",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80",
        stock: 35,
        pincodes: ["400059"],
        description: "Lightweight floral dress, perfect for brunch.",
        rating: 4.5,
        reviews: 67
    },

    // --- KIDS ---
    {
        title: "Kids Denim Overalls",
        price: 1299,
        category: "kids",
        image: "https://images.unsplash.com/photo-1519238263496-63f82a0ef963?w=800&q=80",
        stock: 25,
        pincodes: ["400059"],
        description: "Cute and durable denim overalls.",
        rating: 4.9,
        reviews: 45
    },
    {
        title: "Printed T-Shirt - Dino",
        price: 499,
        category: "kids",
        image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80",
        stock: 60,
        pincodes: ["400059"],
        description: "Fun dinosaur print t-shirt for kids.",
        rating: 4.8,
        reviews: 89
    },
    {
        title: "Cotton Shorts Set",
        price: 899,
        category: "kids",
        image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=800&q=80",
        stock: 40,
        pincodes: ["400059"],
        description: "Comfortable cotton shorts and tee set.",
        rating: 4.7,
        reviews: 56
    },

    // --- EVERYDAY ---
    {
        title: "Basic White Tee",
        price: 499,
        category: "everyday",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        stock: 100,
        pincodes: ["400059"],
        description: "Essential white crew neck t-shirt.",
        rating: 4.5,
        reviews: 300
    },
    {
        title: "Chino Shorts - Khaki",
        price: 899,
        category: "everyday",
        image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
        stock: 60,
        pincodes: ["400059"],
        description: "Comfortable chino shorts for casual wear.",
        rating: 4.4,
        reviews: 120
    },

    // --- LAST MINUTE ---
    {
        title: "Cotton Boxers (Pack of 3)",
        price: 999,
        category: "last_minute",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        stock: 100,
        pincodes: ["400059"],
        description: "Premium cotton boxers for daily comfort.",
        rating: 4.6,
        reviews: 150
    },
    {
        title: "Ankle Socks (Pack of 5)",
        price: 499,
        category: "last_minute",
        image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80",
        stock: 150,
        pincodes: ["400059"],
        description: "Breathable ankle socks, perfect for sneakers.",
        rating: 4.5,
        reviews: 200
    }
];

export default function SeedPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [error, setError] = useState("");

    const seedData = async () => {
        setLoading(true);
        setStatus("Starting seeding...");
        setError("");

        try {
            // 1. Clear existing products
            setStatus("Clearing old products...");
            const productsRef = collection(db, "products");
            const snapshot = await getDocs(productsRef);

            // Delete in batches
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            setStatus("Adding new products...");

            // 2. Add new products
            const addPromises = PRODUCTS.map(product => {
                return addDoc(collection(db, "products"), {
                    ...product,
                    createdAt: new Date()
                });
            });

            await Promise.all(addPromises);

            setStatus("Seeding complete! You can now browse the site.");
        } catch (err: any) {
            console.error("Seeding error:", err);
            setError(err.message || "An error occurred during seeding.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-white/10 space-y-6">
                <h1 className="text-2xl font-bold text-center">Database Seeder</h1>
                <p className="text-gray-400 text-center text-sm">
                    Click the button below to populate the database with dummy data.
                    This uses the Client SDK, so it bypasses the Admin SDK key issues.
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {status && !error && (
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl flex items-start gap-3 text-green-400 text-sm">
                        <CheckCircle className="h-5 w-5 flex-shrink-0" />
                        <p>{status}</p>
                    </div>
                )}

                <Button
                    onClick={seedData}
                    disabled={loading}
                    className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Seeding...
                        </>
                    ) : (
                        "Seed Database"
                    )}
                </Button>

                <div className="text-center">
                    <a href="/" className="text-sm text-gray-500 hover:text-white underline">Return to Home</a>
                </div>
            </div>
        </div>
    );
}
