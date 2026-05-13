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
        '/drafters/*/hire',
      ],
    },
    sitemap: 'https://www.thedraftroom.in/sitemap.xml',
  }
}
