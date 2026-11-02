import React, {useEffect, useId, useRef, useState} from 'react';
import Mermaid from '@theme/Mermaid';
import CodeBlock from '@theme/CodeBlock';
import {getLesson} from '@site/src/data/system-design/lessons';
import styles from './styles.module.css';

const TIMER_SECONDS = 5 * 60;
export const progressKey = (id) => `lld-walkthrough:v1:${id}`;

// Accept only the version's shape and known step IDs; never trust stored indices.
export function parseProgress(raw, steps) {
  const empty = {stepId: steps[0].id, completed: []};
  if (!raw) return empty;
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value) ||
        typeof value.stepId !== 'string' || !Array.isArray(value.completed)) return empty;
    const ids = new Set(steps.map((step) => step.id));
    return {
      stepId: ids.has(value.stepId) ? value.stepId : empty.stepId,
      completed: [...new Set(value.completed.filter((id) => typeof id === 'string' && ids.has(id)))],
    };
  } catch {
    return empty;
  }
}

class DiagramBoundary extends React.Component {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    return this.state.failed
      ? <p>Diagram unavailable. Use the text summary below.</p>
      : this.props.children;
  }
}

export default function LLDWalkthrough({topicId}) {
  const lesson = getLesson(topicId);
  if (!lesson) return null;
  // The inner key also resets state when used outside the keyed doc wrapper.
  return <Lesson key={`${topicId}:${lesson.id}`} lesson={lesson} />;
}

function Lesson({lesson}) {
  const {steps} = lesson;
  const uid = useId();
  const initialSteps = useRef(steps);
  const [progress, setProgress] = useState({stepId: steps[0].id, completed: []});
  const [loaded, setLoaded] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(false);
  const [mode, setMode] = useState('learn');
  const [coaching, setCoaching] = useState(false);
  const [wideBoard, setWideBoard] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [remaining, setRemaining] = useState(TIMER_SECONDS);
  const [running, setRunning] = useState(false);
  const deadline = useRef(null);
  const resetButton = useRef(null);
  const cancelButton = useRef(null);
  const stepHeading = useRef(null);
  const key = progressKey(lesson.id);
  const index = Math.max(0, steps.findIndex((step) => step.id === progress.stepId));
  const step = steps[index];
  const showCoaching = mode === 'learn' || coaching;
  const practised = progress.completed.includes(step.id);

  useEffect(() => {
    try {
      setProgress(parseProgress(window.localStorage.getItem(key), initialSteps.current));
    } catch {
      setSessionOnly(true);
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    // Hydration must finish before the first write, including Strict Mode effects.
    if (!loaded || sessionOnly) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(progress));
    } catch {
      setSessionOnly(true);
    }
  }, [key, loaded, progress, sessionOnly]);

  useEffect(() => {
    if (!running) return undefined;
    const tick = () => {
      if (deadline.current === null) return;
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) {
        deadline.current = null;
        setRunning(false);
      }
    };
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (confirmReset) cancelButton.current?.focus();
  }, [confirmReset]);

  function navigate(nextIndex) {
    const next = steps[Math.max(0, Math.min(steps.length - 1, nextIndex))];
    setProgress((current) => ({...current, stepId: next.id}));
    setCoaching(false);
    // Keep focus on the activating control; do not intercept keyboard events.
  }

  function continueFromBottom(nextIndex) {
    navigate(nextIndex);
    stepHeading.current?.focus({preventScroll: true});
    stepHeading.current?.scrollIntoView({block: 'start', behavior: 'auto'});
  }

  function resetTimer() {
    deadline.current = null;
    setRunning(false);
    setRemaining(TIMER_SECONDS);
  }

  function resetProgress() {
    // The persistence effect overwrites only this lesson's versioned key.
    setProgress({stepId: steps[0].id, completed: []});
    setCoaching(false);
    resetTimer();
    setConfirmReset(false);
    resetButton.current?.focus();
  }

  function toggleTimer() {
    if (running) {
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      deadline.current = null;
      setRunning(false);
    } else {
      const seconds = remaining || TIMER_SECONDS;
      deadline.current = Date.now() + seconds * 1000;
      setRemaining(seconds);
      setRunning(true);
    }
  }

  return (
    <section id="lld-walkthrough" data-testid="lld-walkthrough" data-topic={lesson.id}
      className={styles.walkthrough} aria-labelledby={`${uid}-title`}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Guided interview walkthrough</p>
        <h2 id={`${uid}-title`}>{lesson.title}</h2>
        <p className={styles.sourceNote}>{lesson.sourceNote}</p>
        <p className={styles.small}>An original teaching model, not a literal reproduction of the source.</p>
        <a href="#lld-detailed-notes">Skip to detailed notes</a>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.buttons} role="group" aria-label="Lesson mode">
          {['learn', 'rehearse'].map((value) => (
            <button type="button" key={value} aria-pressed={mode === value}
              onClick={() => { setMode(value); setCoaching(false); }}>
              {value === 'learn' ? 'Learn' : 'Rehearse'}
            </button>
          ))}
        </div>
        <p className={styles.small}>
          {mode === 'learn' ? 'Build the design one decision at a time.' : 'Try the prompt aloud, then reveal coaching. Self-assessment only; no automated grading.'}
        </p>
      </div>

      <nav className={styles.navigation} aria-label="Lesson steps">
        <div className={styles.jump}>
          <label htmlFor={`${uid}-jump`}>Jump to step</label>
          <select id={`${uid}-jump`} value={step.id} disabled={!loaded}
            onChange={(event) => navigate(steps.findIndex((item) => item.id === event.target.value))}>
            {steps.map((item, position) => <option key={item.id} value={item.id}>{position + 1}. {item.title}</option>)}
          </select>
        </div>
        <div className={styles.range}>
          <label htmlFor={`${uid}-range`}>Lesson step</label>
          <input id={`${uid}-range`} type="range" min="1" max={steps.length} step="1"
            value={index + 1} aria-valuetext={`Step ${index + 1}: ${step.title}`} disabled={!loaded}
            onChange={(event) => navigate(Number(event.target.value) - 1)} />
        </div>
        <div className={styles.stepControls}>
          <button type="button" disabled={!loaded || index === 0} onClick={() => navigate(index - 1)}>Previous step</button>
          <span role="status" aria-live="polite" aria-atomic="true">Step {index + 1} of {steps.length}</span>
          <button type="button" disabled={!loaded || index === steps.length - 1} onClick={() => navigate(index + 1)}>Next step</button>
        </div>
      </nav>

      <div className={styles.completion}>
        <label htmlFor={`${uid}-progress`}>{progress.completed.length} of {steps.length} steps practised</label>
        <progress id={`${uid}-progress`} aria-label="Steps practised" max={steps.length} value={progress.completed.length} />
      </div>

      <article className={styles.step} aria-labelledby={`${uid}-step-title`}>
        <p className={styles.eyebrow}>{step.phase}</p>
        <h3 ref={stepHeading} tabIndex={-1} id={`${uid}-step-title`} className={styles.stepHeading}>{step.title}</h3>
        <p className={styles.goal}><strong>Goal:</strong> {step.goal}</p>
        <div className={`${styles.boardGrid} ${wideBoard ? styles.wideBoard : ''}`}>
          <figure className={styles.whiteboard}>
            <div className={styles.boardHeader}>
              <h4>Whiteboard</h4>
              {step.diagram && showCoaching && <button type="button" aria-pressed={wideBoard}
                onClick={() => setWideBoard((value) => !value)}>
                {wideBoard ? 'Side-by-side view' : 'Widen whiteboard'}
              </button>}
            </div>
            {step.diagram && !showCoaching ? (
              <p>Sketch your own diagram first. Select Show coaching to compare it with the suggested whiteboard.</p>
            ) : step.diagram ? (
              <DiagramBoundary key={step.id}>
                <div className={styles.diagram} tabIndex={0} role="region" aria-label="Whiteboard diagram" aria-describedby={`${uid}-summary`}>
                  <Mermaid key={step.id} value={step.diagram} />
                </div>
              </DiagramBoundary>
            ) : <p>No diagram needed for this step.</p>}
            <figcaption id={`${uid}-summary`} className={styles.prose}>
              {showCoaching ? step.diagramSummary || step.draw : step.draw}
            </figcaption>
          </figure>
          <div className={styles.instructions}>
            <h4>Draw this</h4>
            <p className={styles.prose}>{step.draw}</p>
            <h4>Ready to move on when</h4>
            <p className={styles.prose}>{step.checkpoint}</p>
            <div className={styles.prompt}>
              <h4>Try it yourself</h4>
              <p className={styles.prose}>{step.prompt}</p>
            </div>
            {mode === 'rehearse' && (
              <button type="button" aria-expanded={coaching} aria-controls={`${uid}-coaching`}
                onClick={() => setCoaching((value) => !value)}>{coaching ? 'Hide coaching' : 'Show coaching'}</button>
            )}
            <div id={`${uid}-coaching`} hidden={!showCoaching}>
              <h4>Say this to the interviewer</h4>
              <p className={styles.prose}>{step.say}</p>
              <h4>Why this design</h4>
              <p className={styles.prose}>{step.why}</p>
              <h4>Suggested answer</h4>
              <p className={styles.prose}>{step.answer}</p>
            </div>
          </div>
        </div>
        {showCoaching && step.code && (
          <div className={styles.code}>
            <h4>Code for this step</h4>
            <CodeBlock language={step.code.language}>{step.code.text}</CodeBlock>
            <p className={styles.prose}>{step.code.explanation}</p>
          </div>
        )}
        {index === steps.length - 1 && (
          <section className={styles.followUps} aria-labelledby={`${uid}-follow-ups`}>
            <h4 id={`${uid}-follow-ups`}>Interview follow-ups</h4>
            {lesson.followUps.map((item, position) => (
              <details key={`${mode}:${coaching}:${position}`}>
                <summary>{item.question}</summary>
                {showCoaching ? <p className={styles.prose}>{item.answer}</p> : <p>Select Show coaching to reveal the answer.</p>}
              </details>
            ))}
          </section>
        )}
        <button type="button" className={styles.practiceButton} disabled={!loaded} aria-pressed={practised}
          onClick={() => setProgress((current) => ({...current, completed: current.completed.includes(step.id)
            ? current.completed.filter((id) => id !== step.id) : [...current.completed, step.id]}))}>
          Mark step practised
        </button>
        <span className={styles.practiceState}>{practised ? 'Practised — select again to undo.' : 'Browsing does not mark a step practised.'}</span>
        <div className={styles.bottomNavigation}>
          <button type="button" disabled={!loaded || index === 0}
            onClick={() => continueFromBottom(index - 1)}>Back one step</button>
          {index < steps.length - 1 ? <button type="button" disabled={!loaded}
            onClick={() => continueFromBottom(index + 1)}>Continue to step {index + 2} →</button>
            : <a href="#lld-detailed-notes">Continue with the detailed notes →</a>}
        </div>
      </article>

      <footer className={styles.footer}>
        <div className={styles.timer} role="group" aria-label="Optional five-minute rehearsal timer">
          <strong>Rehearsal timer</strong>
          <span className={styles.clock} aria-label={`${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds remaining`}>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
          <button type="button" onClick={toggleTimer}>{running ? 'Pause timer' : 'Start timer'}</button>
          <button type="button" onClick={resetTimer}>Reset timer</button>
          <span role="status">{remaining === 0 ? 'Time is up. Continue at your own pace.' : ''}</span>
        </div>
        <p className={styles.small}>Optional five-minute practice. The timer never advances steps and is not saved.</p>
        <button ref={resetButton} type="button" disabled={!loaded} aria-expanded={confirmReset}
          aria-controls={`${uid}-reset`} onClick={() => setConfirmReset(true)}>Reset progress</button>
        {confirmReset && (
          <div id={`${uid}-reset`} className={styles.reset} role="group" aria-label="Confirm progress reset">
            <p>Reset this lesson to step 1 and clear its practised steps? This also stops and resets the timer.</p>
            <div className={styles.buttons}>
              <button type="button" onClick={resetProgress}>Confirm reset</button>
              <button ref={cancelButton} type="button" onClick={() => { setConfirmReset(false); resetButton.current?.focus(); }}>Cancel</button>
            </div>
          </div>
        )}
        {sessionOnly && <p role="status" className={styles.storageNotice}>Browser storage is unavailable. Progress is session-only and may be lost when you leave this lesson.</p>}
        <p className={styles.small}>Local-only practice: progress stays in this browser when storage is available. No microphone, recording, upload, or telemetry.</p>
      </footer>
    </section>
  );
}