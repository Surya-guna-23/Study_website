export default [
  {
    id: 'parking-lot',
    source: 'Teaching alternative: Spot, EntryGate, and reserve(Vehicle), not literal upstream signatures. Existing audit covers 21 parking Java files and PDF text, not PDF UML images. No payment idempotency is implemented here.',
    classes: [
      `class Vehicle {
  +String number
  +VehicleType type
}
class Spot {
  -boolean occupied
  +compatible(vehicle) boolean
  +occupied() boolean
  +occupy()
  +vacate()
}
class Ticket {
  +Vehicle vehicle
  +Spot spot
  +Instant enteredAt
}
Ticket --> Vehicle
Ticket --> Spot`,
      `class ParkingSpotManager {
  -List spots
  +reserve(vehicle) Spot
  +release(spot)
}
class EntryGate {
  +enter(vehicle) Ticket
}
class ExitGate {
  +exit(ticket)
}
ParkingSpotManager *-- Spot : exclusive inventory
EntryGate --> ParkingSpotManager
EntryGate ..> Ticket : constructs after reserve
ExitGate --> ParkingSpotManager
ExitGate --> Ticket`,
      `class PricingStrategy {
  +quote(ticket, now) long
}
class PaymentPort {
  +pay(amount) boolean
}
ExitGate --> PricingStrategy
ExitGate --> PaymentPort`,
    ],
    success: `actor Driver
participant EntryGate
participant ParkingSpotManager
participant Spot
participant Ticket
participant ExitGate
participant PricingStrategy
participant PaymentPort
Driver->>EntryGate: enter(vehicle)
EntryGate->>ParkingSpotManager: reserve(vehicle)
ParkingSpotManager->>Spot: compatible(vehicle) and occupied()
ParkingSpotManager->>Spot: occupy() under manager monitor
ParkingSpotManager-->>EntryGate: spot
EntryGate->>Ticket: construct(vehicle, spot, enteredAt)
EntryGate-->>Driver: ticket
Driver->>ExitGate: exit(ticket)
ExitGate->>PricingStrategy: quote(ticket, now)
PricingStrategy-->>ExitGate: amount in minor units
ExitGate->>PaymentPort: pay(amount)
PaymentPort-->>ExitGate: true
ExitGate->>ParkingSpotManager: release(ticket.spot)
ParkingSpotManager->>Spot: vacate() under same monitor
ExitGate-->>Driver: exit permitted`,
    failure: `actor Driver
participant ExitGate
participant PricingStrategy
participant PaymentPort
participant ParkingSpotManager
participant Spot
Driver->>ExitGate: exit(ticket)
ExitGate->>PricingStrategy: quote(ticket, now)
PricingStrategy-->>ExitGate: amount
ExitGate->>PaymentPort: pay(amount)
PaymentPort-->>ExitGate: false
ExitGate-->>Driver: payment declined and exit denied
Note over ParkingSpotManager,Spot: No release call and occupancy remains true
Note over ExitGate,PaymentPort: Retry safety and unknown outcomes need additional protocol`,
    beats: [
      ['Bound the smallest parking allocation model.', 'Draw entry, a small compatible-spot inventory, and exit.', 'I will admit a vehicle, reserve one compatible spot, issue a ticket, and release after payment. I start with one JVM and one manager-owned inventory, not distributed gates or durable recovery.', 'A small teaching alternative avoids mixing the guide multiple API variants.', 'Are these exact upstream class names?', 'No. The source uses EntranceGate, ParkingBuilding, ParkingSpot, and park(); these slides consistently use EntryGate, Spot, and reserve(Vehicle).'],
      ['State the locking and payment assumptions.', 'Draw one monitor around a manager inventory and write paid before release.', 'Every occupancy read and write goes through the same manager. Spots belong to only one manager. A declined payment retains the reservation, and this sketch does not implement duplicate-exit protection.', 'A local lock works only if no writer bypasses it; payment success is not a retry protocol.', 'Can two managers share the same Spot?', 'No. Their independent monitors would not coordinate. Inventory ownership must be exclusive in this single-JVM model.'],
      ['Separate arrival data, physical capacity, and visit record.', 'Draw Vehicle, Spot with occupied, and Ticket referencing both plus entry time.', 'Vehicle describes who arrives, Spot stores occupancy, and Ticket connects that vehicle to its allocated spot and entry time. Ticket does not search for capacity.', 'The visit record must identify the exact allocation used at exit.', 'Why is a Ticket different from a Vehicle?', 'A vehicle can make multiple visits; each ticket records one allocation and entry time, while vehicle identity persists across visits.'],
      ['Make the manager own occupancy transitions.', 'Add ParkingSpotManager.reserve and release, then EntryGate and ExitGate.', 'EntryGate calls reserve and only then constructs Ticket. The manager selects and occupies within one monitor, and release uses that same monitor. ExitGate coordinates rather than mutating Spot directly.', 'Check-and-update must be one operation, not a free-space query followed by a later write.', 'Does Spot need its own synchronized reservation loop?', 'No. With exclusive inventory and all access through the manager, one manager monitor is the chosen boundary. There is no unbounded retry loop.'],
      ['Separate pricing variation from payment.', 'Add PricingStrategy.quote and PaymentPort.pay to ExitGate.', 'PricingStrategy returns a fee in minor units; PaymentPort attempts collection. I keep first-compatible selection as a simple loop and introduce a selection strategy only if nearest or other policies are required.', 'Price variation is justified without forcing every responsibility into a pattern.', 'Why does pricing not release the spot?', 'Computing a fee neither proves payment nor owns inventory. ExitGate requests release only after a definite successful payment.'],
      ['Trace one entry and one paid exit.', 'Draw manager-locked occupy, ticket creation, quote, pay, then manager-locked vacate.', 'Entry reserves before issuing the ticket. At exit I calculate the amount, receive payment success, then release the ticket spot through the manager. No lock is held during the external payment call.', 'Payment latency must not block all parking allocations.', 'What if ticket construction fails after reserve?', 'This small flow assumes successful local construction. A complete service needs allocation compensation or durable recovery before claiming crash safety.'],
      ['Keep occupied capacity after payment rejection.', 'Stop the exit sequence at PaymentPort returning false and cross out release.', 'The payment is declined, so ExitGate denies exit and never calls release. The spot stays occupied. I do not claim a later retry is idempotent, especially if a payment response was lost.', 'A timeout is not equivalent to a definite decline, and a duplicate exit can charge again without added state.', 'Can this sketch safely replay a stale ticket?', 'No. Active-ticket ownership checks, completed state, and payment deduplication are required extensions, not implemented guarantees.'],
      ['Code a bounded manager-level reservation.', 'Underline synchronized, the compatible/free guard, and occupy before return.', 'reserve scans managed spots under one monitor. It occupies the first compatible free spot and returns it, or returns null when none exists. release validates membership and uses the same monitor.', 'The bounded scan is sufficient when every access shares this boundary.', 'Why is selection outside the monitor wrong?', 'Another gate could occupy the chosen spot before the write. Selection and occupancy change must stay together under the same manager lock.'],
      ['Defend simplicity without claiming production safety.', 'Write one-JVM monitor versus transactional shared inventory and list stale-ticket risk.', 'This model favors a readable linear scan and a pricing strategy. It sacrifices parallel allocation within one manager. Multiple processes, duplicate payments, and stale tickets require new state and shared transactional coordination.', 'Thread safety of occupancy alone does not establish a safe ticket/payment lifecycle.', 'What is the first production extension?', 'Persist an active allocation identity and ticket lifecycle, validate ownership at release, and design recoverable payment attempts before adding distributed capacity.'],
    ],
    code: `// Inside ParkingSpotManager. No direct Spot access by gates.
synchronized Spot reserve(Vehicle vehicle) {
    Objects.requireNonNull(vehicle);
    for (Spot spot : spots) {
        if (spot.compatible(vehicle) && !spot.occupied()) {
            spot.occupy();
            return spot;
        }
    }
    return null;
}

synchronized void release(Spot spot) {
    if (!spots.contains(spot)) throw new IllegalArgumentException("Foreign spot");
    spot.vacate();
}`,
    codeNote: 'Teaching alternative, not the legacy guide tryReserve loop. Spot helpers are nonthrowing local operations after validation; all occupancy access shares this manager. Membership is not ticket ownership. No persistence, idempotency, or stale-ticket protection is implemented.',
    recap: 'Redraw Vehicle, Spot, Ticket, manager, both gates, pricing, and payment; point to the sole occupancy lock.',
    script: 'I start with a single-JVM parking model. Vehicle carries identity, Spot carries occupancy, and Ticket records one visit. EntryGate calls ParkingSpotManager.reserve(Vehicle), whose monitor covers compatible selection and occupancy. ExitGate computes a fee through PricingStrategy, pays outside the inventory lock, and releases only on success. A decline keeps the spot occupied. These are teaching APIs, not literal upstream signatures, and duplicate exits, stale tickets, unknown payments, and crash recovery remain explicit limitations.',
    closing: 'The rehearsal should not imply that a manager monitor solves payment idempotency or ticket ownership.',
    followUps: [
      ['How do two entry gates avoid taking the last spot?', 'They must share the same manager instance. Its monitor serializes the full scan-and-occupy operation, so the second request sees the updated occupancy.'],
      ['How would you prevent a stale ticket releasing a new visit?', 'Add an allocation token to the active spot/ticket relationship and compare it atomically during release, with terminal ticket state retained. This is not in the displayed excerpt.'],
      ['What if payment succeeded but its response was lost?', 'Keep the allocation and reconcile a durable payment attempt using provider-supported identity; do not blindly recharge or free the spot. That protocol is deferred here.'],
    ],
  },
  {
    id: 'car-rental',
    source: 'Guide observations cover discovered carrental Demo and ReservationManager. Inventory overlap/locking was not reviewed; half-open calendars are original guidance.',
    classes: [
      `class Vehicle {
  +String id
  +boolean operational
}
class Reservation {
  +Instant start
  +Instant end
  +Status status
}
Reservation --> Vehicle : one vehicle interval`,
      `class ReservationCalendar {
  -List active
  +reserve(start, end) Reservation
}
class RentalService {
  +reserve(vehicleId, start, end) Reservation
  +pickup(id)
  +returnVehicle(id)
}
Vehicle *-- ReservationCalendar
ReservationCalendar *-- Reservation
RentalService --> ReservationCalendar
RentalService --> Vehicle`,
      `class PricingPolicy {
  +quote(reservation) Money
}
RentalService --> PricingPolicy
RentalService --> Reservation : lifecycle`,
    ],
    success: `actor Customer
participant RentalService
participant ReservationCalendar
participant Reservation
participant PricingPolicy
Customer->>RentalService: reserve(V1, start, end)
RentalService->>ReservationCalendar: reserve(start, end)
ReservationCalendar->>ReservationCalendar: validate interval and scan active overlaps
ReservationCalendar->>Reservation: create(start, end)
ReservationCalendar->>ReservationCalendar: add under same monitor
ReservationCalendar-->>RentalService: RESERVED
RentalService-->>Customer: reservation
Customer->>RentalService: pickup(id)
RentalService->>Reservation: validate readiness then IN_USE
Customer->>RentalService: returnVehicle(id)
RentalService->>Reservation: record actual return and COMPLETED
RentalService->>PricingPolicy: quote(reservation)
PricingPolicy-->>Customer: bill for separate settlement`,
    failure: `actor BuyerA
actor BuyerB
participant RentalService
participant ReservationCalendar
BuyerA->>RentalService: reserve(V1, 10, 12)
RentalService->>ReservationCalendar: reserve(10, 12)
ReservationCalendar-->>BuyerA: R1 committed
BuyerB->>RentalService: reserve(V1, 11, 13) after stale search
RentalService->>ReservationCalendar: reserve(11, 13)
ReservationCalendar->>ReservationCalendar: overlap with R1
ReservationCalendar-->>BuyerB: Unavailable
Note over ReservationCalendar: No second insertion`,
    beats: [
      ['Identify calendar capacity as the main problem.', 'Draw one store, a vehicle, and a pickup-to-return timeline.', 'I will reserve a specific vehicle for an interval, support pickup and return, and calculate a bill. License checks, insurance, and damage claims stay outside the first model.', 'The resource is a vehicle over time, not merely a free car now.', 'Can Vehicle.available be one boolean?', 'No. A car can be available now but reserved tomorrow; availability depends on the requested interval.'],
      ['Agree on interval and lifecycle semantics.', 'Draw touching intervals and RESERVED to IN_USE to COMPLETED, plus CANCELLED.', 'I use UTC half-open intervals, so a return at eleven allows a planned pickup at eleven. Active reservations cannot overlap, and planned times stay separate from actual return times.', 'Boundary semantics determine whether adjacent reservations conflict.', 'Do ten-to-eleven and eleven-to-twelve overlap?', 'No under half-open intervals; a later cleaning buffer could deliberately change that availability rule.'],
      ['Give each reservation one vehicle and immutable interval.', 'Draw Vehicle and Reservation with start, end, status.', 'Vehicle tells me identity and operational readiness. Reservation records a claim over time and its lifecycle. Operational does not mean available for every future interval.', 'Physical readiness and calendar availability are different facts.', 'Where is actual return recorded?', 'On the reservation lifecycle record without overwriting the planned end, preserving pricing and audit context.'],
      ['Add a per-vehicle write boundary.', 'Add ReservationCalendar under Vehicle and RentalService above it.', 'RentalService finds the vehicle and delegates check-and-insert to its calendar. The calendar serializes every reservation and cancellation for that vehicle.', 'A search result can become stale before the customer submits reserve.', 'Why recheck after search?', 'Another customer may reserve the same interval; only the atomic calendar write determines ownership.'],
      ['Separate tariffs from collisions.', 'Add PricingPolicy to RentalService, not to the overlap predicate.', 'Hourly and daily tariffs justify a pricing strategy. The accepted rate version is snapshotted with the reservation, while calendar conflicts remain independent of pricing.', 'A tariff change must not alter which vehicle intervals overlap.', 'Should vehicle category and tariff create subclasses for every combination?', 'No. Vehicle data and pricing policy are independent axes and can be composed.'],
      ['Trace reserve, pickup, return, then bill.', 'Draw reserve through the calendar, followed by readiness check and actual return.', 'reserve commits a planned interval. pickup checks the reservation and operational vehicle before IN_USE. returnVehicle records completion, then pricing produces a bill whose payment is separate.', 'Repeating payment must not replay physical return.', 'Does a payment decline make the returned car occupied again?', 'No. It leaves an unpaid bill; physical readiness and outstanding money are separate concerns.'],
      ['Reject a competing overlap after stale search.', 'Draw A booking ten-to-twelve before B asks for eleven-to-thirteen.', 'Both buyers may see availability, but the calendar commits A first. B then sees an overlap inside the same monitor and receives Unavailable without insertion.', 'The invariant is checked against committed reservations, not an earlier screen.', 'What if the earlier renter returns late?', 'Block the next pickup or reassign a vehicle. Planned non-overlap is not a guarantee of actual physical readiness.'],
      ['Code the strict half-open overlap predicate.', 'Underline start before existing end and existing start before end.', 'A conflict needs both strict comparisons. I validate the new interval first, scan active claims, and insert under the same monitor only when no conflict exists.', 'Using less-than-or-equal would incorrectly reject adjacent bookings.', 'Does synchronized protect multiple service instances?', 'No. A shared transactional range exclusion or serialized writes per vehicle are needed across processes.'],
      ['Choose a local calendar before larger infrastructure.', 'Compare per-vehicle locks, database exclusion, and turnaround buffers.', 'A per-vehicle calendar avoids serializing the entire fleet. Database exclusion preserves the same rule across instances. A cleaning buffer reduces utilization but makes operational handoffs more realistic.', 'Data structure choice and physical scheduling policy solve different problems.', 'How should cancellation release capacity?', 'Deactivate or remove only its own active interval through the calendar boundary while retaining the reservation audit record.'],
    ],
    code: `synchronized Reservation reserve(Instant start, Instant end) {
    if (start == null || end == null || !start.isBefore(end))
        throw new IllegalArgumentException("Invalid interval");
    boolean conflict = active.stream().anyMatch(r ->
        start.isBefore(r.end()) && r.start().isBefore(end));
    if (conflict) throw new IllegalStateException("Unavailable");
    Reservation created = Reservation.create(start, end);
    active.add(created);
    return created;
}`,
    codeNote: 'Inside one ReservationCalendar already bound to a vehicle. All writers use this monitor, intervals are immutable, and create is local. Lifecycle/payment replay handling is outside this excerpt.',
    recap: 'Redraw the vehicle calendar, interval claim, service, and tariff policy; mark planned versus actual return.',
    script: 'I treat a rental as a vehicle claim over a half-open interval. Vehicle stores identity and readiness, Reservation stores the plan and lifecycle, and ReservationCalendar atomically checks overlap and inserts. Search is advisory. Pickup checks physical readiness, return records actual time, and PricingPolicy handles the bill independently. Competing reservations cannot both commit in this local boundary, but late returns still need operational handling and multiple processes need database coordination.',
    closing: 'The compact answer must separate future capacity, actual readiness, and unpaid billing.',
    followUps: [
      ['How do you handle a cleaning period?', 'Extend the blocked interval with an explicit turnaround buffer while preserving the original rental timestamps for customer billing.'],
      ['How would you prevent duplicate completion bills?', 'Persist a terminal completion result and unique billing identity, returning that result on matching retries rather than creating a second invoice.'],
      ['How does multi-store return affect the model?', 'Track actual vehicle location and transfer availability separately from the original reservation store; a destination change requires policy and inventory updates.'],
    ],
  },
  {
    id: 'meeting-scheduler',
    source: 'Guide observations cover MeetingScheduler and Calendar only. TimeInterval/MeetingRoom semantics were not verified; atomic booking and zone handling are teaching extensions.',
    classes: [
      `class Meeting {
  +String id
  +Instant start
  +Instant end
  +Status status
  +Map responses
}
class RoomCalendar {
  -int capacity
  -List activeMeetings
  +book(meeting)
  +release(meetingId)
}
RoomCalendar *-- Meeting`,
      `class Scheduler {
  +schedule(request) Meeting
  +cancel(meetingId)
}
Scheduler --> RoomCalendar
Scheduler --> Meeting : normalizes request`,
      `class NotificationPort {
  +invite(eventId, meeting)
  +cancel(eventId, meetingId)
}
Scheduler --> NotificationPort : after commit via outbox
note for RoomCalendar "Calendar aggregate, no behavioral pattern required"`,
    ],
    success: `actor Organizer
participant Scheduler
participant RoomCalendar
participant Outbox
participant NotificationPort
Organizer->>Scheduler: schedule(request)
Scheduler->>Scheduler: resolve zone and count distinct physical attendees
Scheduler->>RoomCalendar: book(meeting)
RoomCalendar->>RoomCalendar: validate capacity and check overlap then insert
RoomCalendar-->>Scheduler: reserved
Scheduler->>Outbox: persist invitation with booking transaction
Scheduler-->>Organizer: ACTIVE meeting
Outbox->>NotificationPort: invite(eventId, meeting)
NotificationPort-->>Outbox: delivered`,
    failure: `actor Organizer
participant Scheduler
participant RoomCalendar
participant Outbox
participant NotificationPort
Organizer->>Scheduler: schedule(request)
Scheduler->>RoomCalendar: book(meeting)
RoomCalendar-->>Scheduler: reserved
Scheduler->>Outbox: commit invitation intent with booking
Outbox->>NotificationPort: invite(eventId, meeting)
NotificationPort-->>Outbox: delivery failure
Note over RoomCalendar,Outbox: Keep ACTIVE booking and pending delivery
Outbox->>NotificationPort: retry same eventId`,
    beats: [
      ['Separate room ownership from invitations.', 'Draw an organizer, a room timeline, and a separate invitation envelope.', 'I support one non-recurring meeting with a room, organizer, and attendees. Room booking is the core operation; invitations and participant responses are separate.', 'Email delivery and attendance do not determine whether a room is reserved.', 'Does a declined invitation free the room?', 'No. Only meeting cancellation or rescheduling changes room occupancy.'],
      ['Resolve time and headcount explicitly.', 'Write half-open UTC intervals, intended zone, and a distinct attendee set.', 'I store instants plus the intended display zone. I reject unresolved daylight-saving ambiguity, count the organizer once among physical attendees, and treat participant conflicts as warnings.', 'Wall-clock time alone is ambiguous and duplicate attendee entries can inflate capacity.', 'Can adjacent meetings share an endpoint?', 'Yes. Ten-to-eleven and eleven-to-twelve do not overlap under the half-open policy.'],
      ['Model meeting state separately from responses.', 'Draw RoomCalendar with capacity and Meeting with status and a responses map.', 'RoomCalendar owns active occupancy. Meeting stores the interval and lifecycle, while each attendee independently has pending, accepted, or declined status.', 'Combining response and meeting state would accidentally cancel a meeting when one guest declines.', 'Which status changes when one guest accepts?', 'Only that guest response; Meeting remains ACTIVE and the room interval does not change.'],
      ['Add scheduling without weakening the calendar boundary.', 'Add Scheduler.schedule and cancel above RoomCalendar.', 'Scheduler normalizes the request and finds candidates, but RoomCalendar.book rechecks capacity and overlap before insertion. Finding a free room is not claiming it.', 'Concurrent organizers can choose the same advisory candidate.', 'Where must overlapping requests serialize?', 'At the room calendar write boundary, with transactional coordination once multiple processes exist.'],
      ['Use notifications as a post-commit dependency.', 'Add NotificationPort after a booking commit and annotate an outbox extension.', 'The calendar needs no named behavioral pattern. A notification port isolates delivery, and a durable outbox can couple invitation intent with the booking without sending email inside the lock.', 'External messaging failures must not erase a valid reservation.', 'Is the outbox implemented by the Java snippet?', 'No. The snippet is an in-memory book method; transactional booking plus outbox persistence is an explicit wider design contract.'],
      ['Trace booking before invitation delivery.', 'Draw normalization, book, commit invitation intent, then invite.', 'I resolve the interval and distinct headcount, reserve a room, and commit the meeting with its invitation intent. Delivery happens afterward, and guest responses update separately.', 'Sending invitations before booking could announce a meeting that never obtained a room.', 'When can the organizer see a successful booking?', 'After the booking transaction commits, even if invitation delivery is still pending.'],
      ['Keep booking on mail failure.', 'Draw an invitation failure after RoomCalendar has accepted the meeting.', 'The mail service fails after commit. I keep the room and show pending delivery, then retry the same invitation event rather than booking another meeting.', 'Transport failure is not a reason to release domain ownership.', 'What if room contention occurs instead?', 'The losing booking inserts nothing and sends no invitations; Scheduler can try another candidate.'],
      ['Code replay detection and interval conflict together.', 'Underline sameRequest before overlap scanning, then book under one monitor.', 'A repeated ID returns only if its scheduling payload matches. A new request must fit capacity and avoid every active overlap before the calendar inserts it.', 'Retries must not create duplicates or silently change an existing meeting.', 'Why retain canceled IDs in byId?', 'To recognize old retries and avoid resurrecting a canceled meeting merely because its active interval was removed.'],
      ['Defend calendar simplicity and explicit extensions.', 'Compare a linear scan with an interval index and draw old/new reschedule slots.', 'A linear scan is fine for a small calendar. An index improves search but not write atomicity. Rescheduling must preserve the old booking if the new slot cannot be secured.', 'Performance structures do not replace consistency or lifecycle rules.', 'Why is recurrence not repeated UTC addition?', 'A recurring local-time meeting crosses daylight-saving changes and needs zone-based recurrence plus exception records.'],
    ],
    code: `synchronized void book(Meeting meeting) {
    if (!meeting.start().isBefore(meeting.end())
            || meeting.headcount() <= 0 || meeting.headcount() > capacity)
        throw new IllegalArgumentException("Invalid interval or capacity");
    Meeting prior = byId.get(meeting.id());
    if (prior != null) {
        if (!prior.sameRequest(meeting)) throw new IllegalArgumentException("ID conflict");
        return;
    }
    boolean overlap = activeMeetings.stream().anyMatch(existing ->
        meeting.start().isBefore(existing.end())
            && existing.start().isBefore(meeting.end()));
    if (overlap) throw new IllegalStateException("Room unavailable");
    byId.put(meeting.id(), meeting);
    activeMeetings.add(meeting);
}`,
    codeNote: 'Inside RoomCalendar with immutable non-null intervals and normalized distinct physical headcount. All writers share its monitor. Durable participant views, cancellation, and outbox transactions are not implemented here.',
    recap: 'Redraw Scheduler, RoomCalendar, Meeting, NotificationPort and the invitation-after-commit boundary.',
    script: 'I distinguish finding a room from reserving its interval. Scheduler resolves time zones and distinct physical headcount, then RoomCalendar atomically checks half-open overlap and inserts a Meeting. Invitation responses do not control room ownership. I deliver notifications after commit and retry failures without losing the booking. Cancellation releases once, and a reschedule must preserve the old slot if the new claim fails. Recurrence and hard participant conflicts are separate extensions.',
    closing: 'The answer should connect interval ownership to time-zone assumptions and independent notification delivery.',
    followUps: [
      ['How do you reschedule without losing the old slot?', 'Within one transaction reserve the new interval and release the old; on failure leave the original meeting unchanged. Cross-store moves need an explicit compensation protocol.'],
      ['What if participant conflicts become hard constraints?', 'Check and reserve all required calendars atomically, using a stable locking order or a suitable transaction boundary to avoid deadlocks and partial reservations.'],
      ['How do you handle an ambiguous local start time?', 'Require the caller to choose an offset/occurrence under an explicit zone policy; reject nonexistent times instead of silently shifting the meeting.'],
    ],
  },
];