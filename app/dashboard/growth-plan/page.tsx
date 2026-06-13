import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GrowthPlanForm } from "@/components/dashboard/growth-plan-form";
import type { FinalGrowthPlan } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function GrowthPlanPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data } = await supabase
    .from("final_growth_plan")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <GrowthPlanForm
      userId={user.id}
      initialPlan={(data as FinalGrowthPlan) ?? null}
    />
  );
}
