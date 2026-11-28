import { useTranslations } from "next-intl";
import { reviews } from "@/data/odin/reviews";

export function GuestStories() {
  const t = useTranslations("reviews");
  const real = reviews.filter((review) => review.isRealTestimonial);

  return (
    <section id="stories" className="le-guest" aria-labelledby="le-guest-title">
      <div className="le-wrap">
        {real.length > 0 ? (
          <>
            <p className="le-note">06</p>
            <h2 id="le-guest-title" className="le-display">{t("heading")}</h2>
            <ul className="le-guest-list">
              {real.map((review) => (
                <li className="le-guest-entry" key={review.id}>
                  <p className="le-guest-stars" aria-label={`${review.rating} out of 5 stars`}>
                    <span aria-hidden="true">{"★".repeat(review.rating)}</span>
                  </p>
                  <p className="le-guest-author">{review.authorName}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="le-guest-empty">
            <span className="le-guest-mark" aria-hidden="true">&ldquo;</span>
            <div>
              <p className="le-note">{t("heading")}</p>
              <h2 id="le-guest-title" className="le-display">{t("comingSoonTitle")}</h2>
              <p className="le-body">{t("comingSoonBody")}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
