import { experiences, bookableExperiences } from "@/data/odin/experiences";
import { restaurant } from "@/data/odin/restaurant";
import { siteConfig } from "@/data/odin/site";

export type VisitFacts = {
  distance: string;
  restaurantHours: string;
  experienceCount: number;
};

/**
 * Facts for the early visit summary. Hours are explicitly restaurant hours;
 * age restrictions and mock contact details are deliberately excluded.
 */
export function buildVisitFacts(): VisitFacts {
  return {
    distance: siteConfig.locationDistanceFromPattaya,
    restaurantHours: `${restaurant.operatingHours.open}–${restaurant.operatingHours.close}`,
    experienceCount: bookableExperiences(experiences).length,
  };
}
