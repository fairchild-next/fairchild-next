import type { SupabaseClient } from "@supabase/supabase-js";

export type ScheduledAdmissionConfig = {
  time_slots_enabled: boolean;
};

const DEFAULT_CONFIG: ScheduledAdmissionConfig = {
  time_slots_enabled: true,
};

export async function getScheduledAdmissionConfig(
  supabase: SupabaseClient
): Promise<ScheduledAdmissionConfig> {
  const { data } = await supabase
    .from("app_config")
    .select("value")
    .eq("key", "scheduled_admission")
    .single();

  if (!data?.value || typeof data.value !== "object") {
    return DEFAULT_CONFIG;
  }

  const value = data.value as Partial<ScheduledAdmissionConfig>;
  return {
    time_slots_enabled: value.time_slots_enabled !== false,
  };
}
