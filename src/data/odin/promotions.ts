import type {PromotionConfig} from '@/lib/booking/promotions';
/** Business-authoritative config. No client-approved promotions exist yet.
 * Examples live ONLY in tests/fixtures/promotions.ts. Never enable them here by inference.
 */
export const promotionConfig: PromotionConfig = {version:'no-confirmed-promotions-v1',promotions:[]};
