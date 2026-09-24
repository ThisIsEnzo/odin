import {readBookingConfig} from '../src/lib/booking/config';
try{const c=readBookingConfig({...process.env,NODE_ENV:'production'});console.info({configuration:'valid',storage:c.storage,providers:[...new Set(c.targets.map(t=>t.provider))]});}
catch(error){console.error(error instanceof Error?error.message:'Invalid server configuration');process.exitCode=1;}
