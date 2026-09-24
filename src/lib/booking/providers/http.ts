export type Fetcher = typeof fetch;
export const PROVIDER_TIMEOUT_MS=10000;
/** Only sanitized categories/status codes may be persisted or logged. */
export class ProviderError extends Error {
 constructor(public code:string,public retryable:boolean){super(code);}
}
export async function postProvider(fetcher:Fetcher,url:string,token:string,body:unknown,headers:Record<string,string>={}) {
 let response:Response;
 try {response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`,...headers},body:JSON.stringify(body),signal:AbortSignal.timeout(PROVIDER_TIMEOUT_MS),redirect:'error'});}
 catch {throw new ProviderError('transport_timeout_or_network',true);}
 // A LINE replay acknowledgement is successful only with its accepted-request header.
 if(response.status===409&&headers['X-Line-Retry-Key']&&response.headers.get('x-line-accepted-request-id'))return response;
 if(!response.ok)throw new ProviderError(`provider_http_${response.status}`,response.status>=500||response.status===408||response.status===429);
 return response;
}
/** UTF-16 budget is conservative; never split a surrogate pair. */
export function chunks(text:string,length:number):string[]{
 const out:string[]=[];let part='';
 for(const char of text){if(part.length+char.length>length){out.push(part);part='';}part+=char;}
 if(part)out.push(part);return out;
}
