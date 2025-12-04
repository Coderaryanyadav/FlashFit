"use client";

import { useEffect, useState } from "react";
import { useRouter, notFound } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, Star, Truck, ShieldCheck, RefreshCw, Heart, Sparkles, MessageSquare, Store } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const ProductReviews = dynamic(() => import("@/components/ProductReviews").then(mod => mod.ProductReviews), {
  loading: () => <div className="h-40 bg-neutral-900/50 rounded-xl animate-pulse" />,
  ssr: false
});

const AddReviewModal = dynamic(() => import("@/components/AddReviewModal").then(mod => mod.AddReviewModal), {
  ssr: false
});

import { ProductService, Product } from "@/services/productService";
import { SizeGuideModal } from "@/components/SizeGuideModal";
import { Share2 } from "lucide-react";
import { formatCurrency } from "@/utils/format";

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const addItem = useCartStore((state) => state.addItem);

  // Serviceable pincode constant
  const SERVICEABLE_PINCODE = "400059";

  // State for related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [imgSrc, setImgSrc] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sellerName, setSellerName] = useState<string>("");


  useEffect(() => {
    async function fetchProduct() {
      try {
        const fetchedProduct = await ProductService.getProductById(params.id);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
          if (fetchedProduct.storeId) {
            const seller = await ProductService.getSellerProfile(fetchedProduct.storeId);
            if (seller) setSellerName(seller.storeName || seller.displayName || "Verified Seller");
          }
        } else {
          console.error("Product not found");
        }
      } catch (e) {
        console.error("Error fetching product", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  // Fetch related products
  useEffect(() => {
    async function fetchRelated() {
      if (!product?.category || !product?.id) return;
      try {
        const related = await ProductService.getRelatedProducts(product.category, product.id, SERVICEABLE_PINCODE);
        setRelatedProducts(related);
      } catch (err) {
        console.error("Related products error:", err);
      }
    }
    fetchRelated();
  }, [product]);

  useEffect(() => {
    if (product?.image) {
      setImgSrc(product.image);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    // Require size only if stock is an object (has sizes)
    const requiresSize = typeof product.stock === 'object';

    if (requiresSize && !size) {
      alert("Please select a size.");
      return;
    }

    // Check stock for selected size
    let availableStock = 0;
    if (typeof product.stock === 'object') {
      availableStock = (product.stock as Record<string, number>)[size] || 0;
    } else {
      availableStock = product.stock || 0;
    }

    if (quantity > availableStock) {
      toast.error("Insufficient Stock", {
        description: `Only ${availableStock} units available for size ${size}.`
      });
      return;
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      images: [product.image],
      description: product.description || "",
      category: product.category || "Uncategorized",
      stock: availableStock,
      storeId: product.storeId || "unknown",
      isActive: true
    }, size, quantity);

    toast.success("Added to cart", {
      description: `${quantity} x ${product.title} (${size}) added to your cart.`,
      duration: 3000,
      action: {
        label: "View Cart",
        onClick: () => router.push("/cart")
      }
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: `Check out ${product?.title} on FlashFit!`,
          url: window.location.href,
        });
      } catch (error) {
        // Share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground">
      <Header />

      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-6 pt-24 text-sm text-muted-foreground">
        <ol className="flex items-center space-x-2">
          <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
          <li>/</li>
          <li><span className="text-foreground font-medium capitalize">{product.category}</span></li>
          <li>/</li>
          <li className="truncate max-w-[200px] text-foreground">{product.title}</li>
        </ol>
      </nav>

      <div className="container mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
              <Image
                src={imgSrc || product.image}
                alt={product.title}
                fill
                className="object-cover"
                priority
                onError={() => setImgSrc("https://placehold.co/500x600/1a1a1a/ffffff?text=No+Image")}
              />
              <button className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all z-10">
                <Heart className="w-6 h-6" />
              </button>

              <button
                onClick={handleShare}
                className="absolute top-4 right-16 p-3 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-black transition-all z-10"
              >
                <Share2 className="w-6 h-6" />
              </button>

              {/* AI Try-On Button */}
              <button className="absolute bottom-4 left-4 right-4 py-3 bg-white/90 backdrop-blur-md text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg group">
                <Sparkles className="w-5 h-5 text-purple-600 group-hover:animate-pulse" />
                AI Virtual Try-On
              </button>
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">{product.title}</h1>

              {/* Reviews section removed - will be replaced with real review system */}

              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-4xl font-bold text-primary">
                  {product.price === 0 ? "FREE" : formatCurrency(product.price)}
                </p>
                {product.price > 0 && (
                  <p className="text-xl text-muted-foreground line-through">
                    {formatCurrency(Math.round(product.price * 1.2))}
                  </p>
                )}
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-full border border-green-500/20">
                  20% OFF
                </span>
              </div>

              <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>

              {/* Seller Info */}
              {sellerName && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                  <Store className="w-4 h-4" />
                  <span>Sold by <span className="text-white font-bold">{sellerName}</span></span>
                </div>
              )}
            </div>

            <div className="prose prose-invert prose-lg text-muted-foreground mb-10">
              <p>{product.description || "Premium quality product designed for comfort and style. Made with high-quality materials to ensure durability and a perfect fit for your street style."}</p>
            </div>

            {/* Size Selector - Show if stock is an object (has sizes) or if it's a clothing category */}
            {(typeof product.stock === 'object' || ['men', 'women', 'kids', 'urban-style', 'everyday', 'accessories'].includes(product.category || '')) && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-bold text-white uppercase tracking-wider">Select Size</label>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="text-xs text-primary font-medium hover:underline">Size Chart</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {/* If stock is object, use its keys (or standard sizes if keys match). If number, show standard sizes but they might all be available/unavailable based on total count (fallback) */}
                  {(typeof product.stock === 'object' ? Object.keys(product.stock) : ["S", "M", "L", "XL", "XXL"]).sort((a, b) => {
                    // Custom sort for sizes
                    const order = { "XS": 1, "S": 2, "M": 3, "L": 4, "XL": 5, "XXL": 6, "3XL": 7 };
                    return (order[a as keyof typeof order] || 99) - (order[b as keyof typeof order] || 99);
                  }).map((s) => {
                    let isAvailable = true;
                    let stockCount = 0;

                    if (typeof product.stock === 'object') {
                      stockCount = (product.stock as Record<string, number>)[s] || 0;
                      isAvailable = stockCount > 0;
                    } else if (typeof product.stock === 'number') {
                      stockCount = product.stock;
                      isAvailable = product.stock > 0;
                    }

                    return (
                      <button
                        key={s}
                        onClick={() => isAvailable && setSize(s)}
                        disabled={!isAvailable}
                        className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg transition-all ${size === s
                          ? "border-primary bg-primary text-black shadow-[0_0_20px_rgba(250,204,21,0.3)]"
                          : isAvailable
                            ? "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white bg-neutral-900/50"
                            : "border-neutral-900 text-neutral-700 bg-neutral-900 cursor-not-allowed opacity-50"
                          }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {!size && <p className="text-xs text-red-500 mt-2 animate-pulse">Please select a size</p>}
                {size && typeof product.stock === 'object' && (product.stock as Record<string, number>)[size] < 5 && (product.stock as Record<string, number>)[size] > 0 && (
                  <p className="text-xs text-orange-500 mt-2 font-bold">Only {(product.stock as Record<string, number>)[size]} left!</p>
                )}
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-neutral-900 rounded-xl border border-white/10 h-14">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 rounded-l-xl transition-colors text-xl"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 text-center font-bold text-white bg-transparent outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 rounded-r-xl transition-colors text-xl"
                  >
                    +
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Add to Cart
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Fast Delivery</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Genuine Product</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Easy Returns</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Customer Reviews</h2>
            <Button
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-white text-black hover:bg-gray-200 font-bold"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          </div>
          <ProductReviews productId={product.id} />
        </div>

        {/* Add Review Modal */}
        <AddReviewModal
          productId={product.id}
          productTitle={product.title}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={() => {
            // Reviews will auto-refresh
          }}
        />

        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          category={product.category || 'men'}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl font-bold text-white mb-8">Similar Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} {...prod} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
