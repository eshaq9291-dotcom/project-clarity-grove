import { createFileRoute } from '@tanstack/react-router'
import { JoodSecretAdmin } from '@/pages/JoodSecretAdmin'

export const Route = createFileRoute('/jood-secret-2024-admin')({
  head: () => ({ meta: [{ title: 'إدارة منتجات جود | JOOD' }, { name: 'description', content: 'إدارة منتجات جود الخاصة بالمالك.' }, { property: 'og:title', content: 'إدارة جود | JOOD' }, { property: 'og:description', content: 'لوحة إدارة المنتجات الخاصة.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }, { name: 'robots', content: 'noindex' }] }),
  component: JoodSecretAdmin,
})
