import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/contracts',
        '/applications',
        '/profile',
        '/post-project',
        '/draftsmen/*/hire',
      ],
    },
    sitemap: 'https://draftroom.in/sitemap.xml',
  }
}
