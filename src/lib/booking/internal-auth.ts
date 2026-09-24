import {timingSafeEqual,createHash} from 'node:crypto';
export function authorizedProcessor(header:string|null,secret:string){
 if(secret.length<32||!header?.startsWith('Bearer '))return false;
 return timingSafeEqual(createHash('sha256').update(header.slice(7)).digest(),createHash('sha256').update(secret).digest());
}
