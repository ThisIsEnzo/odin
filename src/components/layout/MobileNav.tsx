"use client";

import { BrandLogo } from "./BrandLogo";
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
          className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-button p-2 text-text-on-accent hover:bg-brand-cream/20 xl:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cream"
        >
          <Menu aria-hidden="true" className="h-6 w-6" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40 xl:hidden" />
        <Dialog.Content
          aria-label={tCommon("mobileMenuLabel")} aria-describedby={undefined}
          className="ground-menu fixed inset-y-0 right-0 z-50 flex w-full max-w-lg overflow-y-auto flex-col gap-8 bg-canvas p-6 sm:p-10 xl:hidden"
        >
          <div className="ground-menu-heading brand-material -mx-6 -mt-6 flex items-center justify-between px-6 py-5 sm:-mx-10 sm:-mt-10 sm:px-10">
            <BrandLogo className="ground-menu-logo" />
            <Dialog.Title className="sr-only">
              {tCommon("menu")}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={tCommon("closeMenu")}
                className="min-h-11 min-w-11 rounded-button p-2 text-text-on-accent hover:bg-brand-cream/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cream"
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
                className="border-b border-ink/15 py-4 text-2xl font-medium tracking-tight text-ink hover:text-brand-primary"
              >
                {t(item.translationKey)}
              </Link>
            ))}
          </nav>

          
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
