import { describe, expect, it } from "vitest";

import { experiences } from "@/data/odin/experiences";
import {
  isTimeWithinOperatingHours,
  validateBookingRequest,
  validateExperienceRestrictions,
} from "@/lib/booking/rules";
import type { Experience } from "@/types/domain";

function getExperience(id: string): Experience {
  const experience = experiences.find((candidate) => candidate.id === id);
  if (!experience) throw new Error(`Fixture experience not found: ${id}`);
  return experience;
}

const horse = getExperience("horse-riding");
const pony = getExperience("pony-riding");
const atv = getExperience("atv");
const sauna = getExperience("sauna");

// ---------------------------------------------------------------------------
// Data integrity — the two numbers CLAUDE.md says must never drift silently
// ---------------------------------------------------------------------------

describe("data integrity — confirmed business rules (CLAUDE.md §6/§9)", () => {
  it("horse-riding max weight is exactly 90kg", () => {
    expect(horse.restrictions.maxWeightKg).toBe(90);
  });

  it("pony-riding max weight is exactly 60kg", () => {
    expect(pony.restrictions.maxWeightKg).toBe(60);
  });

  it("operating hours match CLAUDE.md §6/§10 exactly", () => {
    expect(horse.operatingHours).toEqual({ open: "07:00", close: "18:00" });
    expect(pony.operatingHours).toEqual({ open: "07:00", close: "18:00" });
    expect(atv.operatingHours).toEqual({ open: "07:00", close: "20:00" });
    expect(sauna.operatingHours).toEqual({ open: "08:00", close: "21:00" });
  });
});

// ---------------------------------------------------------------------------
// validateExperienceRestrictions — weight (the explicitly requested cases)
// ---------------------------------------------------------------------------

describe("validateExperienceRestrictions — weight", () => {
  it("horse-riding: 90kg is valid (at the maximum, inclusive)", () => {
    expect(validateExperienceRestrictions(90, horse)).toEqual([]);
  });

  it("horse-riding: 91kg is invalid (exceeds maximum)", () => {
    const issues = validateExperienceRestrictions(91, horse);
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("WEIGHT_EXCEEDS_MAXIMUM");
    expect(issues[0].meta).toEqual({ max: 90 });
  });

  it("pony-riding: 60kg is valid (at the maximum, inclusive)", () => {
    expect(validateExperienceRestrictions(60, pony)).toEqual([]);
  });

  it("pony-riding: 61kg is invalid (exceeds maximum)", () => {
    const issues = validateExperienceRestrictions(61, pony);
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("WEIGHT_EXCEEDS_MAXIMUM");
    expect(issues[0].meta).toEqual({ max: 60 });
  });

  it("horse-riding: missing weight is invalid — weight is required for this experience", () => {
    const issues = validateExperienceRestrictions(undefined, horse);
    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("WEIGHT_REQUIRED");
  });

  it("atv: weight is not required, so an absent value is not flagged", () => {
    expect(validateExperienceRestrictions(undefined, atv)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// isTimeWithinOperatingHours — boundary semantics: open inclusive, close exclusive
// ---------------------------------------------------------------------------

describe("isTimeWithinOperatingHours — boundary semantics (see rules.ts doc comment)", () => {
  it("horse-riding: 07:00 (opening) is valid", () => {
    expect(isTimeWithinOperatingHours("07:00", horse.operatingHours)).toBe(true);
  });

  it("horse-riding: 18:00 (closing) is INVALID — close is an exclusive boundary", () => {
    expect(isTimeWithinOperatingHours("18:00", horse.operatingHours)).toBe(false);
  });

  it("horse-riding: 17:59, just before close, is valid", () => {
    expect(isTimeWithinOperatingHours("17:59", horse.operatingHours)).toBe(true);
  });

  it("horse-riding: 06:59, just before open, is invalid", () => {
    expect(isTimeWithinOperatingHours("06:59", horse.operatingHours)).toBe(false);
  });

  it("horse-riding: 19:00, well outside hours, is invalid", () => {
    expect(isTimeWithinOperatingHours("19:00", horse.operatingHours)).toBe(false);
  });

  it("atv: 20:00 (closing) is invalid — outside 07:00–20:00", () => {
    expect(isTimeWithinOperatingHours("20:00", atv.operatingHours)).toBe(false);
  });

  it("atv: 06:00, before opening, is invalid", () => {
    expect(isTimeWithinOperatingHours("06:00", atv.operatingHours)).toBe(false);
  });

  it("sauna: 21:00 (closing) is invalid — outside 08:00–21:00", () => {
    expect(isTimeWithinOperatingHours("21:00", sauna.operatingHours)).toBe(false);
  });

  it("sauna: 07:00, before opening, is invalid", () => {
    expect(isTimeWithinOperatingHours("07:00", sauna.operatingHours)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateBookingRequest — end-to-end orchestration
// ---------------------------------------------------------------------------

describe("validateBookingRequest — end to end", () => {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  it("a valid horse-riding request passes", () => {
    const result = validateBookingRequest(
      { experienceId: "horse-riding", date: futureDate, time: "09:00", guests: 2, weightKg: 80 },
      experiences,
    );
    expect(result.valid).toBe(true);
  });

  it("an unknown experienceId is rejected", () => {
    const result = validateBookingRequest(
      { experienceId: "zipline", date: futureDate, time: "09:00", guests: 1 },
      experiences,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues[0].code).toBe("INVALID_EXPERIENCE");
  });

  it("over-limit weight is rejected even in an otherwise-valid request", () => {
    const result = validateBookingRequest(
      { experienceId: "horse-riding", date: futureDate, time: "09:00", guests: 1, weightKg: 95 },
      experiences,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.some((issue) => issue.code === "WEIGHT_EXCEEDS_MAXIMUM")).toBe(true);
    }
  });

  it("a time at the exclusive closing boundary is rejected", () => {
    const result = validateBookingRequest(
      { experienceId: "horse-riding", date: futureDate, time: "18:00", guests: 1, weightKg: 70 },
      experiences,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.some((issue) => issue.code === "OUTSIDE_OPERATING_HOURS")).toBe(true);
    }
  });

  it("zero guests is rejected", () => {
    const result = validateBookingRequest(
      { experienceId: "sauna", date: futureDate, time: "10:00", guests: 0 },
      experiences,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.some((issue) => issue.code === "INVALID_GUEST_COUNT")).toBe(true);
    }
  });

  it("a past date is rejected", () => {
    const result = validateBookingRequest(
      { experienceId: "sauna", date: "2020-01-01", time: "10:00", guests: 1 },
      experiences,
    );
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues.some((issue) => issue.code === "INVALID_DATE")).toBe(true);
    }
  });
});
