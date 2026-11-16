import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://favify.ktd.one';
  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date('2026-11-16T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
