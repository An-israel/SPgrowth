// Preset church branches/locations offered at signup and in the location prompt.
export const PRESET_LOCATIONS = [
  "Nsukka",
  "Lagos",
  "Abuja",
  "UNEC",
  "Enugu",
  "Calabar",
] as const;

export const OTHER_LOCATION = "Other";

export function isPresetLocation(value: string): boolean {
  return (PRESET_LOCATIONS as readonly string[]).includes(value);
}
