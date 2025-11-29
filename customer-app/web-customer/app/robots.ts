import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/checkout', '/orders', '/account'],
        },
        sitemap: 'https://flashfit.in/sitemap.xml',
    };
}
