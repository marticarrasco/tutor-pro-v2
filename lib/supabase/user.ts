import type { SupabaseClient } from "@supabase/supabase-js"

export async function requireAuthUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error("User is not authenticated")
  }

  return user
}
