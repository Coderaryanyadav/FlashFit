import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://flashfit.in';

    const routes = [
        '',
        '/help',
        '/about',
        '/category/men',
        '/category/women',
        '/category/kids',
        '/category/urban-style',
        '/category/accessories',
        '/category/everyday',
        '/category/last-minute',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    return [...routes];
}
