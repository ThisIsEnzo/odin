import { describe, expect, it } from "vitest";
import { offerPrice, confirmedHours, durationLabel } from "@/lib/offer";
import { experiences } from "@/data/odin/experiences";
import { packages } from "@/data/odin/packages";

const by = (id: string) => experiences.find((experience) => experience.id === id);

describe("offer trust and display helpers", () => {
  it("never exposes the mock sauna price", () => {
    expect(offerPrice(by("sauna"))).toBeNull();
  });

  it("returns the lowest confirmed horse-riding price", () => {
    expect(offerPrice(by("horse-riding"))).toMatchObject({
      amount: 1200,
      currency: "THB",
      unit: "person",
    });
  });

  it("never exposes mock package prices", () => {
    expect(offerPrice(undefined, packages[0])).toBeNull();
  });

  it("shows only explicitly confirmed horse-riding hours", () => {
    expect(confirmedHours(by("horse-riding"))).toEqual({ open: "07:00", close: "18:00" });
  });

  it("hides unconfirmed ATV and sauna hours", () => {
    expect(confirmedHours(by("atv"))).toBeNull();
    expect(confirmedHours(by("sauna"))).toBeNull();
  });

  it("uses configured duration options, not booking interval", () => {
    expect(durationLabel(by("horse-riding")!)).toEqual([60, 90, 120]);
    expect(durationLabel(by("atv")!)).toEqual([30, 60]);
  });
});
