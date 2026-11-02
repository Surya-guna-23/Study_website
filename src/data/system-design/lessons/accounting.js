export default [
  {
    id: 'splitwise',
    source: 'Guide observations cover ExpenseController and BalanceSheetController with double-based mutations. Integer allocation, zero-sum ledger, and transactional identity here are original guidance.',
    classes: [
      `class Expense {
  +String id
  +String payerId
  +long totalMinor
}
class Share {
  +String memberId
  +long amountMinor
}
Expense *-- Share : exact total allocation`,
      `class ExpenseService {
  +addExpense(request) Expense
  +settle(from, to, amount)
}
class Ledger {
  +appendOnce(id, fingerprint, entries)
  +balance(userId) long
}
ExpenseService --> Expense
ExpenseService --> Ledger`,
      `class SplitPolicy {
  +allocate(total, participants) List
}
class EqualSplitPolicy {
  +equalShares(total, orderedMembers) List
}
SplitPolicy <|.. EqualSplitPolicy
ExpenseService --> SplitPolicy`,
    ],
    success: `actor User
participant ExpenseService
participant SplitPolicy
participant Ledger
User->>ExpenseService: addExpense(E1, payer A, total 100, A B C)
ExpenseService->>ExpenseService: validate group, currency, unique participants
ExpenseService->>SplitPolicy: allocate(100, A B C)
SplitPolicy-->>ExpenseService: A 34, B 33, C 33
ExpenseService->>ExpenseService: build A +100, A -34, B -33, C -33
ExpenseService->>ExpenseService: verify shares 100 and postings zero
ExpenseService->>Ledger: appendOnce(E1, fingerprint, entries)
Ledger-->>ExpenseService: committed expense and postings
ExpenseService-->>User: net A +66, B -33, C -33`,
    failure: `actor User
participant ExpenseService
participant SplitPolicy
participant Ledger
User->>ExpenseService: addExpense(E2, total 100, exact shares)
ExpenseService->>SplitPolicy: allocate(100, participants)
SplitPolicy-->>ExpenseService: 33, 33, 33
ExpenseService->>ExpenseService: sum is 99 not 100
ExpenseService-->>User: reject mismatched shares
Note over Ledger: No appendOnce and balances unchanged`,
    beats: [
      ['Scope expense allocation and obligations.', 'Draw A paying 100 cents for A, B, and C.', 'I record group expenses and settlements in one currency. The system tracks obligations, not actual bank transfers, and debt simplification is a separate suggested view.', 'Balances should not imply that money physically moved.', 'Must the payer consume a share?', 'No. The payer must be a group member but can pay for others without participating in consumption.'],
      ['Conserve minor units and define signs.', 'Write shares 34, 33, 33 and positive means should receive.', 'Shares are nonnegative integers totaling exactly the expense. I credit the payer by the total and debit every consumer, including the payer own share, so net postings sum to zero.', 'Independent rounding or floating-point tolerance can create or lose money.', 'What is A net balance after paying 100 and consuming 34?', 'Positive 66, with B and C each at negative 33. The sum remains zero.'],
      ['Make the expense allocation immutable.', 'Draw Expense with payer/total and its Share records.', 'Expense records one paid amount and immutable shares. Share ties one member to exact minor units, and duplicate member IDs are rejected before allocation.', 'An expense is evidence for later views and corrections.', 'Why preserve original shares?', 'They explain who consumed the expense even if later debt simplification recommends different settlement pairs.'],
      ['Give the service one atomic ledger boundary.', 'Add ExpenseService and Ledger.appendOnce with ID/fingerprint.', 'ExpenseService validates membership and currency, builds all postings, and asks Ledger to append the expense and identity metadata atomically. Partial user-balance updates are not acceptable.', 'Every accepted expense must preserve the zero-sum invariant as a whole.', 'What happens if the process crashes halfway through a durable append?', 'The database transaction must commit all postings and identity metadata or none. The teaching contract requires that, but the split helper does not implement it.'],
      ['Use Strategy for genuine allocation variants.', 'Add SplitPolicy and EqualSplitPolicy alongside the unchanged ledger.', 'Equal, exact, and percentage allocations justify a split strategy. Ledger accepts validated postings and does not care which policy produced the shares.', 'Allocation variation should not duplicate accounting logic.', 'How should percentages be represented?', 'Use exact integer basis points totaling 10000 and distribute residual minor units by a documented deterministic rule.'],
      ['Trace the payer own debit as well as credit.', 'Draw allocate returning 34/33/33 and four postings before appendOnce.', 'A pays 100. Equal splitting returns 34 to A and 33 each to B and C. I post A plus 100 and A minus 34, then B and C minus 33, and commit all four entries.', 'Omitting the payer share overstates what others owe.', 'How does B settling 33 to A change net balances?', 'Post B plus 33 and A minus 33: A becomes plus 33, B zero, and C minus 33.'],
      ['Reject a non-conserving allocation without writes.', 'Draw exact shares 33/33/33 against a total of 100 and no Ledger arrow.', 'The proposed shares total 99, so ExpenseService rejects before appendOnce. I do not hide the missing cent as a tolerance or patch one member balance afterward.', 'Conservation is a required invariant, not an approximate check.', 'What if expense E1 is retried with a different total?', 'Its fingerprint conflicts. Reject it instead of treating changed content as a matching replay.'],
      ['Implement deterministic remainder allocation.', 'Underline quotient, remainder, and the first remainder members receiving one extra cent.', 'I divide into a base amount and give one extra unit to the first remainder members in a stable validated order. This returns 34, 33, 33 for 100 across three people.', 'Determinism makes retries and explanations reproducible.', 'Can a share be zero?', 'Yes. For a small positive total and more participants than minor units, some nonnegative shares are zero while the sum remains exact.'],
      ['Defend ledger history and separate simplification.', 'Draw reversal plus replacement and a read-only settlement suggestion.', 'Integer money still needs overflow checks. Edits use a reversal and replacement rather than rewriting history. Net balances are compact, while pairwise provenance needs underlying expense records.', 'Greedy net settlement does not preserve every original pairwise obligation or prove a minimum transfer count.', 'Does greedy debtor-creditor matching guarantee the fewest transfers?', 'No. It proposes a valid plan under its assumptions, not a universal optimality proof.'],
    ],
    code: `List<Share> equalShares(long total, List<String> orderedMembers) {
    if (total <= 0 || orderedMembers.isEmpty())
        throw new IllegalArgumentException("Positive total and participants required");
    int count = orderedMembers.size();
    long base = total / count;
    long remainder = total % count;
    List<Share> result = new ArrayList<>();
    for (int i = 0; i < count; i++) {
        long amount = base + (i < remainder ? 1 : 0);
        result.add(new Share(orderedMembers.get(i), amount));
    }
    return List.copyOf(result);
}`,
    codeNote: 'Helper inside EqualSplitPolicy, called by allocate. orderedMembers is a validated immutable distinct-ID list in stable order. Share is a value record. Ledger persistence, fingerprint handling, and safe posting sums are outside this method.',
    recap: 'Redraw Expense, Share, service, SplitPolicy, and Ledger; speak all four postings for the 100-cent example.',
    script: 'I separate share calculation from accounting. A SplitPolicy produces nonnegative integer shares totaling exactly the expense. ExpenseService credits the payer and debits every consumer, including the payer, then atomically appends zero-sum postings with an expense identity and fingerprint. Equal splitting assigns remainder cents deterministically. Matching retries reuse the record, conflicting reuse fails, and edits use reversals. Net debt simplification is a separate suggestion, not a claim that money moved or that greedy matching is optimal.',
    closing: 'The rehearsal should demonstrate exact conservation with actual cents, not merely say Strategy and ledger.',
    followUps: [
      ['What if a group mixes currencies?', 'Reject mixed-currency postings or maintain separate currency ledgers. Conversion needs an explicit rate/timestamp and rounding policy, not direct addition.'],
      ['How do you edit an expense safely?', 'Append a linked reversal of its postings and a replacement expense in a transaction with new identity, preserving the original audit trail.'],
      ['How do you protect integer sums from overflow?', 'Validate bounded amounts and use checked arithmetic such as Math.addExact, or a wider exact type, when constructing and verifying posting totals.'],
    ],
  },
  {
    id: 'cricbuzz',
    source: 'Guide observations cover BallDetails and BattingScoreUpdater with random normal deliveries and observers. Ordered ingestion, extras, deduplication, and correction replay here are original extensions.',
    classes: [
      `class DeliveryEvent {
  +String id
  +long sequence
  +int batterRuns
  +int extras
  +boolean legal
}
class Scorecard {
  -int teamRuns
  -int legalBalls
  -int wickets
}
DeliveryEvent ..> Scorecard : input to pure reduction`,
      `class Scorer {
  -long nextSequence
  -Map accepted
  +accept(event) Scorecard
  +currentScore() Scorecard
}
Scorer --> DeliveryEvent
Scorer *-- Scorecard`,
      `class ScoreObserver {
  +onScore(version, score)
}
Scorer --> ScoreObserver : publish after commit
Scorer : +reduce(score, event) Scorecard`,
    ],
    success: `actor Feed
participant Scorer
participant Scorecard
participant ScoreObserver
Feed->>Scorer: accept(E1, sequence 1, legal run)
Scorer->>Scorer: check identity and expected sequence
Scorer->>Scorer: validateDelivery(E1)
Scorer->>Scorer: reduce(score, E1)
Scorer->>Scorecard: construct immutable next score
Scorecard-->>Scorer: next snapshot
Scorer->>Scorer: save E1 result and advance sequence atomically
Scorer-->>Feed: accepted snapshot
Scorer-->>ScoreObserver: onScore(version 1, snapshot) after commit`,
    failure: `actor Feed
participant Scorer
participant Scorecard
participant ScoreObserver
Feed->>Scorer: accept(E3, sequence 3) while expecting 2
Scorer->>Scorer: no duplicate ID but sequence gap
Scorer-->>Feed: Sequence gap
Note over Scorecard,ScoreObserver: No reduction and no publication
Feed->>Scorer: replay E1 with identical payload
Scorer-->>Feed: saved historical result for E1
Note over Scorer: Current totals and nextSequence do not change`,
    beats: [
      ['Scope authoritative scoring for one innings.', 'Draw one scoring feed and separate scoreboard/commentary views.', 'I support one limited-overs innings with an authoritative event feed. I include extras, ordering, duplicates, and corrections, but defer tournaments, rain rules, and full match-format variation.', 'A focused reducer is easier to validate than a complete sports platform.', 'Are observer views the authoritative score?', 'No. They receive snapshots derived from accepted events; they cannot independently redefine the official total.'],
      ['Distinguish deliveries, legal balls, and run attribution.', 'Write batter runs plus extras equals team runs, and fourteen legal balls as 2.2 overs.', 'A wide or no-ball is recorded without advancing the legal-ball count. Six legal balls make an over. Wicket metadata separately controls team dismissal and bowler credit.', 'Event count, over notation, and individual statistics are different projections.', 'Is 2.2 overs a decimal number for arithmetic?', 'No. It means two complete overs and two legal balls; store fourteen legal balls internally.'],
      ['Keep immutable input apart from the score projection.', 'Draw DeliveryEvent with ID/sequence/runs/extras and Scorecard with totals.', 'DeliveryEvent records what the scorer accepted. Scorecard is a derived immutable snapshot. Correcting a delivery should preserve the original evidence rather than silently overwrite a number.', 'A total alone cannot reconstruct strike, wickets, or player statistics.', 'Why does an event need both ID and sequence?', 'ID identifies a retry; sequence determines its position in the innings. Neither substitutes for the other.'],
      ['Give Scorer the acceptance boundary.', 'Add Scorer.accept with accepted map and nextSequence above the score.', 'Scorer checks identity, order, and delivery validity before pure reduction. It stores the accepted event and resulting snapshot together, then advances the expected sequence.', 'Multiple independent writers could otherwise score the same delivery twice or out of order.', 'What does an identical replay return?', 'The saved result for that event, which may be historical rather than current. currentScore is a separate query.'],
      ['Publish committed snapshots with Observer.', 'Add ScoreObserver and a post-commit arrow from Scorer.', 'Observer fits multiple independent score consumers. I publish versioned immutable snapshots after acceptance, so a failed commentary subscriber cannot roll back authoritative scoring.', 'Notification delivery and score mutation must not share uncontrolled side effects.', 'Can two observers each update the authoritative run total?', 'No. The reducer owns that total; observers update only their own projections or presentation.'],
      ['Trace the first accepted event.', 'Draw identity check, sequence one, validate, reduce, save, then notification.', 'E1 arrives with sequence one. Scorer validates and reduces it into a new snapshot, records the event/result, advances nextSequence, and only then notifies observers.', 'Publication before commit could expose a score that was never accepted.', 'What if an observer throws after acceptance?', 'Keep the accepted score and retry or resynchronize that observer separately.'],
      ['Reject gaps and replay duplicates without mutation.', 'Draw E3 arriving before E2, then a replay of E1.', 'E3 cannot pass while two is expected, so no reduction runs. A matching E1 replay returns its old recorded result without changing current totals. A changed E1 payload is a conflict, not a correction.', 'Identity and order checks prevent independent classes of corruption.', 'How is a genuine correction represented?', 'As a new revision superseding the earlier event with an audit link, followed by ordered replay of affected projections.'],
      ['Code deduplication before sequence validation.', 'Underline prior lookup, payload equality, sequence guard, and the atomic local update.', 'I look up a prior ID first because an old valid replay naturally has an old sequence. A new event must match nextSequence before the pure reducer builds a candidate score.', 'Checking sequence first would incorrectly reject legitimate retries.', 'Does this monitor make score acceptance crash-safe?', 'No. Durable event, projection version, and notification outbox require a shared transaction.'],
      ['Defend replay and versioned views.', 'Compare full replay with snapshots/checkpoints and show an observer version gap.', 'One scorer per innings simplifies order. Full replay is reasonable for a small match; checkpoints accelerate larger histories but must be invalidated when an earlier revision changes. Observers detect gaps and fetch a fresh snapshot.', 'Correcting only team runs misses dependent statistics and strike state.', 'Why not subtract a wicket directly?', 'A correction may change striker, dismissal attribution, legal-ball counts, and subsequent events; replay restores consistent dependent state.'],
    ],
    code: `synchronized Scorecard accept(DeliveryEvent event) {
    Saved prior = accepted.get(event.id());
    if (prior != null) {
        if (!prior.event().equals(event)) throw new IllegalArgumentException("ID conflict");
        return prior.result();
    }
    if (event.sequence() != nextSequence) throw new IllegalStateException("Sequence gap");
    validateDelivery(event);
    Scorecard next = reduce(score, event);
    accepted.put(event.id(), new Saved(event, next));
    score = next;
    nextSequence++;
    return next;
}`,
    codeNote: 'Inside one Scorer. DeliveryEvent/Saved/Scorecard are immutable values and reduce is pure. Notifications occur after this method. Durable ingestion, correction revisions, and the cricket rules reducer are not implemented in the excerpt.',
    recap: 'Redraw event, Scorer, Scorecard, Observer and contrast sequence gaps with identical replay.',
    script: 'I accept immutable ordered delivery events into one innings scorer. IDs deduplicate, sequences enforce order, and a pure reducer produces the authoritative score before observers see versioned snapshots. Legal balls differ from delivery count, and team runs differ from batter runs. A gap changes nothing; an identical replay returns its historical result. Corrections are revisions followed by replay because wickets and strike affect more than the total. Durable storage and notification recovery extend the in-memory boundary.',
    closing: 'The complete script should explain both cricket-specific accounting and reliable ordered ingestion.',
    followUps: [
      ['How do six legal balls plus a wide appear?', 'There are seven delivery events, but only six legal balls, so the over display is 1.0; the wide contributes extras rather than batter runs.'],
      ['Does every wicket increase the bowler wicket count?', 'No. Dismissal metadata determines attribution; for example, a run-out affects team wickets without crediting the bowler.'],
      ['What if a subscriber misses several updates?', 'Compare snapshot versions, ignore duplicate notifications, and fetch a current authoritative snapshot or replay the missing version range.'],
    ],
  },
  {
    id: 'inventory-management',
    source: 'Original teaching model. The supplied inventory link belongs to a separate repository that the guide says was not fetched or reviewed; no upstream implementation guarantee is asserted.',
    classes: [
      `class StockItem {
  +String sku
  -long onHand
  -long reserved
  +available() long
  +reserve(id, quantity) Reservation
}
class Reservation {
  +String id
  +long quantity
  +Status status
}
StockItem *-- Reservation`,
      `class InventoryService {
  +reserve(key, requestId, quantity) Reservation
  +ship(reservationId)
  +cancel(reservationId)
}
InventoryService --> StockItem : one warehouse SKU boundary`,
      `class StockRepository {
  +loadForUpdate(key) StockItem
  +save(item)
}
InventoryService --> StockRepository
StockRepository --> StockItem
note for StockItem "Aggregate correctness before optional selection strategies"`,
    ],
    success: `actor Order
participant InventoryService
participant StockRepository
participant StockItem
Order->>InventoryService: reserve(W1 SKU1, R1, 4)
InventoryService->>StockRepository: loadForUpdate(W1 SKU1)
StockRepository-->>InventoryService: item with onHand 10 and reserved 0
InventoryService->>StockItem: reserve(R1, 4)
StockItem->>StockItem: check identity and available then reserved becomes 4
StockItem-->>InventoryService: R1 ACTIVE
InventoryService->>StockRepository: save counters and request identity together
InventoryService-->>Order: available 6
Order->>InventoryService: ship(R1)
InventoryService->>StockItem: guarded active-to-shipped transition
StockItem-->>InventoryService: onHand 6 and reserved 0
InventoryService->>StockRepository: commit shipment state and counters`,
    failure: `actor OrderA
actor OrderB
participant InventoryService
participant StockItem
Note over StockItem: Six units available before competing requests
OrderA->>InventoryService: reserve(key, R2, 4)
InventoryService->>StockItem: reserve(R2, 4)
StockItem-->>OrderA: R2 ACTIVE and available 2
OrderB->>InventoryService: reserve(key, R3, 4)
InventoryService->>StockItem: reserve(R3, 4)
StockItem-->>OrderB: Insufficient stock
Note over StockItem: No R3 reservation and counts remain valid`,
    beats: [
      ['Scope one warehouse-SKU allocation.', 'Draw a stock bin and two orders asking for units.', 'I track integer units by warehouse and SKU, including receive, reserve, ship, and cancel. The first reservation contains one SKU; backorders, lots, expiry, and multi-warehouse fulfillment are later extensions.', 'A small aggregate gives an explicit atomicity boundary.', 'Is stock search a guarantee of allocation?', 'No. Only a successful guarded reservation promises units to an order.'],
      ['Define the three counters precisely.', 'Write onHand 10, reserved 3, available 7 and reserved no greater than onHand.', 'Reservation increases reserved without removing physical units. Shipment decreases both onHand and reserved. Cancellation decreases reserved only, because the goods never left.', 'Conflating a promise with physical removal causes incorrect cancellation and shipping.', 'What are the counters after shipping two of the three reserved units?', 'onHand becomes 8, reserved becomes 1, and available remains 7, assuming those two units were the shipped reservation.'],
      ['Give each promise identity and state.', 'Draw StockItem owning Reservation with ID, quantity, and ACTIVE/SHIPPED/CANCELLED.', 'StockItem owns counts and its reservation records. The record identifies which promise can ship or cancel, so a retry does not blindly decrement counters again.', 'Counters alone cannot distinguish owners or repeated commands.', 'Why retain a terminal reservation?', 'To recognize old retries and prevent a shipped or canceled promise from being applied again.'],
      ['Coordinate through the stock aggregate.', 'Add InventoryService.reserve, ship, and cancel above StockItem.', 'InventoryService resolves the warehouse-SKU key and authorization, while StockItem rechecks availability and changes its own counters. No caller receives a mutable counter map.', 'Every writer must preserve the same local count invariant.', 'What fields belong in a service-wide retry fingerprint?', 'Warehouse, SKU, order owner, quantity, and operation identity, not merely quantity on a stock object.'],
      ['Add persistence as a correctness boundary, not a decorative pattern.', 'Add StockRepository.loadForUpdate and save between service and stock.', 'Repository isolates persistence, but the important contract is saving counters and request identity together. A warehouse selection strategy is optional later, not necessary to reserve one known stock item.', 'A Repository interface without transactional semantics cannot prevent overselling.', 'Does the local synchronized method coordinate separate servers?', 'No. Shared row locks, conditional version updates, or equivalent database transactions must preserve the aggregate invariant.'],
      ['Trace reservation before physical shipment.', 'Draw ten units, reserve R1 for four, then ship R1.', 'R1 reserves four, producing onHand ten and reserved four. Shipment transitions R1 once, reducing both counters by four to six and zero. Payment and physical shipment evidence are separate concerns.', 'The two counter movements have different meanings and timings.', 'Does available change when a valid reservation ships?', 'Not for those units: both onHand and reserved decrease by the same amount, so their difference stays the same.'],
      ['Reject the second contender after serialization.', 'Draw two four-unit requests against six available units.', 'R2 wins four units and leaves two available. R3 rechecks under the same boundary and fails without adding a reservation or increasing reserved.', 'Both orders may have read six earlier, but only committed allocation matters.', 'What if warehouse shipment times out?', 'Do not cancel and resell the units blindly. Reconcile whether goods physically shipped before releasing the promise.'],
      ['Code matching retries before capacity changes.', 'Underline request lookup, quantity conflict, availability check, and one increment.', 'I validate the request, return a matching prior record, and reject changed quantities for that ID. A new request must fit onHand minus reserved before the record and increment are committed locally.', 'Retry safety depends on storing identity with the count change.', 'Why check prior before available?', 'A successful reservation retry should return its existing result even if the remaining stock is now insufficient for a new reservation.'],
      ['Discuss contention and wider orders.', 'Compare pessimistic locks with optimistic versions and sketch two SKU rows.', 'Row locks are simple under heavy contention; optimistic versions work with fewer conflicts but need bounded retries. Multi-SKU all-or-nothing orders need an ordered wider transaction, or compensation across warehouses.', 'A one-SKU proof does not automatically extend to an entire distributed order.', 'What if reserved goods are damaged?', 'Record the physical shortage and resolve affected promises explicitly; do not silently make available negative or pretend the units remain sellable.'],
    ],
    code: `synchronized Reservation reserve(String requestId, long quantity) {
    if (requestId == null || requestId.isBlank() || quantity <= 0)
        throw new IllegalArgumentException("Invalid request");
    Reservation prior = requests.get(requestId);
    if (prior != null) {
        if (prior.quantity() != quantity) throw new IllegalArgumentException("ID conflict");
        return prior;
    }
    if (quantity > onHand - reserved) throw new IllegalStateException("Insufficient stock");
    Reservation created = Reservation.active(requestId, quantity);
    requests.put(requestId, created);
    reserved += quantity;
    return created;
}`,
    codeNote: 'Inside StockItem fixed to one warehouse/SKU, with valid nonnegative counters and all writers on this monitor. Reservation is immutable to callers and terminal IDs are retained. Durable transactions, service-wide fingerprints, shipping, and cancellation are omitted.',
    recap: 'Redraw StockItem, Reservation, service, repository and calculate reserve/ship/cancel counter changes aloud.',
    script: 'I distinguish physical on-hand units from reserved promises and derive available as their difference. A warehouse-SKU StockItem owns atomic reservation and lifecycle updates. reserve checks identity before capacity, ship reduces both counters once, and cancel releases only the promise. Repository transactions must persist counters and request identity together across servers. Competing orders cannot both claim the last units, while uncertain physical shipment requires reconciliation. Multi-SKU orders need a wider transaction or explicit compensation.',
    closing: 'The final speech should preserve both numerical invariants and the physical meaning of shipment.',
    followUps: [
      ['How do repeated cancel and ship commands behave?', 'Check the retained reservation lifecycle and return the recorded outcome for matching retries; conflicting terminal operations cannot decrement counts again.'],
      ['How do you atomically reserve multiple SKUs in one database?', 'Lock stock rows in a stable key order, validate all quantities, and commit all reservations/counters in one transaction or roll them all back.'],
      ['When may a reservation expire?', 'When it is still an unfulfilled promise with no unresolved shipment. An uncertain physical fulfillment must be reconciled before expiry can release sellable capacity.'],
    ],
  },
];