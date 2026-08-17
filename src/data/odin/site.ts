import type { SiteConfig } from "@/types/domain";

/**
 * Centralized business/contact info. Every field below marked isMock: true
 * MUST be replaced before launch — see /docs/MOCK_DATA.md §2 and §7 for the
 * full pre-launch checklist. Do not read these values as verified.
 */
export const siteConfig: SiteConfig = {
  businessName: "ODIN",
  address: {
    value: "88/8 Rural Road, Nong Prue, Chon Buri, Thailand",
    isMock: true,
    note: "MOCK — placeholder address, confirm before launch",
  },
  phone: {
    value: "+66 81 234 5678",
    isMock: true,
    note: "MOCK — placeholder phone, confirm before launch",
  },
  email: {
    value: "hello@odin-farm.example",
    isMock: true,
    note: "MOCK — .example is a reserved non-production domain, will hard-fail real delivery",
  },
  line: {
    value: "@odinexperience",
    isMock: true,
    note: "MOCK — placeholder LINE ID, confirm before launch",
  },
  whatsapp: {
    value: "+66 81 234 5678",
    isMock: true,
    note: "MOCK — placeholder WhatsApp number, confirm before launch",
  },
  locationDistanceFromPattaya: "20 km",
  defaultLocale: "en",
  supportedLocales: ["en", "th", "ru", "zh"],
  closedWeekdays: [],
  blackoutDates: [],
};
