import { describe, it, expect } from "vitest";
import { bookingSchema } from "@/lib/validation/booking.schema";
import { InMemoryBookingRepository } from "@/lib/booking/repository";

const validCustomer = {
  name: "Somchai Test",
  email: "somchai@example.com",
  phone: "+66812345678",
};

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

describe("bookingSchema", () => {
  it("accepts a valid horse-riding booking", () => {
    const result = bookingSchema.safeParse({
      experienceId: "horse-riding",
      date: futureDate(5),
      time: "09:00",
      guests: 2,
      weightKg: 80,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(true);
  });

  it("rejects horse-riding over the 90kg limit", () => {
    const result = bookingSchema.safeParse({
      experienceId: "horse-riding",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      weightKg: 95,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join(".") === "weightKg")).toBe(true);
    }
  });

  it("rejects pony-riding over the 60kg limit", () => {
    const result = bookingSchema.safeParse({
      experienceId: "pony-riding",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      weightKg: 65,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a horse-riding booking missing the required weight", () => {
    const result = bookingSchema.safeParse({
      experienceId: "horse-riding",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join(".") === "weightKg")).toBe(true);
    }
  });

  it("does not require weight for atv (requiresWeight: false)", () => {
    const result = bookingSchema.safeParse({
      experienceId: "atv",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a time outside operating hours (ATV closes at 20:00)", () => {
    const result = bookingSchema.safeParse({
      experienceId: "atv",
      date: futureDate(5),
      time: "21:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a time not aligned to the experience's booking interval", () => {
    // sauna's bookingIntervalMinutes is 30 — 08:15 doesn't align.
    const result = bookingSchema.safeParse({
      experienceId: "sauna",
      date: futureDate(5),
      time: "08:15",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a past date", () => {
    const result = bookingSchema.safeParse({
      experienceId: "sauna",
      date: "2020-01-01",
      time: "09:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid calendar date", () => {
    const result = bookingSchema.safeParse({
      experienceId: "sauna",
      date: "2026-02-30",
      time: "09:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a date beyond the 90-day booking window", () => {
    const result = bookingSchema.safeParse({
      experienceId: "sauna",
      date: futureDate(200),
      time: "09:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid guest count", () => {
    const result = bookingSchema.safeParse({
      experienceId: "atv",
      date: futureDate(5),
      time: "09:00",
      guests: 0,
      customer: validCustomer,
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = bookingSchema.safeParse({
      experienceId: "atv",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      customer: { ...validCustomer, email: "not-an-email" },
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone", () => {
    const result = bookingSchema.safeParse({
      experienceId: "atv",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      customer: { ...validCustomer, phone: "12" },
      locale: "en",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    const result = bookingSchema.safeParse({
      experienceId: "atv",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
      company: "I am a bot",
    });
    expect(result.success).toBe(false);
  });
});

describe("InMemoryBookingRepository", () => {
  it("creates a request with status 'received', an id, and a createdAt", async () => {
    const repo = new InMemoryBookingRepository();
    const created = await repo.create({
      type: "experience",
      experienceOrPackageId: "atv",
      date: futureDate(5),
      time: "09:00",
      guests: 1,
      customer: validCustomer,
      locale: "en",
    });

    expect(created.status).toBe("received");
    expect(created.id).toBeTruthy();
    expect(created.createdAt).toBeTruthy();

    const fetched = await repo.getById(created.id);
    expect(fetched?.id).toBe(created.id);
  });
});
