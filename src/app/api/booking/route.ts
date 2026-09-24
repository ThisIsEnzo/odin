import {createBookingHandler} from '@/lib/booking/api';
import {getBookingRuntime} from '@/lib/booking/runtime';
export const runtime='nodejs';
export const POST=createBookingHandler(getBookingRuntime);
