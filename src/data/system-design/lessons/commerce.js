export default [
  {
    id: 'bookmyshow',
    source: 'Guide observations cover BookMyShowApp and BookingService, not Show internals. Expiring owner tokens and payment compensation are original extensions, not verified source guarantees.',
    classes: [
      `class SeatSlot {
  +String showId
  +int seatId
  +availableAt(now) boolean
  +assign(hold)
}
class Hold {
  +String token
  +String owner
  +Instant expiresAt
}
Hold --> SeatSlot : one or more show seats`,
      `class ShowInventory {
  -Map seats
  +hold(owner, ids, now) Hold
  +confirm(token, now)
  +release(token)
}
class BookingService {
  +checkout(token) Booking
}
ShowInventory *-- SeatSlot
ShowInventory --> Hold
BookingService --> ShowInventory`,
      `class PaymentPort {
  +pay(key, amount) Result
  +refund(paymentId)
}
BookingService --> PaymentPort
note for SeatSlot "AVAILABLE to HELD to BOOKED, expiry releases HELD"`,
    ],
    success: `actor Buyer
participant ShowInventory
participant BookingService
participant PaymentPort
Buyer->>ShowInventory: hold(A, seats 4 and 5, now)
ShowInventory->>ShowInventory: validate all seats then assign one token
ShowInventory-->>Buyer: hold token and expiry
Buyer->>BookingService: checkout(token)
BookingService->>PaymentPort: pay(checkoutKey, amount) outside inventory lock
PaymentPort-->>BookingService: success
BookingService->>ShowInventory: confirm(token, freshNow)
ShowInventory->>ShowInventory: verify owner and live expiry then book atomically
ShowInventory-->>BookingService: confirmed
BookingService-->>Buyer: committed booking then ticket notification`,
    failure: `actor BuyerA
actor BuyerB
participant BookingService
participant ShowInventory
participant PaymentPort
BuyerA->>BookingService: checkout(tokenA)
BookingService->>PaymentPort: pay(keyA, amount)
Note over ShowInventory: tokenA expires while payment is pending
BuyerB->>ShowInventory: hold(B, same seats, now)
ShowInventory-->>BuyerB: tokenB
PaymentPort-->>BookingService: late success for A
BookingService->>ShowInventory: confirm(tokenA, freshNow)
ShowInventory-->>BookingService: stale or expired hold
BookingService->>BookingService: record compensation pending
BookingService->>PaymentPort: refund(paymentIdA) with stable recovery identity
Note over ShowInventory: B retains ownership`,
    beats: [
      ['Focus on selling show-specific capacity.', 'Draw one physical seat appearing in two separate shows.', 'I include movie/show discovery, a temporary seat hold, checkout, and a ticket. The critical resource is a show-seat pair, not a physical seat across every screening.', 'Separating show inventory prevents unrelated performances blocking one another.', 'Can seat four be sold for two different shows?', 'Yes if they are valid non-overlapping screenings; each show has independent seat inventory.'],
      ['Specify ownership and expiry before payment.', 'Write AVAILABLE, HELD, BOOKED with owner, token, and expiresAt on HELD.', 'A customer acquires all requested seats or none under a five-minute hold. Confirmation requires the matching live token, with equality at expiry treated as expired.', 'Time alone cannot distinguish an old holder from a new holder.', 'May an old release request free a newer hold?', 'No. Release must compare the exact token and ownership before changing seat state.'],
      ['Draw the seat allocation and temporary claim.', 'Draw SeatSlot identified by showId/seatId and Hold spanning selected slots.', 'SeatSlot tracks availability for one performance. Hold groups the selected seats under one owner token and expiry, so the set can be validated consistently.', 'A booking cannot be modeled by toggling a global Seat.free flag.', 'What belongs on Hold besides expiry?', 'A unique token, owner identity, and immutable selected seat IDs.'],
      ['Put all-or-nothing seat updates in ShowInventory.', 'Add ShowInventory with hold, confirm, release and BookingService with checkout.', 'ShowInventory owns every seat writer for a show. BookingService coordinates payment, but it cannot skip inventory ownership checks just because a payment succeeded.', 'Coordination across systems does not replace local capacity enforcement.', 'Why validate every seat before assigning any?', 'If one seat is unavailable, the whole request must fail without leaving a partial hold.'],
      ['Use lifecycle states and a payment adapter.', 'Add PaymentPort outside ShowInventory and annotate the three slot states.', 'An enum is enough for the slot lifecycle. A payment adapter isolates providers. I never hold the inventory monitor across a payment network call.', 'External latency and local locking have incompatible lifetimes.', 'Is a distributed transaction implied by checkout?', 'No. Confirmation and payment require durable state plus compensation/reconciliation, not an imaginary transaction spanning a provider.'],
      ['Trace a valid hold through fresh confirmation.', 'Draw hold, pay outside lock, confirm using a fresh clock reading, then ticket.', 'A reserves seats four and five under one token. checkout pays with a stable attempt key. On success, confirm rechecks the token and current time before recording the booking and sending a ticket.', 'A previously valid hold may expire during the payment call.', 'Why use freshNow rather than the hold creation time?', 'Confirmation must evaluate expiry at the actual confirmation boundary, not reuse an old timestamp.'],
      ['Compensate late success without stealing seats.', 'Draw A expiry, B acquiring the same seats, and A late payment success.', 'A pays too late and B already owns the seats. confirm rejects A stale token. I record compensation pending and request a refund, leaving B allocation untouched.', 'Money received does not authorize overselling capacity.', 'Is a timeout an immediate refund case?', 'No. A timeout is an unknown payment result that must be reconciled before choosing confirmation or compensation.'],
      ['Code validation before assigning a hold.', 'Underline owner/list checks, the validation loop, and the separate assignment loop.', 'The first loop only validates. I construct one immutable hold and then assign it to every selected slot while still holding the same show monitor.', 'No partial assignment occurs for duplicate, missing, or unavailable seats.', 'What assumptions make the second loop safe?', 'All writers share the monitor, selected slots remain present, and assign is a nonthrowing local update after validation.'],
      ['Discuss lazy expiry and hot-show contention.', 'Compare per-show monitor with conditional seat rows and label lazy expiry.', 'Lazy expiry keeps correctness independent of a cleanup timer. A per-show lock is simple but limits a popular show; transactional conditional row updates can improve concurrency while preserving all-or-nothing acquisition.', 'A timer can be late, so validity must be checked on access.', 'What does a cleanup job contribute?', 'Reclaiming storage and refreshing displays, not the sole enforcement of expiry correctness.'],
    ],
    code: `synchronized Hold hold(String owner, List<Integer> ids, Instant now) {
    if (owner == null || owner.isBlank() || ids == null || ids.isEmpty()
          || ids.stream().anyMatch(Objects::isNull)
          || new HashSet<>(ids).size() != ids.size())
        throw new IllegalArgumentException("Invalid selection");
    for (int id : ids) {
        SeatSlot slot = seats.get(id);
        if (slot == null || !slot.availableAt(now))
            throw new IllegalStateException("Seat unavailable");
    }
    Hold h = Hold.create(owner, List.copyOf(ids), now.plusSeconds(300));
    for (int id : ids) seats.get(id).assign(h);
    return h;
}`,
    codeNote: 'Inside ShowInventory with a trusted injected time, every writer using the monitor, and nonthrowing assign. Hold acquisition only: durable booking, owner-authenticated checkout, payment keys, and refunds require additional implementation.',
    recap: 'Redraw show-seat inventory, hold token, checkout, and payment; rehearse A expiry followed by B ownership.',
    script: 'I key inventory by show and seat. ShowInventory atomically acquires all selected seats under one expiring owner token. BookingService pays outside the inventory lock and confirms only a still-live matching hold. If A payment succeeds after expiry and B now owns the seats, I compensate A rather than oversell. Slot states can remain an enum; a payment adapter and durable recovery protocol handle external outcomes. The excerpt demonstrates local hold acquisition, not a complete distributed booking transaction.',
    closing: 'The rehearsal should make both token ownership and the payment-versus-expiry race explicit.',
    followUps: [
      ['How do you test the exact expiry instant?', 'Inject a clock and assert confirmation succeeds just before expiresAt but fails at or after it, including a stale release after another owner acquires the seat.'],
      ['How do duplicate payment callbacks behave?', 'Load the stable payment/booking identity and conditionally transition once. A repeated success must not create another booking or refund.'],
      ['Should holds be longer for expensive tickets?', 'That is a product tradeoff: longer checkout improves customer completion but blocks scarce seats longer. Make duration explicit and measure abandonment.'],
    ],
  },
  {
    id: 'shopping-cart-coupons',
    source: 'Guide observations cover ShoppingCart and PercentageCouponDecorator using double arithmetic. Type eligibility was not reviewed; exact rounding, quote expiry, and redemption quotas here are original.',
    classes: [
      `class Cart {
  -List lines
  +subtotal() Money
}
class Quote {
  +Money total
  +List adjustments
  +Instant expiresAt
}
Quote --> Cart : immutable price snapshot`,
      `class PricingService {
  +quote(cart, context) Quote
}
class RedemptionService {
  +reserveOnce(checkoutId, couponId)
}
PricingService --> Cart
PricingService --> Quote
RedemptionService --> Quote : validate checkout`,
      `class CouponRule {
  +String id
  +int priority
  +eligible(context) boolean
  +afterPercentage(baseMinor, basisPoints) long
}
PricingService --> CouponRule : ordered pure pipeline
RedemptionService --> CouponRule : quota identity`,
    ],
    success: `actor Buyer
participant PricingService
participant CouponRule
participant Quote
participant RedemptionService
Buyer->>PricingService: quote(cart, context)
PricingService->>CouponRule: eligible(originalSubtotal)
CouponRule-->>PricingService: true
PricingService->>CouponRule: afterPercentage(10000, 2000)
CouponRule-->>PricingService: 8000
PricingService->>CouponRule: afterPercentage(8000, 1000)
CouponRule-->>PricingService: 7200
PricingService->>Quote: record total and rule adjustments
PricingService-->>Buyer: quote with expiry
Buyer->>RedemptionService: reserveOnce(checkoutId, couponId)
RedemptionService->>RedemptionService: validate quote and atomically reserve quota
RedemptionService-->>Buyer: checkout may proceed at approved price`,
    failure: `actor BuyerA
actor BuyerB
participant RedemptionService
participant PricingService
BuyerA->>RedemptionService: reserveOnce(checkoutA, lastCouponUse)
RedemptionService-->>BuyerA: reserved
BuyerB->>RedemptionService: reserveOnce(checkoutB, sameCoupon)
RedemptionService-->>BuyerB: quota exhausted
BuyerB->>PricingService: request revised quote
PricingService-->>BuyerB: price without exhausted coupon
Note over BuyerB,PricingService: Obtain consent before any changed charge`,
    beats: [
      ['Scope auditable price calculation and coupon usage.', 'Draw Cart to Quote separately from checkout quota.', 'I calculate discounts and produce a quote for one currency. Quote reads are pure; limited coupon usage belongs to checkout. Tax, shipping, refunds, and currency conversion are outside this first exercise.', 'A cart refresh must not consume a customer coupon.', 'Does calculating a quote redeem anything?', 'No. Redemption is a separate atomic operation at checkout.'],
      ['Fix bases, order, and rounding.', 'Write 100 to 80 to 72, and original subtotal for eligibility.', 'Eligibility uses the documented original subtotal, while each discount applies to the remaining eligible base. I round the adjustment once with HALF_UP and never permit a negative subtotal.', 'Decorator composition alone cannot decide business semantics.', 'Do twenty percent and ten percent mean thirty percent off?', 'No. Sequential percentages give 100 to 80 to 72 before any relevant minor-unit rounding.'],
      ['Keep quotes separate from mutable cart intent.', 'Draw Cart lines and Quote total, adjustments, and expiresAt.', 'Cart records product quantities and price snapshots. Quote records which rule versions changed the price and when that offer expires; it does not permanently mutate product prices.', 'An immutable quote provides a reproducible explanation of a charge.', 'What audit detail belongs in an adjustment?', 'Rule identity/version, eligible base, applied discount, and resulting amount under the chosen rounding policy.'],
      ['Separate calculation from scarce redemption.', 'Add PricingService.quote and RedemptionService.reserveOnce.', 'PricingService evaluates rules without side effects. RedemptionService validates the quote and atomically claims remaining coupon usage for a checkout ID.', 'Two valid-looking quotes can compete for the last redemption.', 'Where is an exhausted coupon rejected?', 'At the checkout quota reservation boundary, not by assuming an earlier quote reserved it.'],
      ['Choose an inspectable rule pipeline.', 'Add CouponRule with priority, eligibility, and adjustment behavior.', 'Decorator fits small transparent price wrappers. Here priorities, exclusions, and explanation records favor an ordered rule pipeline, so I do not force a deep wrapper chain.', 'The chosen structure should expose ordering and eligibility for audit.', 'Would a product-level threshold equal a cart threshold?', 'No. Reapplying a cart threshold per line changes eligibility; eligible bases must be explicit.'],
      ['Trace two discounts before consuming quota.', 'Draw the 10000, 8000, 7200 minor-unit values, then the separate reserveOnce call.', 'The service checks eligibility, applies twenty percent and then ten percent, and records the two adjustments in Quote. Only the approved checkout reserves coupon quota.', 'Separating the trace demonstrates that read operations do not change usage counts.', 'Which price does the second percentage use?', 'The remaining eligible base, 8000 minor units in this example.'],
      ['Handle the losing last-use checkout with consent.', 'Draw two checkout IDs competing for one remaining coupon use.', 'A reserves the last use. B receives a quota conflict and a revised quote. I require B to accept the changed price rather than silently charging more.', 'Quota races are business-visible outcomes, not rounding errors.', 'What if A payment result is unknown?', 'Retain A usage reservation until reconciliation; releasing it immediately could exceed the coupon limit if payment actually succeeded.'],
      ['Implement exact rounded percentage arithmetic.', 'Underline basis-point bounds, BigDecimal division, and base minus discount.', 'The helper calculates the adjustment in exact decimal arithmetic and rounds it once. At 101 minor units and fifty percent, the discount is 51 and the remainder is 50.', 'Rounding the remaining price instead gives a different tie result.', 'Why use longValueExact?', 'It rejects an unrepresentable or non-integral result rather than silently truncating; earlier bounds and zero-scale rounding define a valid minor-unit adjustment.'],
      ['Defend quote expiry and observable composition.', 'Compare an explicit rule list with nested decorators and mark quote version checks.', 'The pipeline is easier to inspect and serialize. Immutable quotes improve reproducibility but need expiry and revalidation. Mixed fixed and percentage discounts, caps, and rounding make ordering observable.', 'Pure percentage algebra does not generalize to all business discounts.', 'Do percentage rules always commute in this implementation?', 'Not necessarily after per-adjustment rounding or caps. Define and test a stable order even when ideal unrounded percentages commute.'],
    ],
    code: `long afterPercentage(long baseMinor, int basisPoints) {
    if (baseMinor < 0 || basisPoints < 0 || basisPoints > 10_000)
        throw new IllegalArgumentException("Invalid price or rate");
    long discount = BigDecimal.valueOf(baseMinor)
        .multiply(BigDecimal.valueOf(basisPoints))
        .divide(BigDecimal.valueOf(10_000), 0, RoundingMode.HALF_UP)
        .longValueExact();
    return baseMinor - discount;
}`,
    codeNote: 'Pure percentage CouponRule helper; imports omitted. Caller supplies the current eligible base and records base minus result as the adjustment. Eligibility, ordering, quote validation, and quota transactions are outside the method.',
    recap: 'Redraw Cart, Quote, PricingService, ordered CouponRule, and separate RedemptionService; compute 100 to 80 to 72.',
    script: 'I define eligible bases, stacking order, and rounding before choosing a pattern. PricingService applies a pure ordered rule pipeline and returns an immutable Quote with adjustment identities and expiry. Percentages apply to the remaining eligible base, and I round each adjustment once. RedemptionService reserves limited quota only at checkout with a stable identity. An exhausted or stale coupon needs a revised approved quote, never an unannounced higher charge. Decorator remains useful for simpler compositions.',
    closing: 'The speech should make pricing reproducible and distinguish pure calculation from limited-use ownership.',
    followUps: [
      ['How do fixed and percentage order differ?', 'On 100, subtracting 10 then taking twenty percent leaves 72; taking twenty percent then subtracting 10 leaves 70. Publish a stable priority rule.'],
      ['How do you prevent a negative subtotal?', 'Cap each fixed/percentage adjustment at the currently eligible nonnegative base and validate rates, then record the actual capped adjustment.'],
      ['How do you avoid double redemption on retry?', 'Atomically bind checkout identity and immutable payload to one quota reservation; matching retries reuse it and conflicting payloads fail.'],
    ],
  },
  {
    id: 'payment-gateway',
    source: 'Guide observations cover TransactionService and Processor. Processor is a stub and service hard-codes success; durable attempts, security, and reconciliation here are original. Zoho notes are not claimed reviewed.',
    classes: [
      `class PaymentRequest {
  +String merchantId
  +String key
  +long amountMinor
  +String currency
  +String instrumentToken
}
class Attempt {
  +String requestFingerprint
  +String providerKey
  +Status status
}
Attempt --> PaymentRequest : immutable operation`,
      `class Gateway {
  +pay(request) Attempt
  +createOrReplay(request) Attempt
  +reconcile(attemptId)
}
class PaymentRepository {
  +insertOrLoad(merchantId, key, fingerprint, request) Attempt
  +transition(id, expectedVersion, outcome)
}
Gateway --> PaymentRepository
Gateway --> PaymentRequest
PaymentRepository *-- Attempt`,
      `class ProviderPort {
  +submit(key, request) Outcome
  +lookup(key) Outcome
}
Gateway --> ProviderPort : adapter contract
note for Attempt "PENDING, SUCCEEDED, FAILED, UNKNOWN"`,
    ],
    success: `actor Merchant
participant Gateway
participant PaymentRepository
participant ProviderPort
Merchant->>Gateway: pay(request)
Gateway->>Gateway: authenticate then createOrReplay(request)
Gateway->>PaymentRepository: insertOrLoad(merchant, key, fingerprint, request)
PaymentRepository-->>Gateway: one PENDING attempt and stable providerKey
Gateway->>Gateway: recoverable worker claims attempt
Gateway->>ProviderPort: submit(providerKey, request) outside transaction
ProviderPort-->>Gateway: definite success
Gateway->>PaymentRepository: transition(id, version, SUCCEEDED)
PaymentRepository-->>Gateway: committed result
Gateway-->>Merchant: attempt status`,
    failure: `actor Merchant
participant Gateway
participant PaymentRepository
participant ProviderPort
Merchant->>Gateway: pay(request)
Gateway->>PaymentRepository: insertOrLoad(merchant, key, fingerprint, request)
PaymentRepository-->>Gateway: attempt with stable providerKey
Gateway->>ProviderPort: submit(providerKey, request)
Note over ProviderPort: Provider charges but response is lost
ProviderPort-->>Gateway: timeout
Gateway->>PaymentRepository: transition to UNKNOWN if not already terminal
Gateway->>ProviderPort: lookup(same providerKey)
ProviderPort-->>Gateway: succeeded
Gateway->>PaymentRepository: versioned transition to SUCCEEDED
Note over Gateway,ProviderPort: No blind failover to a second provider`,
    beats: [
      ['Define a payment as a business operation, not a request packet.', 'Draw merchant request to durable attempt to provider.', 'I support one tokenized payment operation with amount and currency. I assume provider idempotency and lookup by a stable key; raw card security codes and real financial compliance are outside this teaching code.', 'Network retries must converge on one business identity.', 'Is this a working implementation of the reviewed Processor?', 'No. The reviewed Processor is a stub; this is an original recoverable-payment model.'],
      ['Make request identity and UNKNOWN explicit.', 'Write merchant plus key, immutable fingerprint, and four attempt statuses.', 'A merchant-scoped key names one immutable request. Matching retries reuse its attempt, conflicting payloads fail, and a timeout is UNKNOWN rather than FAILED.', 'A missing response does not show whether money moved.', 'Which fields belong in the fingerprint?', 'Canonical merchant, operation type, amount, currency, and instrument token; a changed amount with the same key is a conflict.'],
      ['Separate requested terms from evolving outcome.', 'Draw PaymentRequest and Attempt with providerKey and status.', 'PaymentRequest carries immutable authorized terms. Attempt tracks the durable outcome and provider correlation, so I do not overwrite the request when an asynchronous result arrives.', 'Stable inputs and changing knowledge need different representations.', 'Does a refund overwrite a successful Attempt?', 'No. A refund is a new idempotent operation referencing the successful payment.'],
      ['Place uniqueness and transitions in persistence.', 'Add Gateway and PaymentRepository with insertOrLoad and versioned transition.', 'Gateway validates and coordinates, but repository uniqueness on merchant and key makes simultaneous retries converge. Versioned transitions keep stale outcomes from overwriting newer terminal knowledge.', 'An in-memory precheck cannot enforce uniqueness across workers.', 'Does one unique local row prevent duplicate external charges?', 'Not alone. Provider idempotency and recoverable submission identity are also required.'],
      ['Use an adapter without hiding provider guarantees.', 'Add ProviderPort.submit and lookup outside the transaction boundary.', 'ProviderPort is an adapter for submission and lookup semantics. Provider selection may be a strategy before submission, but it is not permission to fail over after an ambiguous charge.', 'Deduplication scopes normally do not cross providers.', 'Can a database transaction include the provider charge atomically?', 'Not in this contract. Network I/O is outside the local transaction and recovery bridges the boundary.'],
      ['Trace local identity before provider I/O.', 'Draw createOrReplay, worker claim, submit, and versioned success.', 'I authenticate the merchant, validate the request, atomically insert or load the attempt, and let a recoverable worker submit with its stable provider key. A definite result commits through one transition function.', 'Persisting identity first allows recovery after a crash around submission.', 'What happens on a matching client retry?', 'It returns the existing attempt; it does not invent a fresh provider key or a second business operation.'],
      ['Reconcile a successful charge whose response vanished.', 'Draw provider success with a lost response, UNKNOWN, then lookup using the same key.', 'The provider may have charged despite timeout. I retain the attempt as unknown and query the same provider identity. I never switch providers merely because I did not receive a response.', 'Blind failover can produce two valid charges at unrelated providers.', 'What if a success webhook arrived before the timeout handler?', 'A conditional/versioned transition must preserve SUCCEEDED; the later timeout cannot regress it to UNKNOWN.'],
      ['Code atomic create-or-replay, not charging.', 'Underline canonical fingerprint, repository insertOrLoad, and payload comparison.', 'This method establishes one local identity and rejects conflicting reuse. It deliberately does not call the provider; submission is a separate claimed and recoverable worker step.', 'Separating identity from I/O makes crash windows explicit.', 'What race must insertOrLoad handle?', 'Concurrent identical merchant/key inserts must yield one durable attempt under a unique constraint, not two records.'],
      ['Defend conditional guarantees rather than exactly-once slogans.', 'Write local uniqueness plus provider key plus lookup, then a separate refund operation.', 'An adapter normalizes providers but cannot manufacture missing guarantees. Without provider idempotency or lookup I restrict automated retries and escalate unresolved attempts. Webhooks and polling must share monotonic transition rules.', 'Exactly-once payment is not guaranteed by a local schema alone.', 'Why authenticate webhooks?', 'An untrusted event must not change financial state. Verify origin, identity, amount/currency consistency, and replay handling before applying an outcome.'],
    ],
    code: `Attempt createOrReplay(PaymentRequest request) {
    if (request.amountMinor() <= 0 || request.key().isBlank())
        throw new IllegalArgumentException("Invalid payment request");
    validateCurrencyAndInstrument(request);
    String fingerprint = canonicalFingerprint(request);
    Attempt attempt = repository.insertOrLoad(
        request.merchantId(), request.key(), fingerprint, request);
    if (!attempt.requestFingerprint().equals(fingerprint))
        throw new IllegalArgumentException("Idempotency key reused with different payload");
    return attempt;
}`,
    codeNote: 'Inside Gateway after authentication and basic non-null request validation. Repository atomically inserts/loads under merchant/key uniqueness and creates a stable provider key. Worker leases, provider submission, webhook verification, and recovery are contracts, not implementations in this fragment.',
    recap: 'Redraw Gateway, Attempt, PaymentRepository, ProviderPort and the timeout-to-lookup path without cross-provider failover.',
    script: 'I model one durable payment attempt per merchant-scoped idempotency key. A canonical fingerprint rejects changed payloads. Gateway persists or reuses the attempt before a worker calls ProviderPort with a stable provider key outside the transaction. Definite outcomes use versioned transitions, while timeouts remain unknown until webhook or lookup reconciliation. I do not blindly fail over after ambiguous submission. Refunds are separate operations, and these guarantees depend on provider contracts rather than local uniqueness alone.',
    closing: 'The compact answer must explain why UNKNOWN and stable external identity are necessary, not merely name Adapter.',
    followUps: [
      ['What if a worker crashes after submit but before saving success?', 'Recover the existing attempt and query or safely resubmit with the same provider key under the provider contract; never create a new charge identity.'],
      ['Can two providers share the client idempotency key safely?', 'Not automatically. Provider-local deduplication is separate; an unknown outcome at provider A must be resolved before considering a new attempt at B.'],
      ['How would authorize/capture change the model?', 'Add distinct authorization and capture states/operations with their own identities and allowed transitions, rather than silently reusing the one-step payment status.'],
    ],
  },
];