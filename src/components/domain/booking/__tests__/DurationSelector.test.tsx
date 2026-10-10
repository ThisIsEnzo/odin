// @vitest-environment jsdom
import React,{useState} from 'react';
import {it,expect,afterEach,vi} from 'vitest';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {NextIntlClientProvider} from 'next-intl';
import messages from '../../../../../messages/en.json';
import {ActivityEditor} from '../ActivityEditor';
import {VisitEstimate} from '../Estimate';
import {experiences} from '@/data/odin/experiences';
import {catalog,activity} from '../../../../../tests/fixtures/pricing';
import type {ActivityBookingItem} from '@/types/domain';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
function Harness(){const [a,setA]=useState<ActivityBookingItem>({...activity('horse-riding',60,2),time:'17:00'});return <><ActivityEditor activity={a} path="items.0" error={()=>undefined} onChange={setA}/><VisitEstimate items={[a]}/></>;}
it('changes duration, clears invalid late time and updates subtotal/total',()=>{vi.spyOn(experiences[0]!,'durationOptions','get').mockReturnValue(catalog[0]!.durationOptions);render(<NextIntlClientProvider locale="en" messages={messages}><Harness/></NextIntlClientProvider>);expect(document.querySelector('.visit-estimate strong')?.textContent).toContain('200');fireEvent.click(screen.getByRole('button',{name:/90 minutes/}));expect(screen.getByRole('button',{name:/90 minutes/}).getAttribute('aria-pressed')).toBe('true');expect((screen.getByLabelText(messages.booking.fields.time) as HTMLSelectElement).value).toBe('');expect(document.querySelector('.visit-estimate strong')?.textContent).toContain('350');expect(document.querySelector('.visit-item-estimate')?.textContent).toContain('350');expect(screen.queryByRole('option',{name:'17:00'})).toBeNull();});
it('shows honest pending duration and estimate without fabricated options',()=>{render(<NextIntlClientProvider locale="en" messages={messages}><Harness/></NextIntlClientProvider>);expect(screen.getByText(messages.booking.pricing.missingTiers)).toBeTruthy();expect(document.querySelectorAll('.duration-choices button')).toHaveLength(0);expect(document.querySelector('.visit-estimate strong')?.textContent).toBe(messages.booking.pricing.pending);expect(screen.getByText(messages.booking.pricing.managerNotice)).toBeTruthy();});
