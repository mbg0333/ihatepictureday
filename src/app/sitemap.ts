import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ihatepictureday.com'; // Your production URL
  
  const routes = [
    '',
    '/services',
    '/how-it-works',
    '/faq',
    '/booking',
    '/galleries',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/galleries' ? 'weekly' : 'monthly',
    priority: route === '' ? 1.0 : route === '/booking' ? 0.9 : 0.8,
  }));
}
