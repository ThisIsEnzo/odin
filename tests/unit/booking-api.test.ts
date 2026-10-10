import {describe,it,expect} from "vitest";
import {createBookingHandler} from "@/lib/booking/api";
import {InMemoryBookingRepository} from "@/lib/booking/repository";
const repository=new InMemoryBookingRepository();
const POST=createBookingHandler(()=>({repository,processSecret:"",afterCreate:async()=>{},process:async()=>({processed:0})}));
const date=new Date(Date.now()+5*86400000).toISOString().slice(0,10);
function body(){return {schemaVersion:3,visitDate:date,preferredStartTime:"10:00",activities:[{activityId:"horse-riding",guestCount:2},{activityId:"atv",guestCount:5,unitCount:3}],customer:{fullName:"API QA",email:"qa@example.com",phone:"+66000000000"},locale:"en"};}
const request=(data:unknown)=>new Request("http://localhost/api/booking",{method:"POST",headers:{"Idempotency-Key":crypto.randomUUID()},body:JSON.stringify(data)});
describe("POST Booking V3",()=>{
 it("receives riding without weights and 5 guests with 3 ATVs",async()=>{const res=await POST(request(body()));expect(res.status).toBe(201);const response=await res.json();expect(response).toMatchObject({status:"received",id:expect.any(String)});const saved=await repository.getById(response.id);expect(saved).toMatchObject(body());expect(saved).not.toHaveProperty('items');});
 it("rejects a malformed body",async()=>expect((await POST(new Request("http://localhost/api/booking",{method:"POST",body:"{"}))).status).toBe(400));
 it("validates capacity server-side with a precise field path",async()=>{const b=body();b.activities[1]!.unitCount=2;const res=await POST(request(b));expect(res.status).toBe(400);expect((await res.json()).fieldErrors["activities.1.unitCount"].key).toBe("invalidUnitCount");});
 it("rejects empty request",async()=>expect((await POST(request({...body(),activities:[]}))).status).toBe(400));
 it("strips client status, prices and weights",async()=>{const res=await POST(request({...body(),status:"confirmed",estimate:{amount:1},weightKg:80}));const response=await res.json();expect(response.status).toBe("received");expect((await repository.getById(response.id))?.estimate?.amount).toBeNull();expect(await repository.getById(response.id)).not.toHaveProperty('weightKg');});
 it("rejects honeypot",async()=>expect((await POST(request({...body(),company:"bot"}))).status).toBe(400));
 it("rejects retired V2 public submissions without reinterpreting them",async()=>expect((await POST(request({schemaVersion:2,items:[],customer:{name:'QA',email:'qa@example.com',phone:'+66000000000'},locale:'en'}))).status).toBe(400));
});
