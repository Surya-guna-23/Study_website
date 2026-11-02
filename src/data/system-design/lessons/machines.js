export default [
  {
    id: 'elevator',
    source: 'Guide observations cover Demo and ElevatorController with priority queues and monitor threads. Event-loop guards here are original; this is a simulator, never a safety-certified elevator design.',
    classes: [
      `class Car {
  -int floor
  -boolean doorClosed
  -boolean inService
  +commandStep(direction)
}
class HallRequest {
  +int floor
  +Direction direction
}
HallRequest ..> Car : unassigned until scheduling`,
      `class Controller {
  -SortedSet stops
  +submit(floor)
  +tick()
}
class Scheduler {
  +assign(floor, direction)
}
Controller *-- Car
Scheduler --> Controller
Scheduler --> HallRequest`,
      `class SelectionPolicy {
  +choose(controllers, request) Controller
}
Scheduler --> SelectionPolicy
Controller : +nextStop() OptionalInt`,
    ],
    success: `actor Passenger
participant Scheduler
participant SelectionPolicy
participant Controller
participant Car
Passenger->>Scheduler: assign(3, UP)
Scheduler->>SelectionPolicy: choose(controllers, request)
SelectionPolicy-->>Scheduler: controller A
Scheduler->>Controller: submit(3)
Controller->>Controller: validate and coalesce stop
Controller->>Controller: tick()
Controller->>Car: inspect door, overload, service, pending
Car-->>Controller: eligible
Controller->>Car: commandStep(1)
Note over Car: Movement pending is set before return
Car-->>Controller: later arrival acknowledgement
Controller->>Controller: update floor and serve target when reached
Passenger->>Controller: submit(7) inside the same car`,
    failure: `actor Clock
participant Controller
participant Car
Clock->>Controller: tick()
Controller->>Car: inService(), doorClosed(), overloaded()
Car-->>Controller: in service but door open
Controller-->>Clock: no movement command
Note over Controller,Car: Pending stops retained and floor unchanged
Note over Car: Software guard is only a simulation assumption`,
    beats: [
      ['Scope hall assignment and car simulation.', 'Draw floors zero through nine, two cars, a hall button, and an internal button.', 'I will simulate two cars serving floors zero through nine. Hall calls need car assignment; internal destinations already belong to a car. Real emergency control and certified hardware safety are outside this model.', 'A scheduler exercise must not be presented as equipment control.', 'Can an internal destination move to another car?', 'Not blindly. Its passenger is already aboard; a car fault needs explicit recovery, not ordinary hall-call reassignment.'],
      ['Define movement guards and acknowledgements.', 'Write door closed, not overloaded, in service, and no movement pending before one tick.', 'One tick issues at most one floor-step command. The floor changes on a later arrival acknowledgement, and duplicate stops coalesce. Trusted simulated sensor events are serialized with commands.', 'Command issuance does not prove arrival or eliminate races without an event model.', 'Why check movementPending?', 'A second tick before acknowledgement must not issue another movement step.'],
      ['Distinguish a request from a car state.', 'Draw HallRequest with floor/direction and Car with floor, door, and service state.', 'A hall request expresses where a passenger waits and the desired direction. Car stores the simulation state used to decide whether movement is permitted.', 'A direction request is not a destination already assigned to a car.', 'Does Car choose which hall call it receives?', 'No. Scheduler assigns requests; the car object represents physical simulation state.'],
      ['Separate assignment from stop ordering.', 'Add Scheduler above Controllers, each owning one Car and a stop set.', 'Scheduler chooses a controller for a hall call. Each Controller owns its stops and movement lifecycle. Internal requests go directly to that controller rather than through global assignment.', 'The two scheduling decisions have different information and constraints.', 'Who decides the next stop within car A?', 'Controller A, using its current direction and pending stop set.'],
      ['Justify a replaceable car-selection rule.', 'Add SelectionPolicy to Scheduler and nextStop to Controller.', 'Nearest-compatible and least-busy selection can vary, so assignment gets a strategy. Stop ordering stays local. A fast selection rule is not allowed to bypass movement guards.', 'Strategy isolates optimization from command legality.', 'Is nearest distance always the best selection?', 'No. Direction, pending stops, capacity, and request age affect estimated service time.'],
      ['Trace a hall call and later internal destination.', 'Draw assign three UP, choose A, submit three, tick, command, and acknowledgement.', 'The hall call reaches Scheduler, the policy picks A, and A queues floor three. A tick checks guards and issues one step. Arrival events update position; once aboard, the passenger submits seven to A directly.', 'This distinguishes asynchronous movement from synchronous API calls.', 'Does commandStep immediately set floor to the target?', 'No. It starts one pending step; acknowledgement updates floor, and more ticks may be needed.'],
      ['Demonstrate the open-door rejection.', 'Stop tick at a false doorClosed reading and keep the stop queue visible.', 'The car door is open, so this tick returns without a command. Pending stops remain queued and floor remains unchanged. This Java guard is a simulator rule, not a certified hardware interlock.', 'Naming the limitation prevents false safety guarantees.', 'What if a car fails before accepting a hall assignment?', 'Reject that assignment and retry an eligible car with the same hall-request identity; do not reassign onboard destinations as if passengers moved.'],
      ['Code a guarded single movement decision.', 'Underline guard returns, the current-floor branch, and commandStep.', 'I check service, door, overload, and pending movement before looking up the target. At the target I remove the stop and open the door; otherwise I command one step toward it.', 'A single event loop prevents guard reads and command issuance from interleaving with another simulated event.', 'What contract must commandStep satisfy?', 'Set movement pending before returning and later emit acknowledgement or fault; it must not pretend movement instantly completed.'],
      ['Discuss fairness separately from correctness.', 'Draw an UP sweep with an aging DOWN request and a maximum wait annotation.', 'Directional sweeps reduce travel but can starve the opposite queue. I would age requests or bound sweep duration. Separate controller loops improve isolation but need careful snapshot and assignment protocols.', 'Throughput optimization is incomplete without a starvation story.', 'Why not one thread per request?', 'It scatters ownership and permits competing commands. Serialized car events make movement state easier to reason about.'],
    ],
    code: `void tick() {
    if (!car.inService() || !car.doorClosed() || car.overloaded()) return;
    if (car.movementPending()) return;
    OptionalInt target = nextStop();
    if (target.isEmpty()) return;
    int floor = target.getAsInt();
    if (floor == car.floor()) {
        stops.remove(floor);
        car.openDoor();
        return;
    }
    car.commandStep(Integer.compare(floor, car.floor()));
}`,
    codeNote: 'Inside Controller on one serialized simulation event loop. Car.commandStep marks pending synchronously, with arrival updates later. Real equipment requires independent certified safety systems.',
    recap: 'Redraw hall assignment separately from internal submit, then point to the guarded tick and acknowledgement.',
    script: 'I separate assigning a hall call from choosing a car stop. Scheduler uses SelectionPolicy, each Controller owns a deduplicated stop set, and Car exposes simulated movement state. A tick checks door, overload, service, and pending movement before commanding one step; acknowledgement updates the floor later. Internal destinations stay with the boarded car. Aging can improve fairness. This is a deterministic interview simulator, not a production safety controller.',
    closing: 'The full explanation must keep optimization, ownership, asynchronous movement, and safety scope distinct.',
    followUps: [
      ['How do you prevent starvation under continuous UP calls?', 'Track waiting age and bound a sweep or prioritize sufficiently old requests, then test a continuous-arrival workload against a stated wait target.'],
      ['What if a selection snapshot becomes stale?', 'The selected controller must validate acceptance against current service state; Scheduler retries a rejected hall assignment rather than assuming the snapshot reserved capacity.'],
      ['What does a fault with passengers aboard mean?', 'Enter a simulator fault/recovery state and retain onboard destinations. Real passenger rescue and hardware procedures are explicitly outside this software sketch.'],
    ],
  },
  {
    id: 'vending-machine',
    source: 'Original teaching model. The guide records no reviewed vending repository implementation; supplied PDF access does not establish verified hardware or code behavior.',
    classes: [
      `class Product {
  +String slot
  +long price
}
class Inventory {
  +product(slot) Product
  +available(slot) int
  +reserve(slot, vendId)
}
class VendPlan {
  +String slot
  +long price
  +CoinPlan change
}
Inventory *-- Product
VendPlan --> Product : selected slot`,
      `class Machine {
  -State state
  -long credit
  -String selectedSlot
  +prepareVend() VendPlan
  +cancel()
}
Machine --> Inventory
Machine --> VendPlan`,
      `class ChangePlanner {
  +exact(amount) Optional
}
class Dispenser {
  +dispense(vendId, slot) Outcome
}
Machine --> ChangePlanner
Machine --> Dispenser
note for Machine "IDLE, COLLECTING, DISPENSING, OUT_OF_SERVICE"`,
    ],
    success: `actor Customer
participant Machine
participant Inventory
participant ChangePlanner
participant Journal
participant Dispenser
Customer->>Machine: select A1 and insert 100
Machine->>Machine: prepareVend()
Machine->>Inventory: product(A1) and available(A1)
Inventory-->>Machine: price 65 and stock 1
Machine->>ChangePlanner: exact(35)
ChangePlanner-->>Machine: bounded coin plan
Machine->>Inventory: reserve(A1, vendId)
Machine->>Machine: reserve change under same event serialization
Machine->>Journal: persist vendId and reservations
Machine->>Dispenser: dispense(vendId, A1)
Dispenser-->>Machine: definite product delivered
Machine->>Machine: commit product and escrow then deliver reserved change
Machine->>Journal: record accounted success
Machine-->>Customer: return to IDLE`,
    failure: `actor Customer
participant Machine
participant Journal
participant Dispenser
Customer->>Machine: confirm prepared purchase
Machine->>Journal: persist vendId and reserved resources
Machine->>Dispenser: dispense(vendId, A1)
Dispenser-->>Machine: timeout with delivery unknown
Machine->>Journal: record UNKNOWN
Machine->>Machine: OUT_OF_SERVICE and block new input
Machine-->>Customer: recovery required
Note over Machine,Dispenser: No second motor command and no automatic full refund`,
    beats: [
      ['Bound one cash-funded customer session.', 'Draw a selected slot, coin escrow, and a product chute.', 'I support one cash customer at a time with fixed slots and integer prices. I include cancellation, exact change, and uncertain dispensing, but not card payments or remote replenishment.', 'Cash escrow and physical delivery define the hard boundaries.', 'Why keep inserted coins in escrow?', 'Cancellation can return the customer original coins before a sale instead of solving a new change-making problem.'],
      ['Define legal states and resource promises.', 'Write IDLE, COLLECTING, DISPENSING, OUT_OF_SERVICE and stock plus change reservations.', 'A vend requires stock, sufficient credit, and a feasible bounded change plan. Once dispensing starts, I block new input. A timeout does not prove that the product stayed inside.', 'Both resource feasibility and physical uncertainty affect correctness.', 'Is enough total coin value sufficient for change?', 'No. The required amount must be representable by available denominations and counts.'],
      ['Model stock and a proposed vend separately.', 'Draw Product, Inventory, and VendPlan with selected slot, price, and coin plan.', 'Inventory owns slot counts. VendPlan describes one proposed product and change combination but does not reserve anything by itself.', 'A plan is a calculation, not ownership of scarce resources.', 'Can two operations consume the same unreserved plan?', 'They could if planning and reservation were separated by other events; reserve the plan immediately within serialized machine handling.'],
      ['Give Machine lifecycle and escrow ownership.', 'Add Machine with state, credit, selectedSlot, and prepareVend.', 'Machine owns the session and coordinates inventory. Selection may change while collecting because credit belongs to the session, not to the old selected product.', 'Product objects should not own customer money or event legality.', 'Where is cancellation legal?', 'Before physical dispensing begins, while resources and escrow can be released without uncertainty; dispensing requires an outcome-aware recovery path.'],
      ['Use state-oriented handling and a pure change planner.', 'Add ChangePlanner and Dispenser ports around Machine.', 'An enum transition table is enough initially. ChangePlanner searches bounded coin combinations, and Dispenser isolates the hardware contract. I add State classes only if event-specific behavior becomes large.', 'Patterns should expose lifecycle and hardware seams, not obscure them.', 'Is a greedy largest-coin rule always correct?', 'No. With limited counts or arbitrary denominations, a smaller-coin combination can succeed where greedy gets stuck.'],
      ['Trace preflight, reservation, and definite delivery.', 'Draw price sixty-five, credit one hundred, and change thirty-five before the motor call.', 'prepareVend computes a plan without mutation. The event handler reserves stock and change, journals a vend ID, then commands hardware. Definite success commits the product and escrow and accounts for change.', 'The motor must not run before both resources are promised.', 'When can the machine return to IDLE?', 'Only after the product outcome and change obligation are accounted for; product delivery alone does not erase a change failure.'],
      ['Treat an unknown dispense as recovery, not rollback.', 'Draw timeout leading to OUT_OF_SERVICE and a retained journal entry.', 'The hardware response is lost, so I cannot know whether a product was delivered. I retain the vend record, disable sales, and reconcile sensor or operator evidence before retrying or refunding.', 'A second motor command can deliver twice, and a blind refund can give away a delivered product.', 'What if product delivery is definite but change fails?', 'Record the remaining change liability and recover that obligation; do not roll back a product already delivered.'],
      ['Code side-effect-free preflight.', 'Underline state, stock, credit, and bounded change checks before returning VendPlan.', 'This method only prepares. It rejects a sold-out slot, insufficient credit, or impossible change without altering stock, escrow, or coin counts.', 'Pure planning is easy to test and does not pretend to solve hardware transactions.', 'Does returning VendPlan authorize immediate hardware I/O?', 'Not yet. Reserve its stock and coins and persist operation identity before issuing the physical command.'],
      ['Defend availability loss after ambiguity.', 'Compare enum versus State classes and sketch a durable vend journal.', 'I prefer explicit transitions over a class for every product slot. A journal adds recovery work, but stopping sales after an uncertain command is safer than pretending software can undo physical delivery.', 'Correct accounting may deliberately sacrifice availability.', 'How should definitely no-product failure differ from UNKNOWN?', 'Definite no-delivery permits releasing reservations and returning escrow; UNKNOWN requires evidence before selecting that recovery.'],
    ],
    code: `VendPlan prepareVend() {
    if (state != State.COLLECTING || selectedSlot == null)
        throw new IllegalStateException("Select and fund first");
    Product product = inventory.product(selectedSlot);
    if (inventory.available(selectedSlot) == 0)
        throw new IllegalStateException("Sold out");
    if (credit < product.price()) throw new IllegalStateException("More credit needed");
    long change = credit - product.price();
    CoinPlan coins = planner.exact(change)
        .orElseThrow(() -> new IllegalStateException("Exact change unavailable"));
    return new VendPlan(selectedSlot, product.price(), coins);
}`,
    codeNote: 'Inside Machine on one event loop, with validated slot selection and positive prices. ChangePlanner is pure bounded-coin search. Reservations, journal persistence, escrow settlement, and hardware recovery are not implemented by this method.',
    recap: 'Redraw the four lifecycle states, Inventory, ChangePlanner, Dispenser, and escrow-to-settlement boundary.',
    script: 'I model one cash session with explicit collecting and dispensing states. Coins remain in escrow until success. prepareVend verifies stock, credit, and exact change without mutation, then serialized handling reserves resources and journals a vend ID before hardware I/O. Definite success settles product and change. An unknown dispense stops sales and enters recovery rather than triggering a second motor call or automatic refund. State-oriented handling and hardware ports are useful here; product subclass hierarchies are not.',
    closing: 'A complete speech includes both exact-change feasibility and irreversible hardware uncertainty.',
    followUps: [
      ['Give a bounded-change case where greedy fails.', 'With coins of four and three, one four and two threes can make six only as three plus three; greedily taking four leaves an impossible remainder.'],
      ['How does cancellation return money?', 'While collecting, return the actual escrow coins and release any pre-dispense reservations. Hardware-uncertain sessions must follow recovery instead.'],
      ['What is the recovery evidence?', 'A durable vend identity plus reliable delivery sensor records, hardware status lookup, or operator reconciliation; a missing acknowledgement alone proves neither success nor failure.'],
    ],
  },
  {
    id: 'atm',
    source: 'Guide observations cover ATMRoom and CashWithdrawalState. The reviewed withdrawal deducts balances before a denomination chain; exact-note planning and recovery here are original extensions.',
    classes: [
      `class CashInventory {
  -Map noteCounts
  +snapshot() Map
  +reserve(id, plan)
}
class CashPlan {
  +Map notes
}
class Withdrawal {
  +String id
  +Status status
}
Withdrawal --> CashPlan
CashPlan ..> CashInventory : bounded note counts`,
      `class Session {
  -State state
  -String accountToken
  +authenticate(pin)
  +planWithdrawal(amount) CashPlan
  +withdraw(amount) Withdrawal
}
Session --> CashInventory
Session --> Withdrawal`,
      `class NotePlanner {
  +exact(amount, snapshot) Optional
}
class BankPort {
  +authorize(id, account, amount)
  +capture(id)
  +release(id)
}
class Dispenser {
  +dispense(id, plan) Outcome
}
Session --> NotePlanner
Session --> BankPort
Session --> Dispenser`,
    ],
    success: `actor Customer
participant Session
participant NotePlanner
participant CashInventory
participant BankPort
participant Journal
participant Dispenser
Customer->>Session: withdraw(amount) after authentication
Session->>Session: planWithdrawal(amount)
Session->>CashInventory: snapshot()
Session->>NotePlanner: exact(amount, snapshot)
NotePlanner-->>Session: CashPlan
Session->>CashInventory: reserve(withdrawalId, plan)
Session->>BankPort: authorize(withdrawalId, account, amount)
BankPort-->>Session: authorized
Session->>Journal: persist operation before hardware call
Session->>Dispenser: dispense(withdrawalId, plan)
Dispenser-->>Session: definite delivery
Session->>BankPort: capture(withdrawalId)
Session->>CashInventory: commit delivered notes once
Session-->>Customer: complete session and return card`,
    failure: `actor Customer
participant Session
participant BankPort
participant Journal
participant Dispenser
Customer->>Session: withdraw(amount)
Note over Session: Plan and reserve notes before authorization
Session->>BankPort: authorize(withdrawalId, account, amount)
BankPort-->>Session: authorized
Session->>Journal: persist withdrawalId
Session->>Dispenser: dispense(withdrawalId, plan)
Dispenser-->>Session: partial or unknown delivery
Session->>Journal: record recovery required
Session-->>Customer: unresolved delivery
Note over BankPort,Dispenser: No blind full reversal and no second dispense`,
    beats: [
      ['Bound one authenticated cash session.', 'Draw card session, bank funds, and a physically separate cash dispenser.', 'I support one authenticated withdrawal at a terminal. The bank owns account funds, the ATM owns note inventory, and the dispenser produces a physical outcome that software cannot simply roll back.', 'Ledger state and delivered cash are separate domains.', 'Should PIN values appear in traces?', 'No. Authentication uses a protected bank-facing contract, and application logs must not contain raw PIN values.'],
      ['Agree on money, states, and uncertainty.', 'Write positive minor-unit amount, configured limit, authenticated state, and withdrawal ID.', 'I require authentication, a positive in-limit amount, and an exact note combination. One withdrawal ID follows authorization, dispense, and settlement. Unknown or partial delivery enters recovery, not automatic refund.', 'Silence from hardware is not evidence that no cash left.', 'Does divisibility by the smallest denomination guarantee feasibility?', 'No. Current counts can still make the amount impossible, so a bounded planner is necessary.'],
      ['Distinguish a cash plan from an operation record.', 'Draw CashInventory, CashPlan, and Withdrawal with stable ID/status.', 'CashPlan describes exact notes. CashInventory owns counts and reservations. Withdrawal correlates one operation across the bank and hardware, rather than treating every retry as a new withdrawal.', 'A total cash balance cannot describe which notes are available.', 'What does a plan reserve by itself?', 'Nothing. The calculated note counts must be reserved before any other terminal event can consume them.'],
      ['Let Session control legal actions.', 'Add Session with authentication, planWithdrawal, and withdraw.', 'Session rejects withdrawals before authentication and coordinates planning. A serialized terminal boundary covers planning plus reservation, while durable operation handling continues if the user session ends.', 'Session lifecycle must not erase unresolved bank/hardware obligations.', 'Can returning the card mean settlement is finished?', 'No. A delivered-cash withdrawal may still need backend capture reconciliation even after the session ends.'],
      ['Add bank and hardware contracts without assuming universal semantics.', 'Add NotePlanner, BankPort authorize/capture/release, and Dispenser.', 'I use a pure note planner and adapters for bank and hardware. This teaching bank contract supports authorization then capture; an actual integration may require a different explicit protocol.', 'An adapter normalizes a real contract rather than inventing bank guarantees.', 'Why not decrement notes along a denomination chain?', 'A later unfillable remainder would leave partial mutations. Prove a complete bounded plan before changing counts.'],
      ['Trace planned cash before authorization and delivery.', 'Draw plan, reserve, authorize, journal, dispense, capture, and note commit.', 'After authentication I calculate and reserve exact notes, obtain bank authorization, and persist the withdrawal ID before dispensing. Definite delivery leads to capture and one accounted cassette update.', 'Recovery requires identity before the irreversible hardware call.', 'What if capture fails after delivery?', 'Retry settlement with the same withdrawal identity. Cash already delivered cannot be undone by restoring an in-memory balance.'],
      ['Handle partial or unknown delivery honestly.', 'Draw dispenser uncertainty into a recovery journal without a refund arrow.', 'The dispenser reports partial or unknown delivery. I retain evidence and reconcile actual cash before determining capture or reversal. I do not dispense again or automatically reverse the entire amount.', 'A naive refund can credit a customer who already received cash.', 'What if authorization is definitively rejected instead?', 'Release the reserved notes and never invoke the dispenser; there is no uncertain physical action in that branch.'],
      ['Code non-mutating amount and note checks.', 'Underline authenticated, range/unit checks, and exact planner result.', 'planWithdrawal validates the session and amount, then asks a bounded planner for exact notes from a snapshot. Failure changes neither bank funds nor cassette counts.', 'The excerpt proves preflight feasibility only, not a distributed cash transaction.', 'What prevents the plan from going stale?', 'Reserve immediately under the same terminal serialization boundary after planning, before another operation can consume notes.'],
      ['Justify state handling and durable recovery.', 'Compare pure planning with a mutating greedy chain and draw a withdrawal journal.', 'State-oriented handling makes legal operations clear. A bounded planner costs computation but avoids partial denomination failure. Durable recovery is necessary because database rollback cannot retract cash from a customer.', 'A simulated successful dispenser is not validation of physical fault handling.', 'Does a withdrawal ID alone prevent all duplicates?', 'No. Bank, hardware, and local transitions need explicit deduplication/reconciliation contracts; the ID only correlates them.'],
    ],
    code: `CashPlan planWithdrawal(long amountMinor) {
    if (state != State.AUTHENTICATED)
        throw new IllegalStateException("Authenticate first");
    if (amountMinor <= 0 || amountMinor > limitMinor
            || amountMinor % unitMinor != 0)
        throw new IllegalArgumentException("Unsupported amount");
    return planner.exact(amountMinor, inventory.snapshot())
        .orElseThrow(() -> new IllegalStateException("Cannot dispense exactly"));
}`,
    codeNote: 'Inside Session with positive configured limitMinor/unitMinor and NotePlanner planner. Pure bounded-note planning only; reservation follows under terminal serialization. Bank authentication, journaling, callbacks, and hardware recovery are omitted.',
    recap: 'Redraw Session, CashInventory, NotePlanner, BankPort, Dispenser and the recovery path for an unknown withdrawal.',
    script: 'I separate authenticated session state, bank funds, and physical cash inventory. I validate the amount and compute an exact bounded note plan before reserving notes and authorizing funds. A durable withdrawal ID precedes dispensing. Definite delivery is captured and accounted once; definite no-delivery can release reservations. Partial or unknown delivery needs reconciliation, not a blind refund or second dispense. The Java excerpt covers preflight only, and the bank authorization contract is an explicit assumption.',
    closing: 'The final answer must preserve the difference between rejection, no delivery, partial delivery, and unknown delivery.',
    followUps: [
      ['How can greedy note selection fail?', 'For 600 with one 500 note and three 200 notes, greedy takes 500 and fails on 100, while three 200 notes work. Use bounded search or an algorithm valid for the configured denominations.'],
      ['What if a callback is duplicated?', 'Persist the withdrawal state/version and already-accounted outcome, then apply a matching delivery/capture update at most once through the same transition boundary.'],
      ['What must restart recovery inspect?', 'The durable withdrawal record, bank authorization/capture status, and reliable dispenser evidence for actual delivered notes before deciding settlement or reversal.'],
    ],
  },
];