// Each beat: goal, drawing instruction, exact speech, rationale, question, answer.
export default [
  {
    id: 'tic-tac-toe',
    source: 'Guide observations cover PlayGame and TicTacToeGame only. The deque-based source differs from this Game API; no PDF-wide review claim.',
    classes: [
      `class Board {
  -char[][] cells
  +place(row, col, mark)
  +winsAt(row, col) boolean
  +full() boolean
}
class Player {
  +String id
  +char mark
}
Board ..> Player : stores marks not turns`,
      `class Game {
  -int turn
  -Status status
  +move(playerId, row, col) Status
}
Game *-- Board
Game --> Player : two players`,
      `Game : +rejectAfterFinish()
Board : +inBounds(row, col) boolean
Board : +empty(row, col) boolean
note for Game "Plain aggregate with enum status, no State hierarchy"`,
    ],
    success: `actor UI
participant Game
participant Board
UI->>Game: move(A, 0, 0)
Game->>Game: validate ACTIVE and current player A
Game->>Board: inBounds(0, 0) and empty(0, 0)
Board-->>Game: true
Game->>Board: place(0, 0, X)
Game->>Board: winsAt(0, 0)
Board-->>Game: false
Game->>Board: full()
Board-->>Game: false
Game->>Game: turn becomes B
Game-->>UI: ACTIVE`,
    failure: `actor UI
participant Game
participant Board
UI->>Game: move(B, 0, 0)
Game->>Game: validate ACTIVE and current player B
Game->>Board: empty(0, 0)
Board-->>Game: false
Game-->>UI: Invalid cell
Note over Game,Board: No place call and turn remains B`,
    beats: [
      ['Bound a local two-player game.', 'Sketch a 3 by 3 grid and players A/X and B/O.', 'I will build a local three-by-three game for two players. I include move validation, wins, and draws, but not AI, networking, or undo.', 'A tiny scope makes the mutation boundary visible.', 'Does the first version need an AI player?', 'No. Human input reaches the same Game.move method, and an AI could later choose coordinates outside the game aggregate.'],
      ['Define exactly when a turn is consumed.', 'Write ACTIVE, WON, DRAW and mark coordinates as zero-based.', 'X begins. A rejected move changes nothing. A valid nonterminal move changes the turn once, and I check a win before a full-board draw.', 'The ninth move can fill the board and win simultaneously.', 'What happens on a ninth-move win?', 'Game returns WON because winsAt runs before full; the board being full does not override victory.'],
      ['Separate board storage from player identity.', 'Draw Board with cells and Player with id and mark.', 'Board owns cells and occupancy. Player owns an identity and a mark. Neither object decides whose turn comes next.', 'Putting turn logic in Board mixes storage with game progression.', 'Which object should store the current player?', 'Game, which is added next; Board only answers spatial questions.'],
      ['Place the entire move boundary in Game.', 'Add Game with move, turn, and status above Board and the two Players.', 'Game validates status and player, asks Board about the cell, then places and evaluates the mark. The UI never writes cells directly.', 'One coordinator prevents bypassing terminal and turn checks.', 'Can the UI call Board.place directly?', 'No. All accepted moves must pass through Game.move so occupancy and turn updates remain one operation.'],
      ['Avoid inventing a pattern for fixed rules.', 'Keep the same three classes and add Board bounds/vacancy queries and a terminal guard.', 'An enum and ordinary methods are enough for three states. I would add a win-rule strategy only when different rule sets actually coexist.', 'State subclasses would add indirection without changing behavior requirements.', 'Why is a State hierarchy absent?', 'ACTIVE, WON, and DRAW only gate a small fixed method. A status enum expresses that clearly.'],
      ['Follow the first valid move precisely.', 'Draw UI, Game, Board and the calls for A at zero, zero.', 'A calls move. Game checks the player and vacancy, Board writes X, then Game checks victory and fullness. Neither applies, so B receives the next turn.', 'The diagram locates the write after every rejection check.', 'When is the next player selected?', 'Only after place succeeds and both terminal tests are false.'],
      ['Prove a rejected move preserves the turn.', 'Reuse zero, zero for B and stop the arrows at empty returning false.', 'B chooses the occupied cell. Game rejects before place, so B retries with the board, used count, and status unchanged.', 'A failed command is not a completed turn.', 'Which values must an occupied-cell test compare before and after?', 'Cells, used count, turn, and status must all be identical.'],
      ['Code validation before mutation.', 'Underline the guards, then circle place and the win-before-draw branch.', 'This method has one write boundary. The guards run first, and the final else switches the turn only when the game remains active.', 'Branch ordering is more important than a clever board representation.', 'Would moving turn assignment before winsAt be harmless?', 'No. It changes terminal-state semantics and can identify the wrong winner if later code uses the current player.'],
      ['Defend scans and per-game serialization.', 'Write row scan versus counters, and one command queue per game.', 'For a three-by-three board I prefer readable scans. Counters help larger boards but add update invariants. Network clients would need serialized commands per game.', 'An unsynchronized local method is not concurrent-session protection.', 'What changes for an N by N board?', 'Store N, scan the affected row/column and relevant diagonals in O(N), or maintain carefully tested counters if profiling justifies them.'],
    ],
    code: `Status move(String playerId, int row, int col) {
    if (status != Status.ACTIVE) throw new IllegalStateException("Finished");
    Player current = players.get(turn);
    if (!current.id().equals(playerId)) throw new IllegalArgumentException("Turn");
    if (!board.inBounds(row, col) || !board.empty(row, col))
        throw new IllegalArgumentException("Invalid cell");
    board.place(row, col, current.mark());
    if (board.winsAt(row, col)) status = Status.WON;
    else if (board.full()) status = Status.DRAW;
    else turn = 1 - turn;
    return status;
}`,
    codeNote: 'Inside Game with board, players, turn, and status fields. Board.place is a local nonthrowing write after validation; concurrent callers require per-game serialization.',
    recap: 'Redraw Game, Board, Player, then the valid-move and occupied-cell paths.',
    script: 'I support two local players on a three-by-three board. Game owns turns and terminal status, Board owns cells, and Player carries identity and mark. I validate everything before placement, test victory before draw, and advance only a successful nonterminal turn. An occupied cell preserves the whole state. Simple scans and an enum are enough now; varied rules or network play would justify separate extensions.',
    closing: 'The complete explanation should connect cell ownership, mutation ordering, and the ninth-move edge case.',
    followUps: [
      ['How do you test every winning line?', 'Parameterize all three rows, three columns, and two diagonals, plus a ninth-move win and a full-board draw.'],
      ['How would undo work?', 'Record accepted moves with prior status and turn, then restore cells and counters through Game rather than exposing Board mutation.'],
      ['Can two remote players submit at once?', 'Serialize commands per game and recheck turn at execution time; a request carrying an old turn version must not bypass validation.'],
    ],
  },
  {
    id: 'snake-and-ladder',
    source: 'Guide observations cover SnakeNLadderDemo and Game. Source uses reach-or-pass; this original model deliberately requires exact finish.',
    classes: [
      `class Board {
  -int finish
  -Map jumps
  +destination(position, roll) int
}
class Player {
  -int position
  +moveTo(square)
}
Player ..> Board : position on number line`,
      `class Game {
  -int turn
  -Player winner
  +playTurn() int
}
Game *-- Board
Game --> Player : ordered players`,
      `class Dice {
  +roll() int
}
Game --> Dice : injected random or scripted rolls`,
    ],
    success: `actor Driver
participant Game
participant Dice
participant Board
participant Player
Driver->>Game: playTurn()
Game->>Game: reject if winner exists
Game->>Dice: roll()
Dice-->>Game: 4
Game->>Board: destination(0, 4)
Board-->>Game: 18 via jump 4 to 18
Game->>Player: moveTo(18)
Game->>Game: not finish so rotate turn
Game-->>Driver: 18`,
    failure: `actor Driver
participant Game
participant Dice
participant Board
participant Player
Driver->>Game: playTurn()
Game->>Dice: roll()
Dice-->>Game: 0
Game->>Board: destination(18, 0)
Board-->>Game: Invalid roll
Game-->>Driver: faulty dice input
Note over Game,Player: No moveTo and no turn rotation`,
    beats: [
      ['Describe a turn engine rather than a graphical board.', 'Draw a number line from zero to one hundred and two player markers.', 'I will model positions, rolls, and jumps. The grid is presentation only, and I exclude board animation and random board generation.', 'Arithmetic and a jump map are sufficient for game behavior.', 'Does each square need its own class?', 'No. Integer positions and a map of jump starts to endpoints capture this version.'],
      ['Choose exact-finish and jump semantics.', 'Write 98 plus 3 stays at 98, and 4 jumps to 18 once.', 'Players start at zero and must land exactly on one hundred. A legal overshoot consumes a turn, an invalid roll does not, and only one jump applies per turn.', 'These choices are not universal rules and differ from the reviewed source finish condition.', 'What is the difference between rolling zero and overshooting?', 'Zero is rejected with no state change; a legal overshoot preserves position but advances the turn.'],
      ['Keep movement calculation pure.', 'Draw Board with finish and jumps, and Player with position.', 'Board calculates a destination without moving anybody. Player stores the committed position, so I can test arithmetic without constructing a whole game.', 'A pure function exposes boundary cases independently of randomness.', 'May a jump endpoint be the finish?', 'Not in this chosen model: both endpoints are distinct squares within one through ninety-nine, with unique starts.'],
      ['Centralize winner and rotation rules.', 'Add Game pointing to Board and an ordered player list.', 'Game rejects post-win calls, selects the current player, calculates one destination, commits it, and either records a winner or rotates once.', 'Board does not know player order or terminal state.', 'Where is an extra turn on six implemented if requested?', 'In Game turn progression, not in Board jump lookup.'],
      ['Inject the source of rolls.', 'Add Dice.roll between Game and random or scripted input.', 'Dice is a small strategy seam because production rolls are random and tests need exact sequences. I do not need separate Snake and Ladder subclasses.', 'Both jump types are the same mapping operation.', 'How do you reproduce a ladder test?', 'Inject a scripted Dice returning four and a Board mapping four to eighteen, then assert position and next turn.'],
      ['Trace a ladder without hidden recursion.', 'Draw playTurn, roll returning four, destination returning eighteen, and moveTo.', 'From zero, the die gives four. Board resolves the jump at four to eighteen exactly once. Game stores eighteen and hands the next turn to the other player.', 'A second jump at eighteen must not be followed under the chosen rules.', 'What if eighteen is another jump start?', 'This turn still ends at eighteen; one-jump semantics do not recursively resolve it.'],
      ['Reject a faulty random dependency.', 'Stop the sequence at destination receiving roll zero.', 'The die returns zero, so Board rejects before Player.moveTo. Game neither rotates nor records a winner because no legal roll completed.', 'Silently converting bad random input into a turn would hide dependency failures.', 'What must a test assert after an invalid roll?', 'All player positions, the current turn, and winner remain unchanged.'],
      ['Implement bounded arithmetic before lookup.', 'Underline finish minus position and the early exact-finish return.', 'I validate position and die range first. Subtracting before addition detects overshoot, and reaching the finish returns immediately before any jump lookup.', 'This avoids accidental finish jumps and unnecessary risky addition.', 'Why test roll greater than finish minus position?', 'It detects overshoot before adding and works without needing an out-of-range temporary destination.'],
      ['Explain why a map and one strategy suffice.', 'Compare jump map with square objects and record actual rolls in a replay log.', 'A map scales with the number of jumps. Scripted dice gives deterministic tests. Chained jumps would require a cycle rule, and replay should store actual rolls rather than only a seed.', 'Seeds can behave differently across random implementations.', 'What breaks if jump resolution becomes naive recursion?', 'A cycle can loop forever; define visited-square detection and a bounded resolution policy first.'],
    ],
    code: `int destination(int position, int roll) {
    if (position < 0 || position >= finish)
        throw new IllegalArgumentException("Not a playable position");
    if (roll < 1 || roll > 6) throw new IllegalArgumentException("Invalid roll");
    if (roll > finish - position) return position;
    int landed = position + roll;
    if (landed == finish) return finish;
    return jumps.getOrDefault(landed, landed);
}`,
    codeNote: 'Inside immutable Board with a validated jump map. Game owns terminal checks and only calls Player.moveTo after this calculation returns.',
    recap: 'Redraw Board, Player, Game, Dice and compare a ladder, invalid roll, and overshoot.',
    script: 'I represent the board with a finish number and jump map. Game owns turn order and the winner, while injected Dice supplies testable rolls. I choose exact finish, one jump per turn, and no extra turn on six. Board computes the destination before Player changes. Invalid rolls change nothing; legal overshoots still consume the turn. These are explicit teaching rules, not a literal reproduction of the source reach-or-pass rule.',
    closing: 'A convincing rehearsal distinguishes invalid input, valid no-movement turns, and source rule differences.',
    followUps: [
      ['What changes for reach-or-pass finish?', 'Replace destination/finish policy and test overshoots as wins; do not silently change the exact-finish lesson.'],
      ['How do you validate a random board?', 'Reject duplicate starts, identical endpoints, and endpoints outside one through ninety-nine; add cycle checks if chaining is enabled.'],
      ['How do you replay a disputed game?', 'Store the board configuration, ordered players, chosen rules, and accepted rolls, then replay through the same Game boundary.'],
    ],
  },
  {
    id: 'chess',
    source: 'Guide observations cover ChessDemo and Game, whose win condition is king capture. King safety here is an original correction, not verified upstream behavior.',
    classes: [
      `class Board {
  -Piece[][] cells
  +copy() Board
  +apply(move)
  +kingAttacked(colour) boolean
}
class Piece {
  -Colour colour
}
class Move {
  +Position from
  +Position to
}
Board *-- Piece
Board ..> Move`,
      `class Game {
  -Colour turn
  -Status status
  -List history
  +play(move)
}
Game *-- Board
Game --> Move`,
      `Piece : +pseudoLegal(board, move) boolean
Piece : +attacks(board, square) boolean
Game : +evaluate(candidate, next) Status
note for Piece "Polymorphic geometry, separate attack queries"`,
    ],
    success: `actor UI
participant Game
participant Piece
participant Board
participant Candidate as BoardCopy
UI->>Game: play(move)
Game->>Game: validateBasic(move)
Game->>Piece: pseudoLegal(board, move)
Piece-->>Game: true
Game->>Board: copy()
Board-->>Game: candidate
Game->>Candidate: apply(move)
Game->>Candidate: kingAttacked(turn)
Candidate-->>Game: false
Game->>Game: evaluate(candidate, next)
Game->>Game: commit board and history then switch turn
Game-->>UI: accepted`,
    failure: `actor UI
participant Game
participant Piece
participant Board
participant Candidate as BoardCopy
UI->>Game: play(pinned rook sideways)
Game->>Game: validateBasic(move)
Game->>Piece: pseudoLegal(board, move)
Piece-->>Game: true
Game->>Board: copy()
Game->>Candidate: apply(move)
Game->>Candidate: kingAttacked(turn)
Candidate-->>Game: true
Game-->>UI: King exposed
Note over Game,Board: Discard candidate and preserve live board, history, turn`,
    beats: [
      ['Scope a restricted legal-move engine.', 'Sketch an eight-by-eight board with a rook shielding its king.', 'I support ordinary moves and captures with king safety. Castling, en passant, promotion, and repetition draws are later work, so this is not a complete chess engine.', 'Naming omissions prevents a restricted evaluator from claiming full chess adjudication.', 'Is this the same win rule as the reviewed Game?', 'No. The reviewed source declares a king-capture win; this teaching model rejects king capture and checks king safety.'],
      ['Separate movement shape from legality.', 'Write ownership, destination, blockers, and king safety as distinct checks.', 'White moves first. A player moves only their own piece, cannot capture a friendly piece or king, and cannot leave their own king attacked.', 'A pinned piece can have valid geometry but an illegal game move.', 'Can a geometrically valid rook move be rejected?', 'Yes. Moving a shielding rook sideways may expose its king to an opposing rook.'],
      ['Draw position and move values first.', 'Draw Board owning Pieces and Move carrying from/to coordinates.', 'Move describes an intention, not a committed change. Board owns occupancy and Piece carries colour; I keep a proposed move separate from board mutation.', 'This makes simulation possible without corrupting live state.', 'What belongs in a Move value?', 'At least source and destination; promotion choice is added when promotion becomes supported.'],
      ['Make Game the commit authority.', 'Add Game with turn, status, history, and play.', 'Game validates the request, makes a candidate board, checks it, and commits only a legal result. Neither UI nor Piece changes the live board independently.', 'One boundary preserves history and turn when rejection occurs.', 'When is history appended?', 'After candidate validation and next-status evaluation succeed, together with the live-board replacement.'],
      ['Use polymorphism for geometry, not entire legality.', 'Add pseudoLegal and attacks to Piece and evaluate to Game.', 'Different pieces justify different movement behavior. Attack queries stay separate from full legal-move generation, because pawns attack differently from their forward movement.', 'Recursive legal generation inside attack detection can loop or misclassify king safety.', 'Why not implement attacks by calling play?', 'play mutates game state and invokes king-safety checks. Attack queries must be pure geometry/occupancy queries without recursive legality evaluation.'],
      ['Trace copy, apply, check, commit.', 'Draw the live Board and a separate BoardCopy lifeline.', 'Game checks basics and shape, copies Board, and applies the move to the copy. A safe king permits evaluation for the opponent, then the candidate, history, and next turn commit.', 'The diagram makes speculative and live state visibly different.', 'Why evaluate the next status before assigning board?', 'If evaluation rejects an unsupported position, the live game has not been partially changed.'],
      ['Demonstrate the pinned-rook rejection.', 'Move the shielding rook sideways only on BoardCopy.', 'The rook passes its movement test, but the copy exposes its king. I discard that copy and leave live cells, side to move, history, and status untouched.', 'Geometry alone is not sufficient for legal chess.', 'Is taking the opponent king a valid shortcut to checkmate?', 'No. Basic validation rejects king capture; checkmate means check with no legal response under the supported rules.'],
      ['Code an isolated candidate before committing.', 'Mark validateBasic, deep copy, kingAttacked, evaluate, then the four commits.', 'The code postpones live changes until the candidate is safe. Board.copy must copy mutable state, and evaluate must not mutate the current game.', 'A shallow copy can make a rejected simulation alter live pieces.', 'What extra state must future copies carry?', 'Castling rights, en-passant target, promotion details, and counters/history relevant to supported draw rules.'],
      ['Defend copying against make/unmake.', 'Compare simple Board.copy with reversible move commands.', 'Copies are easy to reason about for an interview engine. Search may need faster make/unmake, but every captured piece and special-state field must then restore exactly.', 'Performance optimization expands rollback obligations.', 'How do checkmate and stalemate differ?', 'Both have no legal response; checkmate also has an attacked king, whereas stalemate does not. Special-rule omissions limit adjudication.'],
    ],
    code: `void play(Move move) {
    validateBasic(move);
    Piece piece = board.at(move.from());
    if (!piece.pseudoLegal(board, move)) throw new IllegalArgumentException("Shape");
    Board candidate = board.copy();
    candidate.apply(move);
    if (candidate.kingAttacked(turn)) throw new IllegalArgumentException("King exposed");
    Colour next = turn.opposite();
    Status nextStatus = evaluate(candidate, next);
    board = candidate;
    history.add(move);
    turn = next;
    status = nextStatus;
}`,
    codeNote: 'Inside Game. validateBasic checks active status, bounds, ownership, friendly occupancy, and king-capture rejection. Copy is deep; evaluate is pure and restricted to supported moves.',
    recap: 'Redraw Game, Board, Piece, Move and the candidate-board branch for a pinned piece.',
    script: 'I separate piece geometry from legal game moves. Game checks turn and occupancy, asks Piece about shape, then applies the move to a copied Board. If my king is attacked, I discard the candidate without changing history or turn. Otherwise I evaluate the opponent and commit. Checkmate is check with no legal response, never king capture. I explicitly defer special moves and advanced draw rules; the source king-capture example is not this corrected model.',
    closing: 'The final speech must name both the king-safety improvement and the restricted-rule limitation.',
    followUps: [
      ['How would castling extend validation?', 'Track king/rook rights, clear path, and attacked start/transit/destination squares, then move both pieces atomically on the candidate.'],
      ['Why are pawn attacks a separate query?', 'Pawn forward movement requires an empty destination, while its diagonal attack squares matter even when checking king threats without a capturable occupant.'],
      ['What does an undo command retain?', 'Captured piece, origin/destination, previous side/status, and all special rights and counters; restoring only two cells is insufficient.'],
    ],
  },
];