// Empty state components for better UX

import { ShoppingBag, Heart, Package, Search, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

export function EmptyCart() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-neutral-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-400 mb-8">Looks like you haven&apos;t added anything to your cart yet</p>
            <Link href="/">
                <Button className="bg-primary text-black hover:bg-primary/90 font-bold">
                    Start Shopping
                </Button>
            </Link>
        </div>
    );
}

export function EmptyWishlist() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-400 mb-8">Save items you love to buy later</p>
            <Link href="/">
                <Button className="bg-primary text-black hover:bg-primary/90 font-bold">
                    Browse Products
                </Button>
            </Link>
        </div>
    );
}

export function EmptyOrders() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-neutral-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-8">Looks like you haven&apos;t placed any orders yet</p>
            <Link href="/">
                <Button className="bg-primary text-black hover:bg-primary/90 font-bold">
                    Start Shopping
                </Button>
            </Link>
        </div>
    );
}

export function EmptySearch() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-neutral-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
            <p className="text-gray-400 mb-8">Try searching with different keywords</p>
        </div>
    );
}

export function NoDeliveryArea() {
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-12 w-12 text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">We don&apos;t deliver here yet</h3>
            <p className="text-gray-400 mb-8">We&apos;re expanding soon! Check back later</p>
        </div>
    );
}
