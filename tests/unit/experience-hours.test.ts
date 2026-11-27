import { describe, expect, it } from "vitest";
import { experiences } from "@/data/odin/experiences";
import { confirmedHours } from "@/lib/experience-hours";

const byId = (id: string) => experiences.find((experience) => experience.id === id);

describe("confirmedHours", () => {
  it("returns confirmed horse-riding hours", () => {
    expect(confirmedHours(byId("horse-riding"))).toEqual({ open: "07:00", close: "18:00" });
  });
  it("returns confirmed pony-riding hours", () => {
    expect(confirmedHours(byId("pony-riding"))).toEqual({ open: "07:00", close: "18:00" });
  });
  it("hides unconfirmed ATV hours", () => {
    expect(confirmedHours(byId("atv"))).toBeNull();
  });
  it("hides unconfirmed sauna hours", () => {
    expect(confirmedHours(byId("sauna"))).toBeNull();
  });
});
