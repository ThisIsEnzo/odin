import type { Review } from "@/types/domain";

/**
 * Intentionally empty. No real customer testimonials exist yet, and this
 * phase was explicitly instructed not to fabricate them — fabricated
 * reviews attributed to fictitious customers is a compliance risk, not
 * just a style question. See /docs/MOCK_DATA.md §6.
 *
 * The Review type and this export exist so the homepage's Reviews section
 * can render conditionally — e.g. render nothing, or a "reviews coming
 * soon" state — rather than being blocked on this data shape not existing.
 * Populate only with real, permissioned reviews (isRealTestimonial: true);
 * never add placeholder entries with invented names or quotes here, even
 * temporarily.
 *
 * Source: copied verbatim from odin_phase3_reconcile_reference.md. Not modified.
 */
export const reviews: Review[] = [];
