// Integration-test helper: prints only a digest, never customer data.
import {createHash} from 'node:crypto';
import {openDatabase} from '../src/lib/db/client';
import {PostgresBookingRepository} from '../src/lib/booking/postgres-repository';
async function main(){
 const url=process.env.TEST_DATABASE_URL;
 if(!url||!new URL(url).pathname.endsWith('_test')||process.env.TEST_DATABASE_RESET!=='1')throw new Error('Dedicated test database required');
 const {db,pool}=openDatabase(url);
 try{const b=await new PostgresBookingRepository(db,[{provider:'console',target:'local'}]).getById(process.argv[2]!);if(!b)throw new Error('Missing test booking');console.log(createHash('sha256').update(JSON.stringify(b)).digest('hex'));}finally{await pool.end();}
}
main().catch(()=>{console.error('Test read failed');process.exitCode=1;});
