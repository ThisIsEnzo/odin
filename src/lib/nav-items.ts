/** One shared source for desktop Header, MobileNav and Footer. Only available destinations. */
export const primaryNavItems = [
  { href: "/#experiences", translationKey: "experiences" },
  { href: "/#packages", translationKey: "packages" },
  { href: "/#restaurant", translationKey: "restaurant" },
  { href: "/#gallery", translationKey: "gallery" },
  { href: "/#location", translationKey: "location" },
] as const;
export const footerNavItems = [{ href: "/#faq", translationKey: "faq" }] as const;
// No approved legal content yet: do not publish broken or invented legal destinations.
export const legalNavItems: readonly {href:string;translationKey:string}[] = [];
export const bookNowItem = { href: "/book", translationKey: "bookNow" } as const;
