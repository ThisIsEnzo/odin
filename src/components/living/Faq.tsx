import { useTranslations } from "next-intl";
import { siteConfig } from "@/data/odin/site";
import { faq } from "@/data/odin/faq";
import type { FAQItem } from "@/types/domain";

export function Faq() {
  const t = useTranslations("faq");
  if (!faq.length) return null;

  return (
    <section id="faq" className="le-faq" aria-labelledby="le-faq-title">
      <div className="le-wrap le-faq-grid">
        <div className="le-faq-rail">
          <p className="le-note">07</p>
          <h2 id="le-faq-title" className="le-display">{t("heading")}</h2>
        </div>
        <div className="le-qlist">
          {faq.map((item) => <FaqRow key={item.id} item={item} />)}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ item }: { item: FAQItem }) {
  const t = useTranslations(item.translationNamespace);

  return (
    <details className="le-q">
      <summary>
        <span>{t("question")}</span>
        <i aria-hidden="true">+</i>
      </summary>
      <div className="le-qwrap">
        <div>
          <p>{t("answer", { distance: siteConfig.locationDistanceFromPattaya })}</p>
        </div>
      </div>
    </details>
  );
}
