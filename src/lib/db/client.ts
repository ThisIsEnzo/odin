import {Pool} from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import * as schema from './schema';
export function openDatabase(connectionString:string) {
 const pool=new Pool({connectionString,max:5,connectionTimeoutMillis:5000,idleTimeoutMillis:30000,statement_timeout:15000,idle_in_transaction_session_timeout:20000});
 pool.on('error',()=>console.error('[database] pool connection failure'));
 return {pool,db:drizzle(pool,{schema})};
}
export type Database=ReturnType<typeof openDatabase>['db'];
