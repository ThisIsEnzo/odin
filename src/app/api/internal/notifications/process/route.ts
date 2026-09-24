import {NextResponse} from 'next/server';
import {authorizedProcessor} from '@/lib/booking/internal-auth';
import {getBookingRuntime} from '@/lib/booking/runtime';
export const runtime='nodejs';
export async function POST(req:Request){
 if(!authorizedProcessor(req.headers.get('authorization'),process.env.NOTIFICATION_PROCESS_SECRET??''))return NextResponse.json({error:'unauthorized'},{status:401});
 try{return NextResponse.json(await getBookingRuntime().process(),{headers:{'Cache-Control':'no-store'}});}
 catch{console.error('[outbox] processing unavailable');return NextResponse.json({error:'processing_unavailable'},{status:503});}
}
