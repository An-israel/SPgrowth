import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GrowthPlanForm } from "@/components/dashboard/growth-plan-form";
import { LocationGate } from "@/components/location-gate";
import type { FinalGrowthPlan } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function GrowthPlanPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [planRes, profileRes] = await Promise.all([
    supabase
      .from("final_growth_plan")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("profiles").select("location").eq("id", user.id).single(),
  ]);

  return (
    <>
      <LocationGate
        userId={user.id}
        initialLocation={profileRes.data?.location ?? null}
      />
      <GrowthPlanForm
        userId={user.id}
        initialPlan={(planRes.data as FinalGrowthPlan) ?? null}
      />
    </>
  );
}
