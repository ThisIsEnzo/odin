import type { Experience, OperatingHours } from "@/types/domain";

/** Hours are public only after explicit confirmation in canonical data. */
export function confirmedHours(experience?: Experience): OperatingHours | null {
  return experience?.hoursConfirmed === true ? experience.operatingHours : null;
}
