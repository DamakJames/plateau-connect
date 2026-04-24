import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/**
 * Guard that ensures the current session belongs to an admin.
 * Use inside `beforeLoad` of any admin-only route.
 */
export async function requireAdmin() {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) {
    throw redirect({ to: "/login" });
  }
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: session.user.id,
    _role: "admin",
  });
  if (error || !data) {
    throw redirect({ to: "/home" });
  }
}
