import { describe, expect, it } from "vitest";
import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";
import { selectOfferPrice } from "@/lib/offer-price";

const byId = (id: string) => experiences.find((experience) => experience.id === id);

describe("selectOfferPrice", () => {
  it("never exposes the mock sauna price, even though duration tiers exist", () => {
    expect(selectOfferPrice(byId("sauna"))).toBeNull();
  });
  it("returns the lowest confirmed horse-riding tier", () => {
    expect(selectOfferPrice(byId("horse-riding"))).toMatchObject({ amount: 1200, currency: "THB", unit: "person" });
  });
  it("returns the lowest confirmed pony-riding tier", () => {
    expect(selectOfferPrice(byId("pony-riding"))).toMatchObject({ amount: 600, currency: "THB", unit: "child" });
  });
  it("does not expose mock package prices", () => {
    expect(selectOfferPrice(undefined, packages[0])).toBeNull();
  });
  it("returns the confirmed base price when no duration tiers are defined", () => {
    const horse = structuredClone(byId("horse-riding")!);
    horse.durationOptions = [];
    expect(selectOfferPrice(horse)?.amount).toBe(horse.price.amount);
  });
});
