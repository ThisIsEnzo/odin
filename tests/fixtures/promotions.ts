// UNCONFIRMED EXAMPLES / TEST FIXTURES ONLY. Never import into production configuration.
import type {Promotion,PromotionConfig,PromotionLine} from '@/lib/booking/promotions';
export const labels={en:'Test offer',ru:'Тестовое предложение',th:'ข้อเสนอทดสอบ',zh:'测试优惠'};
export function offer(id:string,overrides:Partial<Promotion>={}):Promotion {
  return {id,enabled:true,labels,scope:'booking',benefit:{type:'percentage',basisPoints:500},stacking:'STACKABLE',...overrides};
}
export const twoActivities=offer('test-two',{conditions:{activityCount:{min:2,packageCounting:'excluded'}},stacking:'BEST_ONLY',stackingGroup:'multi-activity'});
export const threeActivities=offer('test-three',{conditions:{activityCount:{min:3,packageCounting:'excluded'}},benefit:{type:'percentage',basisPoints:1000},stacking:'BEST_ONLY',stackingGroup:'multi-activity'});
export const wednesday=offer('test-wednesday',{scope:'package',targets:{packageIds:['test-all-inclusive']},conditions:{visitDate:{weekdays:[3]}},benefit:{type:'percentage',basisPoints:2000}});
export const bookToday=offer('test-book-today',{scope:'package',targets:{packageIds:['test-basic']},conditions:{bookingDate:{from:'2026-10-11',through:'2026-10-11'}},benefit:{type:'percentage',basisPoints:1000}});
export function config(...promotions:Promotion[]):PromotionConfig{return {version:'test-fixtures-v1',promotions};}
export function line(id='horse-riding',amountMinor:number|null=10000):PromotionLine{return {id,type:'activity',activityId:id,amountMinor};}
export function packageLine(id='test-all-inclusive',amountMinor:number|null=50000):PromotionLine{return {id,type:'package',packageId:id,componentActivityIds:['horse-riding','atv','sauna'],amountMinor};}
