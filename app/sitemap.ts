import type { MetadataRoute } from 'next'
import { createServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://makhboz.net'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/join`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return staticPages
  }

  const supabase = createServerClient()
  const { data: bakers } = await supabase
    .from('bakers')
    .select('username, updated_at')
    .eq('is_active', true)

  const bakerPages: MetadataRoute.Sitemap = (bakers ?? []).map((baker) => ({
    url: `${baseUrl}/${baker.username}`,
    lastModified: baker.updated_at ? new Date(baker.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...bakerPages]
}
