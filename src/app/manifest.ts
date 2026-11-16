import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Favify — Icon, Favicon & Web Manifest Studio',
    short_name: 'Favify',
    description:
      'One mark, every tab and home screen — crafted in seconds. Free 100% client-side favicon, iOS AppIcon, Android maskable icon, and PWA manifest generator.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f6f8',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
