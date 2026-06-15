import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProgramDay } from "@/lib/program";
import { AdminClient } from "@/components/admin/admin-client";
import { LocationGate } from "@/components/location-gate";
import type {
  DailyContent,
  FinalGrowthPlan,
  Profile,
  UserProgress,
} from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Middleware already guards this route, but double-check the role here.
  const { data: me } = await supabase
    .from("profiles")
    .select("role, location")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/dashboard");

  const [profilesRes, progressRes, contentRes, plansRes, configRes] =
    await Promise.all([
      supabase.from("profiles").select("*").order("created_at"),
      supabase.from("user_progress").select("*"),
      supabase.from("daily_content").select("*").order("day_number"),
      supabase.from("final_growth_plan").select("*"),
      supabase
        .from("app_config")
        .select("program_start_date")
        .eq("id", 1)
        .single(),
    ]);

  const startDate =
    configRes.data?.program_start_date ?? new Date().toISOString();

  return (
    <>
      <LocationGate userId={user.id} initialLocation={me?.location ?? null} />
      <AdminClient
        currentUserId={user.id}
        profiles={(profilesRes.data ?? []) as Profile[]}
        progress={(progressRes.data ?? []) as UserProgress[]}
        days={(contentRes.data ?? []) as DailyContent[]}
        plans={(plansRes.data ?? []) as FinalGrowthPlan[]}
        programStartDate={startDate}
        currentDay={getCurrentProgramDay(startDate)}
      />
    </>
  );
}
