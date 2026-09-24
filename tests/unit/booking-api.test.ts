import {describe,it,expect} from "vitest";
import {createBookingHandler} from "@/lib/booking/api";
import {InMemoryBookingRepository} from "@/lib/booking/repository";
const repository=new InMemoryBookingRepository();
const POST=createBookingHandler(()=>({repository,processSecret:"",afterCreate:async()=>{},process:async()=>({processed:0})}));
import {createActivity,createPackage} from "@/lib/booking/itinerary";
const date=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
function body(){const p=createPackage("couple-escape",date);p.components.forEach(a=>{a.time="10:00";if(a.experienceId==="horse-riding")a.participants[0]!.weightKg=70;});const a=createActivity("atv",date);a.time="14:30";return {schemaVersion:2,items:[p,a],customer:{name:"API QA",email:"qa@example.com",phone:"+66000000000"},locale:"en"};}
const request=(data:unknown)=>new Request("http://localhost/api/booking",{method:"POST",headers:{"Idempotency-Key":crypto.randomUUID()},body:JSON.stringify(data)});
describe("POST Booking V2",()=>{
 it("persists package and extra activity as one received request",async()=>{const res=await POST(request(body()));expect(res.status).toBe(201);expect(await res.json()).toMatchObject({status:"received",id:expect.any(String)});});
 it("rejects a malformed body",async()=>expect((await POST(new Request("http://localhost/api/booking",{method:"POST",body:"{"}))).status).toBe(400));
 it("rejects over-limit participant with full item path",async()=>{const b=body();const p=b.items[0]!;if(p.type==="package")p.components[0]!.participants[0]!.weightKg=91;const res=await POST(request(b));expect(res.status).toBe(400);expect((await res.json()).fieldErrors["items.0.components.0.participants.0.weightKg"].key).toBe("weightExceedsMaximum");});
 it("rejects empty visit",async()=>expect((await POST(request({...body(),items:[]}))).status).toBe(400));
 it("does not accept client status",async()=>{const res=await POST(request({...body(),status:"confirmed"}));expect((await res.json()).status).toBe("received");});
 it("rejects honeypot",async()=>expect((await POST(request({...body(),company:"bot"}))).status).toBe(400));
});
