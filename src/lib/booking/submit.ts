import type {BookingDraft} from "@/types/domain";
import type {BookingRepository} from "./repository";
import type {NotificationService} from "./notify";
export async function submitBooking(draft:BookingDraft,repository:BookingRepository,notifications:NotificationService) {
  const created=await repository.create(draft);
  try { await notifications.notifyBookingReceived(created); }
  catch { console.error("[booking:notification] service failed",{reference:created.id}); }
  return created;
}
