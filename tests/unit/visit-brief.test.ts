import { describe, expect, it } from "vitest";
import { bookableExperiences, experiences } from "@/data/odin/experiences";
import { restaurant } from "@/data/odin/restaurant";
import { siteConfig } from "@/data/odin/site";
import { buildVisitFacts } from "@/lib/visit-brief";

describe("buildVisitFacts", () => {
  it("uses the configured distance from Pattaya", () => {
    expect(buildVisitFacts().distance).toBe(siteConfig.locationDistanceFromPattaya);
  });

  it("formats restaurant hours without implying property-wide hours", () => {
    expect(buildVisitFacts().restaurantHours).toBe(
      `${restaurant.operatingHours.open}–${restaurant.operatingHours.close}`,
    );
  });

  it("counts configured bookable experiences", () => {
    expect(buildVisitFacts().experienceCount).toBe(
      bookableExperiences(experiences).length,
    );
    expect(buildVisitFacts().experienceCount).toBeGreaterThan(0);
  });

  it("exposes no contact fields, including mock contact data", () => {
    expect(Object.keys(buildVisitFacts()).sort()).toEqual([
      "distance",
      "experienceCount",
      "restaurantHours",
    ]);
  });
});
