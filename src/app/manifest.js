export default function manifest() {
  return {
    name: 'Gratitude Board - Team Brazil',
    short_name: 'GratitudeBR',
    description: 'Quadro de agradecimentos interativo da FGC Team Brazil.',
    start_url: '/',
    display: 'standalone',
    background_color: '#014627',
    theme_color: '#014627',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
