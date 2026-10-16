import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ihatepictureday.com'; // Your production URL
  
  const routes = [
    '',
    '/opt-in',
    '/services',
    '/how-it-works',
    '/faq',
    '/booking',
    '/galleries',
    '/privacy-policy',
    '/terms-of-service',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/galleries' || route === '/opt-in' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route === '/booking' || route === '/opt-in' ? 0.9 : 0.8,
  }));
}
