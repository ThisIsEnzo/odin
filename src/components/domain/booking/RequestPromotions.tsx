"use client";
import {useTranslations} from 'next-intl';
import type {Locale} from '@/types/domain';
import type {AppliedPromotion,PromotionSnapshot} from '@/lib/booking/promotions';

export function RequestPromotions({snapshot,locale,money,review=false}:{snapshot?:PromotionSnapshot;locale:Locale;money:(value:number|null)=>string;review?:boolean}) {
  const t=useTranslations('booking.promotions'),all=useTranslations();
  if(!snapshot?.appliedPromotions.length)return null;
  function label(p:AppliedPromotion){return p.labelKey&&all.has(p.labelKey)?all(p.labelKey):p.labels[locale];}
  return <div className={review?'request-promotion-breakdown':'request-package-note'} role={review?undefined:'status'} aria-live={review?undefined:'polite'}>
    {review&&snapshot.subtotalAmount!==null&&<p className="request-help">{t('subtotal')}: {money(snapshot.subtotalAmount)}</p>}
    {snapshot.appliedPromotions.map(p=><p className="request-help" key={p.id}>
      {label(p)}{p.benefit.type==='percentage'?` · ${p.benefit.basisPoints/100}%`:''}
      {' · '}{p.discountAmount===null?t('eligible'):review?`− ${money(p.discountAmount)}`:t('applied')}
    </p>)}
  </div>;
}
