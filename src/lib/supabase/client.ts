import { createBrowserClient } from "@supabase/auth-helpers-nextjs"

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (browserClient) return browserClient

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return browserClient
}