import {z} from 'zod';
import type {Locale} from '@/types/domain';

const calendarDate = z.string().refine(isCalendarDate, 'Expected YYYY-MM-DD');
export function isCalendarDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function businessDate(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(key=>parts.find(p=>p.type===key)!.value).join('-');
}
const dateCondition = z.object({from:calendarDate.optional(),through:calendarDate.optional(),weekdays:z.array(z.number().int().min(0).max(6)).optional()}).strict();
export const promotionSchema = z.object({
  id:z.string().min(1), enabled:z.boolean(),
  labelKey:z.string().min(1).optional(),
  labels:z.object({en:z.string().min(1),ru:z.string().min(1),th:z.string().min(1),zh:z.string().min(1)}).strict(),
  scope:z.enum(['booking','activity','package']),
  targets:z.object({activityIds:z.array(z.string().min(1)).min(1).optional(),packageIds:z.array(z.string().min(1)).min(1).optional()}).strict().optional(),
  conditions:z.object({
    activityCount:z.object({min:z.number().int().nonnegative(),max:z.number().int().nonnegative().optional(),packageCounting:z.enum(['excluded','one_selection','components'])}).strict().optional(),
    activityCombination:z.array(z.string().min(1)).min(1).optional(),
    visitDate:dateCondition.optional(),bookingDate:dateCondition.optional(),
    // Reserved gate: no redemption path or client coupon input in this MVP.
    requiresPromoCode:z.boolean().optional(),
  }).strict().optional(),
  benefit:z.discriminatedUnion('type',[
    z.object({type:z.literal('percentage'),basisPoints:z.number().int().min(1).max(10000)}).strict(),
    z.object({type:z.literal('fixed_amount'),amountMinor:z.number().int().positive().max(Number.MAX_SAFE_INTEGER),currency:z.literal('THB')}).strict(),
  ]),
  activePeriod:z.object({startsOn:calendarDate.optional(),endsOn:calendarDate.optional(),startsAt:z.iso.datetime({offset:true}).optional(),endsAt:z.iso.datetime({offset:true}).optional()}).strict().optional(),
  stacking:z.enum(['STACKABLE','EXCLUSIVE','BEST_ONLY']),stackingGroup:z.string().min(1).optional(),
  priority:z.number().int().default(0),
}).strict().superRefine((p,ctx)=>{
  if(p.scope==='activity'&&p.targets?.packageIds || p.scope==='package'&&p.targets?.activityIds)ctx.addIssue({code:'custom',message:'Targets must match scope'});
  if(p.conditions?.activityCount?.max!==undefined&&p.conditions.activityCount.max<p.conditions.activityCount.min)ctx.addIssue({code:'custom',message:'Invalid activity count range'});
  for(const range of [p.conditions?.visitDate,p.conditions?.bookingDate])if(range?.from&&range.through&&range.from>range.through)ctx.addIssue({code:'custom',message:'Invalid calendar range'});
  if(p.activePeriod?.startsOn&&p.activePeriod.endsOn&&p.activePeriod.startsOn>p.activePeriod.endsOn)ctx.addIssue({code:'custom',message:'Invalid active dates'});
  if(p.activePeriod?.startsAt&&p.activePeriod.endsAt&&Date.parse(p.activePeriod.startsAt)>Date.parse(p.activePeriod.endsAt))ctx.addIssue({code:'custom',message:'Invalid active instants'});
});
export type Promotion = z.input<typeof promotionSchema>;
type ValidPromotion = z.output<typeof promotionSchema>;
export interface PromotionConfig {version:string; conflictResolution?:'best_price'|'priority'; promotions:readonly Promotion[]}
export const promotionConfigurationSchema = z.object({version:z.string().min(1),conflictResolution:z.enum(['best_price','priority']).optional(),promotions:z.array(promotionSchema)}).strict();
/** Canonical, top-level priced selections only. Package components have no standalone line. */
export interface PromotionLine {id:string;type:'activity'|'package';activityId?:string;packageId?:string;componentActivityIds?:readonly string[];amountMinor:number|null}
export interface AppliedPromotion {
  id:string;labelKey?:string;labels:Record<Locale,string>;scope:Promotion['scope'];
  benefit:Promotion['benefit'];discountAmount:number|null;discountMinor:number|null;lineIds:string[];
}
export interface PromotionSnapshot {
  calculationVersion:'promotions-v1';configurationVersion:string;submissionDate:string;
  subtotalMinor:number|null;discountMinor:number|null;amountMinor:number|null;
  subtotalAmount:number|null;discountAmount:number|null;amount:number|null;appliedPromotions:AppliedPromotion[];
}
/** Exact decimal boundary: no binary float multiplication or implicit rounding. */
export function moneyToMinor(amount:number):number {
  if(!Number.isFinite(amount)||amount<0)throw new Error('Invalid money');
  const match=/^(\d+)(?:\.(\d{1,2}))?$/.exec(String(amount));
  if(!match)throw new Error('Money must be an exact THB amount with at most two decimals');
  return safeNumber(BigInt(match[1]!)*100n+BigInt((match[2]??'').padEnd(2,'0')));
}
function safeNumber(value:bigint):number {if(value<0n||value>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('Money exceeds safe range');return Number(value);}
function dateMatches(date:string|undefined,condition:z.infer<typeof dateCondition>|undefined):boolean {
  if(!condition)return true;
  if(!date||!isCalendarDate(date))return false;
  return (!condition.from||date>=condition.from)&&(!condition.through||date<=condition.through)&&
    (!condition.weekdays||condition.weekdays.includes(new Date(date+'T00:00:00Z').getUTCDay()));
}
function targeted(p:ValidPromotion,line:PromotionLine):boolean {
  if(p.scope!=='booking'&&p.scope!==line.type)return false;
  const t=p.targets;
  if(!t)return true;
  return line.type==='activity'?(!t.activityIds&&!t.packageIds||!!line.activityId&&!!t.activityIds?.includes(line.activityId)):
    (!t.activityIds&&!t.packageIds||!!line.packageId&&!!t.packageIds?.includes(line.packageId));
}
function eligible(p:ValidPromotion,lines:readonly PromotionLine[],visitDate:string|undefined,now:Date):boolean {
  if(!p.enabled||p.conditions?.requiresPromoCode)return false;
  const today=businessDate(now),a=p.activePeriod,c=p.conditions;
  if(a&&((a.startsOn&&today<a.startsOn)||(a.endsOn&&today>a.endsOn)||(a.startsAt&&now.getTime()<Date.parse(a.startsAt))||(a.endsAt&&now.getTime()>Date.parse(a.endsAt))))return false;
  if(!dateMatches(visitDate,c?.visitDate)||!dateMatches(today,c?.bookingDate))return false;
  if(!lines.some(l=>targeted(p,l)))return false;
  const standalone=new Set(lines.filter(l=>l.type==='activity').map(l=>l.activityId!));
  // Combinations mean standalone selected activities, never hidden package components.
  if(c?.activityCombination?.some(id=>!standalone.has(id)))return false;
  if(c?.activityCount){
    const eligibleLines=lines.filter(l=>targeted({...p,scope:'booking'},l));
    const ids=new Set(eligibleLines.filter(l=>l.type==='activity').map(l=>l.activityId!));
    let count=ids.size;
    if(c.activityCount.packageCounting==='one_selection')count+=eligibleLines.filter(l=>l.type==='package').length;
    if(c.activityCount.packageCounting==='components'){
      for(const l of eligibleLines.filter(l=>l.type==='package'))for(const id of l.componentActivityIds??[])ids.add(id);
      count=ids.size;
    }
    if(count<c.activityCount.min||c.activityCount.max!==undefined&&count>c.activityCount.max)return false;
  }
  return true;
}
function compatible(a:ValidPromotion,b:ValidPromotion):boolean {
  if(a.stacking==='EXCLUSIVE'||b.stacking==='EXCLUSIVE')return false;
  if(a.stackingGroup&&a.stackingGroup===b.stackingGroup&&(a.stacking==='BEST_ONLY'||b.stacking==='BEST_ONLY'))return false;
  // Ungrouped BEST_ONLY offers form one global best-only group.
  return !(a.stacking==='BEST_ONLY'&&b.stacking==='BEST_ONLY'&&!a.stackingGroup&&!b.stackingGroup);
}
const stage=(p:ValidPromotion)=>p.scope==='booking'?1:0;
const order=(a:ValidPromotion,b:ValidPromotion)=>stage(a)-stage(b)||b.priority-a.priority||a.id.localeCompare(b.id,'en');
function runPlan(plan:ValidPromotion[],lines:readonly PromotionLine[]) {
  const remaining=lines.map(l=>l.amountMinor===null?null:BigInt(l.amountMinor));
  const applied:AppliedPromotion[]=[];
  let saving=0n;
  for(const p of [...plan].sort(order)){
    const indices=lines.flatMap((l,i)=>targeted(p,l)?[i]:[]);
    const known=indices.every(i=>remaining[i]!==null);
    const base=known?indices.reduce((sum,i)=>sum+remaining[i]!,0n):null;
    let discount:bigint|null=null;
    if(base!==null){
      discount=p.benefit.type==='percentage'?(base*BigInt(p.benefit.basisPoints)+5000n)/10000n:BigInt(p.benefit.amountMinor);
      if(discount>base)discount=base;
      // Proportional floor allocation; remaining minor units go by stable line ID.
      let allocated=0n;
      const cuts=new Map<number,bigint>();
      for(const i of indices){const cut=base?discount*remaining[i]!/base:0n;cuts.set(i,cut);allocated+=cut;}
      for(const i of [...indices].sort((a,b)=>lines[a]!.id.localeCompare(lines[b]!.id,'en'))){if(allocated>=discount)break;if(cuts.get(i)!<remaining[i]!){cuts.set(i,cuts.get(i)!+1n);allocated++;}}
      for(const i of indices)remaining[i]=remaining[i]!-cuts.get(i)!;
    }else{
      // An unknown targeted base makes subsequent offers on those lines unknown too.
      for(const i of indices)remaining[i]=null;
    }
    if(discount===0n)continue;
    if(discount!==null)saving+=discount;
    applied.push({id:p.id,labels:{...p.labels},...(p.labelKey?{labelKey:p.labelKey}:{}),scope:p.scope,benefit:{...p.benefit},discountAmount:discount===null?null:safeNumber(discount)/100,discountMinor:discount===null?null:safeNumber(discount),lineIds:indices.map(i=>lines[i]!.id).sort()});
  }
  const total=remaining.every(n=>n!==null)?remaining.reduce<bigint>((sum,n)=>sum+n!,0n):null;
  const pending=plan.filter(p=>applied.some(a=>a.id===p.id&&a.discountAmount===null));
  return {applied,total,saving,pending};
}
/** Small bounded exact search, so conflicts compare the final customer price, not array order. */
export function calculatePromotions(lines:readonly PromotionLine[],visitDate:string|undefined,now:Date,config:PromotionConfig):PromotionSnapshot {
  if(!config.version||!Number.isFinite(now.getTime()))throw new Error('Invalid promotion context');
  if(lines.some(l=>!l.id||l.type==='activity'&&!l.activityId||l.type==='package'&&!l.packageId||l.amountMinor!==null&&(!Number.isSafeInteger(l.amountMinor)||l.amountMinor<0)))throw new Error('Invalid canonical promotion lines');
  if(new Set(lines.map(l=>l.id)).size!==lines.length)throw new Error('Duplicate canonical line');
  const checked=promotionConfigurationSchema.parse(config);
  const parsed=checked.promotions;
  if(new Set(parsed.map(p=>p.id)).size!==parsed.length)throw new Error('Duplicate promotion ID');
  const offers=parsed.filter(p=>eligible(p,lines,visitDate,now)).sort(order);
  if(offers.length>16)throw new Error('At most 16 matching promotions supported by MVP');
  let best=runPlan([],lines),bestPlan:ValidPromotion[]=[];
  function prefer(plan:ValidPromotion[],result:ReturnType<typeof runPlan>):boolean {
    const priorities=(xs:ValidPromotion[])=>xs.map(p=>p.priority).sort((a,b)=>b-a);
    if(checked.conflictResolution==='priority'&&plan.length&&bestPlan.length){
      const a=priorities(plan),b=priorities(bestPlan);
      for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]??0)-(b[i]??0);if(d)return d>0;}
    }
    if(result.saving!==best.saving)return result.saving>best.saving;
    // Unknown bases cannot produce a numeric best price. Prefer explicit priority;
    // compare like benefits, otherwise stable ID. Keep eligible fixed offers visible too.
    if(result.pending.length!==best.pending.length)return result.pending.length>best.pending.length;
    for(let i=0;i<result.pending.length;i++){
      const a=result.pending[i]!,b=best.pending[i]!;
      if(a.priority!==b.priority)return a.priority>b.priority;
      if(a.benefit.type===b.benefit.type){
        const av=a.benefit.type==='percentage'?a.benefit.basisPoints:a.benefit.amountMinor;
        const bv=b.benefit.type==='percentage'?b.benefit.basisPoints:b.benefit.amountMinor;
        if(av!==bv)return av>bv;
      }
      if(a.id!==b.id)return a.id.localeCompare(b.id,'en')<0;
    }
    if(plan.length!==bestPlan.length)return plan.length<bestPlan.length;
    return plan.map(p=>p.id).sort().join('|')<bestPlan.map(p=>p.id).sort().join('|');
  }
  function search(index:number,plan:ValidPromotion[]){if(index===offers.length){const result=runPlan(plan,lines);if(prefer(plan,result)){best=result;bestPlan=[...plan];}return;}search(index+1,plan);const p=offers[index]!;if(plan.every(q=>compatible(p,q)))search(index+1,[...plan,p]);}
  search(0,[]);
  const subtotal=lines.length&&lines.every(l=>l.amountMinor!==null)?lines.reduce((sum,l)=>sum+BigInt(l.amountMinor!),0n):null;
  return {calculationVersion:'promotions-v1',configurationVersion:checked.version,submissionDate:businessDate(now),subtotalMinor:subtotal===null?null:safeNumber(subtotal),discountMinor:subtotal===null||best.total===null?null:safeNumber(subtotal-best.total),amountMinor:subtotal===null||best.total===null?null:safeNumber(best.total),subtotalAmount:subtotal===null?null:safeNumber(subtotal)/100,discountAmount:subtotal===null||best.total===null?null:safeNumber(subtotal-best.total)/100,amount:subtotal===null||best.total===null?null:safeNumber(best.total)/100,appliedPromotions:best.applied};
}
