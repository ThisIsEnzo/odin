export type Fetcher = typeof fetch;
export async function postProvider(fetcher:Fetcher, url:string, token:string, body:unknown, headers:Record<string,string>={}) {
  const response=await fetcher(url,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`,...headers},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
  if(!response.ok) throw new Error(`Provider HTTP ${response.status}`);
}
/** UTF-16 budget is conservative for providers; never split a surrogate pair. */
export function chunks(text:string, length:number):string[] {
  const out:string[]=[];let part="";
  for(const char of text){if(part.length+char.length>length){out.push(part);part="";}part+=char;}
  if(part)out.push(part);return out;
}
