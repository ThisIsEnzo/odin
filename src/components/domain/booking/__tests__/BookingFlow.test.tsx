import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BookingFlow } from "../BookingFlow";

/**
 * next-intl is mocked to a deterministic "namespace.key" translator instead
 * of loading real messages/*.json — this keeps the test focused on UI
 * behaviour (which is what BOOKING_RULES.md/CLAUDE.md's testing intent
 * calls for here) and independent of copy changes. Params are appended so
 * interpolated strings (e.g. weight limits) are still distinguishable.
 */
vi.mock("next-intl", () => ({
  useTranslations:
    (namespace?: string) =>
    (key: string, params?: Record<string, unknown>) => {
      const full = namespace ? `${namespace}.${key}` : key;
      return params ? `${full}(${JSON.stringify(params)})` : full;
    },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

function selectExperience(name: string) {
  fireEvent.click(screen.getByText(`experiences.${name}.title`));
}

function goNext() {
  fireEvent.click(screen.getByText("booking.actions.next"));
}

function fillScheduleStep() {
  const dateInput = document.getElementById("booking-date") as HTMLInputElement;
  const future = new Date();
  future.setDate(future.getDate() + 5);
  fireEvent.change(dateInput, { target: { value: future.toISOString().slice(0, 10) } });

  const timeSelect = document.getElementById("booking-time") as HTMLSelectElement;
  const firstRealOption = timeSelect.options[1]; // index 0 is the disabled placeholder
  fireEvent.change(timeSelect, { target: { value: firstRealOption.value } });
}

function fillCustomerStep() {
  fireEvent.change(document.getElementById("booking-name") as HTMLInputElement, {
    target: { value: "Somchai Test" },
  });
  fireEvent.change(document.getElementById("booking-email") as HTMLInputElement, {
    target: { value: "somchai@example.com" },
  });
  fireEvent.change(document.getElementById("booking-phone") as HTMLInputElement, {
    target: { value: "+66812345678" },
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("BookingFlow — Experience step", () => {
  it("renders all four experiences for selection", () => {
    render(<BookingFlow locale="en" initialExperienceId={null} contextPackageId={null} />);
    expect(screen.getByText("experiences.horseRiding.title")).toBeInTheDocument();
    expect(screen.getByText("experiences.ponyRiding.title")).toBeInTheDocument();
    expect(screen.getByText("experiences.atv.title")).toBeInTheDocument();
    expect(screen.getByText("experiences.sauna.title")).toBeInTheDocument();
  });
});

describe("BookingFlow — conditional weight field", () => {
  function advanceToGuestsStep(experienceKey: string) {
    render(<BookingFlow locale="en" initialExperienceId={null} contextPackageId={null} />);
    selectExperience(experienceKey);
    goNext(); // -> Schedule step
    fillScheduleStep();
    goNext(); // -> Guests step
  }

  it("shows the weight field for Horse Riding", () => {
    advanceToGuestsStep("horseRiding");
    expect(screen.getByText("booking.fields.weight")).toBeInTheDocument();
  });

  it("shows the weight field for Pony Riding", () => {
    advanceToGuestsStep("ponyRiding");
    expect(screen.getByText("booking.fields.weight")).toBeInTheDocument();
  });

  it("does NOT show the weight field for ATV", () => {
    advanceToGuestsStep("atv");
    expect(screen.queryByText("booking.fields.weight")).not.toBeInTheDocument();
  });

  it("does NOT show the weight field for Sauna", () => {
    advanceToGuestsStep("sauna");
    expect(screen.queryByText("booking.fields.weight")).not.toBeInTheDocument();
  });
});

describe("BookingFlow — step gating", () => {
  it("disables Continue until an experience is selected", () => {
    render(<BookingFlow locale="en" initialExperienceId={null} contextPackageId={null} />);
    expect(screen.getByText("booking.actions.next")).toBeDisabled();
    selectExperience("sauna");
    expect(screen.getByText("booking.actions.next")).not.toBeDisabled();
  });

  it("disables Continue on the details step until email is valid", () => {
    render(<BookingFlow locale="en" initialExperienceId="sauna" contextPackageId={null} />);
    goNext(); // Schedule
    fillScheduleStep();
    goNext(); // Guests
    goNext(); // Details
    expect(screen.getByText("booking.actions.next")).toBeDisabled();

    fireEvent.change(document.getElementById("booking-name") as HTMLInputElement, {
      target: { value: "Somchai" },
    });
    fireEvent.change(document.getElementById("booking-email") as HTMLInputElement, {
      target: { value: "not-an-email" },
    });
    fireEvent.change(document.getElementById("booking-phone") as HTMLInputElement, {
      target: { value: "12345678" },
    });
    expect(screen.getByText("booking.actions.next")).toBeDisabled();

    fireEvent.change(document.getElementById("booking-email") as HTMLInputElement, {
      target: { value: "somchai@example.com" },
    });
    expect(screen.getByText("booking.actions.next")).not.toBeDisabled();
  });
});

describe("BookingFlow — submission", () => {
  function advanceToReviewStep() {
    render(<BookingFlow locale="en" initialExperienceId="sauna" contextPackageId={null} />);
    goNext(); // Schedule
    fillScheduleStep();
    goNext(); // Guests
    goNext(); // Details
    fillCustomerStep();
    goNext(); // Review
  }

  it("shows Request Received (not 'confirmed') on a successful API response", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 201,
      json: async () => ({ status: "received", id: "booking-abc-123" }),
    }) as unknown as typeof fetch;

    advanceToReviewStep();
    fireEvent.click(screen.getByText("booking.actions.submit"));

    await waitFor(() => {
      expect(screen.getByText("booking.success.title")).toBeInTheDocument();
    });
    expect(screen.queryByText(/confirmed/i)).not.toBeInTheDocument();
    expect(screen.getByText(/booking-abc-123/)).toBeInTheDocument();
  });

  it("displays a translated field error when the API returns a validation failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      status: 400,
      json: async () => ({
        error: "validation_failed",
        fieldErrors: { "customer.email": { key: "invalidEmail" } },
      }),
    }) as unknown as typeof fetch;

    advanceToReviewStep();
    fireEvent.click(screen.getByText("booking.actions.submit"));

    // A field-level 400 error routes the visitor back to the Details step,
    // where that field's error becomes visible.
    await waitFor(() => {
      expect(screen.getByText("booking.errors.invalidEmail")).toBeInTheDocument();
    });
  });

  it("prevents a duplicate submission while one is in progress", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const pending = new Promise((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(pending);
    global.fetch = fetchMock as unknown as typeof fetch;

    advanceToReviewStep();
    const submitButton = screen.getByText("booking.actions.submit");
    fireEvent.click(submitButton);
    fireEvent.click(submitButton); // second, near-simultaneous click
    fireEvent.click(submitButton); // third, for good measure

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveFetch({ status: 201, json: async () => ({ status: "received", id: "x" }) });
    await waitFor(() => {
      expect(screen.getByText("booking.success.title")).toBeInTheDocument();
    });
  });
});
