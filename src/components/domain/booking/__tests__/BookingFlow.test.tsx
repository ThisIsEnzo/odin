// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../../../messages/en.json";
import { BookingFlow } from "../BookingFlow";

vi.mock("next/image", () => ({ default: ({alt,src}: {alt:string;src:string}) => <img alt={alt} src={src}/> }));
vi.mock("@/i18n/navigation", () => ({Link: ({href,children}: {href:string;children:React.ReactNode}) => <a href={href}>{children}</a>}));
afterEach(cleanup);
function setup() { render(<NextIntlClientProvider locale="en" messages={messages}><BookingFlow locale="en" initialExperienceId={null} contextPackageId={null}/></NextIntlClientProvider>); }
function add(name:string) {fireEvent.click(screen.getByRole("button",{name:`Add to your visit: ${name}`}));}
describe("Booking V2 visit presentation",()=>{
 it("starts with a clear empty visit and four experience choices",()=>{setup();expect(screen.getAllByText(messages.booking.ux.empty).length).toBeGreaterThan(0);expect(screen.getAllByRole("button",{name:/Add to your visit:/}).length).toBeGreaterThanOrEqual(4);});
 it("adds an activity and opens exactly one editor",()=>{setup();add("ATV");expect(document.querySelectorAll(".visit-entry")).toHaveLength(1);expect(document.querySelectorAll(".visit-editor")).toHaveLength(1);expect(screen.getByRole("status").textContent).toContain("added to your visit");});
 it("shows an unmistakable added state when returning to discovery",()=>{setup();add("ATV");fireEvent.click(document.querySelector(".visit-add-another")!);expect(document.querySelector(".discovery-actions button")).toBeTruthy();expect(screen.getByText("Added to your visit · 1")).toBeTruthy();});
 it("preserves earlier activities when adding another",()=>{setup();add("ATV");fireEvent.click(document.querySelector(".visit-add-another")!);add("Sauna");expect(document.querySelectorAll(".visit-entry")).toHaveLength(2);expect(document.querySelectorAll(".visit-editor")).toHaveLength(1);});
 it("duplicates with a separate itinerary entry",()=>{setup();add("ATV");fireEvent.click(screen.getByRole("button",{name:"Duplicate: ATV"}));expect(document.querySelectorAll(".visit-entry")).toHaveLength(2);expect(document.querySelectorAll(".visit-editor")).toHaveLength(1);});
 it("removes an item without leaving its editor",()=>{setup();add("ATV");fireEvent.click(screen.getByRole("button",{name:"Remove: ATV"}));expect(document.querySelectorAll(".visit-entry")).toHaveLength(0);expect(document.querySelectorAll(".visit-editor")).toHaveLength(0);});
 it("blocks progression for an incomplete itinerary",()=>{setup();add("ATV");fireEvent.click(screen.getByRole("button",{name:/Continue to your details/}));expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);expect(document.querySelector(".visit-editor")).toBeTruthy();});
 it("announces editing through the edit button expanded state",()=>{setup();add("ATV");const edit=document.querySelector(".visit-entry-actions button")!;expect(edit.getAttribute("aria-expanded")).toBe("true");fireEvent.click(edit);expect(edit.getAttribute("aria-expanded")).toBe("false");});
});
