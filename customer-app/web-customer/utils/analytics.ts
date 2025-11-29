// Product view tracking using cookies
export interface ViewedProduct {
    id: string;
    title: string;
    category?: string;
    timestamp: number;
}

const COOKIE_NAME = 'flashfit_viewed';
const MAX_VIEWED_ITEMS = 20;

export function trackProductView(product: { id: string; title: string; category?: string }) {
    if (typeof window === 'undefined') return;

    const viewed = getViewedProducts();
    const newItem: ViewedProduct = {
        id: product.id,
        title: product.title,
        category: product.category,
        timestamp: Date.now()
    };

    // Remove if already exists and add to front
    const filtered = viewed.filter(v => v.id !== product.id);
    const updated = [newItem, ...filtered].slice(0, MAX_VIEWED_ITEMS);

    localStorage.setItem(COOKIE_NAME, JSON.stringify(updated));
}

export function getViewedProducts(): ViewedProduct[] {
    if (typeof window === 'undefined') return [];

    try {
        const data = localStorage.getItem(COOKIE_NAME);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function getRecommendations(currentProductId?: string): string[] {
    const viewed = getViewedProducts();

    // Filter out current product and get unique categories
    const categories = viewed
        .filter(v => v.id !== currentProductId)
        .map(v => v.category)
        .filter((c, i, arr) => c && arr.indexOf(c) === i);

    return categories.slice(0, 3) as string[];
}

export function clearViewHistory() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(COOKIE_NAME);
}
