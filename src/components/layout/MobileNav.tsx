"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { primaryNavItems, bookNowItem } from "@/lib/nav-items";
import { buttonVariants } from "@/components/ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={tCommon("openMenu")}
          className="inline-flex items-center justify-center rounded-button p-2 text-ink hover:bg-moss/10 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 md:hidden" />
        <Dialog.Content
          aria-label={tCommon("mobileMenuLabel")}
          className="fixed inset-y-0 right-0 z-50 flex w-[85%] max-w-sm flex-col gap-6 bg-canvas p-6 shadow-xl md:hidden"
        >
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-lg text-ink">
              {tCommon("menu")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={tCommon("closeMenu")}
                className="rounded-button p-2 hover:bg-moss/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss"
              >
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label={tCommon("primaryNavigation")} className="flex flex-col gap-1">
            {primaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-button px-3 py-3 text-base text-ink hover:bg-moss/10"
              >
                {t(item.translationKey)}
              </Link>
            ))}
          </nav>

          {/* Prominent, reachable Book Now CTA — CLAUDE.md §19/§29 */}
          <Link
            href={bookNowItem.href}
            onClick={() => setOpen(false)}
            className={buttonVariants({ variant: "primary", size: "lg", className: "mt-auto w-full" })}
          >
            {t(bookNowItem.translationKey)}
          </Link>

          <LanguageSwitcher />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
