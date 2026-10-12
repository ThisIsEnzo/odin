import type {Package} from "@/types/domain";
/** Confirmed composition. Existing fixed package pricing remains unconfirmed.
 * Durations are deliberately absent. Configure approved durations before quoting.
 * discounts default to EXCLUSIVE: stacking requires an explicit business decision.
 */
export const packages: Package[] = [
  {id:"all-inclusive",slug:"all-inclusive",translationNamespace:"packages.allInclusive",
   includedExperienceIds:["horse-riding","atv","sauna"],includesRestaurant:false,
   components:[{activityId:"horse-riding",guestCount:1},{activityId:"atv",guestCount:1,unitCount:1},{activityId:"sauna",guestCount:1}],
   pricingMode:"fixed",discountPercent:0,estimateBasis:"package",
   price:{amount:0,currency:"THB",unit:"activity"},mock:{isMock:true,note:"Fixed package price and durations pending business confirmation"}},
  {id:"adventure-day",slug:"adventure-day",translationNamespace:"packages.adventureDay",
   includedExperienceIds:["atv","horse-riding"],includesRestaurant:false,
   components:[{activityId:"atv",guestCount:1,unitCount:1},{activityId:"horse-riding",guestCount:1}],
   pricingMode:"fixed",discountPercent:0,estimateBasis:"package",
   price:{amount:0,currency:"THB",unit:"activity"},mock:{isMock:true,note:"Fixed package price and durations pending business confirmation"}},
  {id:"couple-escape",slug:"couple-escape",translationNamespace:"packages.coupleEscape",
   includedExperienceIds:["horse-riding","sauna"],includesRestaurant:false,
   components:[{activityId:"horse-riding",guestCount:2},{activityId:"sauna",guestCount:1}],
   pricingMode:"fixed",discountPercent:0,estimateBasis:"package",
   price:{amount:0,currency:"THB",unit:"couple"},mock:{isMock:true,note:"Fixed package price, Sauna guests and durations pending business confirmation"}},
];
