"use client";
import {useTranslations} from 'next-intl';
import type {Locale} from '@/types/domain';
import type {AppliedPromotion,PromotionSnapshot} from '@/lib/booking/promotions';

export function RequestPromotions({snapshot,locale,money,review=false}:{snapshot?:PromotionSnapshot;locale:Locale;money:(value:number|null)=>string;review?:boolean}) {
  const t=useTranslations('booking.promotions'),all=useTranslations();
  if(!snapshot?.appliedPromotions.length)return null;
  function label(p:AppliedPromotion){return p.labelKey&&all.has(p.labelKey)?all(p.labelKey):p.labels[locale];}
  return <div className="request-promotions" role={review?undefined:'status'} aria-live={review?undefined:'polite'}>
    {snapshot.appliedPromotions.map(p=><div className="request-promotion" key={p.id}>
      <div><p className="request-promotion-label">{label(p)}</p>
        <p className="request-promotion-status">{p.status==='ELIGIBLE'||p.discountAmount===null?t('eligible'):t('applied')}</p></div>
      <div className="request-promotion-benefit">
        {p.benefit.type==='percentage'&&<span className="promotion-tag">{p.benefit.basisPoints/100}%</span>}
        {p.status==='APPLIED'&&p.discountAmount!==null&&<span className="request-discount">− {money(p.discountAmount)}</span>}
      </div>
    </div>)}
  </div>;
}
