import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProgramDay } from "@/lib/program";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { LocationGate } from "@/components/location-gate";
import type { DailyContent, UserProgress } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch everything the dashboard needs in parallel — single query each,
  // no N+1: all 21 days of content and all of this user's progress at once.
  const [profileRes, contentRes, progressRes, configRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("daily_content").select("*").order("day_number"),
    supabase.from("user_progress").select("*").eq("user_id", user.id),
    supabase.from("app_config").select("program_start_date").eq("id", 1).single(),
  ]);

  const days = (contentRes.data ?? []) as DailyContent[];
  const progress = (progressRes.data ?? []) as UserProgress[];
  const startDate =
    configRes.data?.program_start_date ?? new Date().toISOString();
  const currentDay = getCurrentProgramDay(startDate);

  return (
    <>
      <LocationGate
        userId={user.id}
        initialLocation={profileRes.data?.location ?? null}
      />
      <DashboardClient
        userId={user.id}
        fullName={profileRes.data?.full_name || "Friend"}
        isAdmin={profileRes.data?.role === "admin"}
        days={days}
        initialProgress={progress}
        currentDay={currentDay}
      />
    </>
  );
}
