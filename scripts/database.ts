import {Pool} from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {readMigrationFiles} from 'drizzle-orm/migrator';
async function main(){
 const url=process.env.DATABASE_URL;if(!url)throw new Error('DATABASE_URL required');
 const pool=new Pool({connectionString:url,connectionTimeoutMillis:5000});
 try {
  if(process.argv[2]==='status'){
   const exists=await pool.query("select to_regclass('drizzle.__drizzle_migrations') as name");
   const applied=exists.rows[0]?.name?(await pool.query('select hash from drizzle.__drizzle_migrations')).rows:[];
   const hashes=new Set(applied.map((r:{hash:string})=>r.hash));
   const migrations=readMigrationFiles({migrationsFolder:'./drizzle'});
   console.info({total:migrations.length,applied:migrations.filter(m=>hashes.has(m.hash)).length,pending:migrations.filter(m=>!hashes.has(m.hash)).length});
  }else{
   // Dedicated connection keeps the migration lock for the whole operation.
   const client=await pool.connect();
   try{await client.query("select pg_advisory_lock(584931,1)");await migrate(drizzle(client),{migrationsFolder:'./drizzle'});console.info('Migrations applied');}
   finally{try{await client.query("select pg_advisory_unlock(584931,1)");}finally{client.release();}}
  }
 }finally{await pool.end();}
}
main().catch(()=>{console.error('Database command failed; check configuration, connectivity and migration state.');process.exitCode=1;});
