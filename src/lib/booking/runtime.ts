import {readBookingConfig} from './config';
import {openDatabase} from '../db/client';
import {PostgresBookingRepository} from './postgres-repository';
import {InMemoryBookingRepository,type BookingRepository} from './repository';
import {OutboxProcessor} from './outbox/processor';
import {createDeliveryTransport} from './outbox/transport';
import {ConsoleNotificationProvider,buildBookingNotificationPayload} from './notify';
export type BookingRuntime={repository:BookingRepository;processSecret:string;process:(limit?:number,bookingId?:string)=>Promise<{processed:number}>;afterCreate:(id:string)=>Promise<void>};
let current:BookingRuntime|undefined;
export function getBookingRuntime():BookingRuntime{
 if(current)return current;
 const config=readBookingConfig();
 if(config.storage==='memory'){
  const repository=new InMemoryBookingRepository();
  current={repository,processSecret:config.processSecret,process:async()=>({processed:0}),afterCreate:async id=>{const booking=await repository.getById(id);if(booking)await new ConsoleNotificationProvider().send(buildBookingNotificationPayload(booking));}};
 }else{
  const {db}=openDatabase(config.databaseUrl!);const processor=new OutboxProcessor(db,createDeliveryTransport());
  current={repository:new PostgresBookingRepository(db,config.targets),processSecret:config.processSecret,process:(limit,id)=>processor.process(limit,id),afterCreate:async id=>{await processor.process(1,id);}};
 }
 return current;
}
