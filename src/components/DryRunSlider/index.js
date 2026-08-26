import React, {useState, useCallback, useEffect, useRef} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import VizBoard from './VizBoard';
import styles from './styles.module.css';

/** Renders an image (baseUrl-aware) that can be clicked to zoom. */
function SlideImage({src, alt, onZoom}) {
  const resolved = useBaseUrl(src);
  return (
    <img
      className={styles.image}
      src={resolved}
      alt={alt}
      onClick={onZoom}
      title="Click to zoom"
    />
  );
}

/** Fullscreen lightbox overlay for a zoomed slide. */
function Lightbox({src, alt, onClose}) {
  const resolved = useBaseUrl(src);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className={styles.lightbox} onClick={onClose} role="dialog" aria-modal="true">
      <button className={styles.lightboxClose} onClick={onClose} aria-label="Close">
        ✕
      </button>
      <img
        className={styles.lightboxImg}
        src={resolved}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/**
 * DryRunSlider — an interactive, step-by-step dry-run viewer (TUF style).
 *
 * Each `step` supports:
 *   - img:     path under /static (baseUrl applied automatically)
 *   - caption: short one-line summary shown under the image
 *   - state:   array of "key: value" chips describing variables at this step
 *   - details: longer explanation revealed when "Show details" is expanded
 *
 * Props:
 *   - title:    heading shown in the header
 *   - autoPlay: enable the play/pause control (default true)
 *   - interval: ms between autoplay steps (default 2500)
 */
export default function DryRunSlider({steps = [], title, autoPlay = true, interval = 2500}) {
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(false);
  const timer = useRef(null);
  const total = steps.length;

  const clamp = useCallback((i) => Math.max(0, Math.min(total - 1, i)), [total]);
  const go = useCallback(
    (i) => setIndex((cur) => clamp(typeof i === 'function' ? i(cur) : i)),
    [clamp],
  );

  const next = useCallback(() => go((i) => i + 1), [go]);
  const prev = useCallback(() => go((i) => i - 1), [go]);

  // Autoplay loop
  useEffect(() => {
    if (!playing) return undefined;
    timer.current = setInterval(() => {
      setIndex((cur) => {
        if (cur >= total - 1) {
          setPlaying(false);
          return cur;
        }
        return cur + 1;
      });
    }, interval);
    return () => clearInterval(timer.current);
  }, [playing, interval, total]);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    },
    [next, prev],
  );

  useEffect(() => {
    if (index > total - 1) setIndex(clamp(index));
  }, [total, index, clamp]);

  if (total === 0) return null;

  const step = steps[index];
  const progress = ((index + 1) / total) * 100;

  return (
    <div className={styles.slider} tabIndex={0} onKeyDown={onKeyDown} aria-roledescription="carousel">
      <div className={styles.header}>
        <span className={styles.title}>{title ?? 'Dry Run'}</span>
        <span className={styles.counter}>
          Step {index + 1} / {total}
        </span>
      </div>

      <div className={styles.progressTrack}>
        <div className={styles.progressBar} style={{width: `${progress}%`}} />
      </div>

      <div className={styles.stage}>
        {step.img && (
          <SlideImage
            src={step.img}
            alt={step.caption ?? `Step ${index + 1}`}
            onZoom={() => setZoom(true)}
          />
        )}
        {step.viz && <VizBoard viz={step.viz} />}
        {step.caption && <div className={styles.caption}>{step.caption}</div>}

        {Array.isArray(step.state) && step.state.length > 0 && (
          <div className={styles.chips}>
            {step.state.map((s, i) => (
              <span key={i} className={styles.chip}>
                {s}
              </span>
            ))}
          </div>
        )}

        {step.details && (
          <div className={styles.details}>
            <button
              className={styles.detailsToggle}
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}>
              {expanded ? '▾ Hide details' : '▸ Show details'}
            </button>
            {expanded && <div className={styles.detailsBody}>{step.details}</div>}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button className={styles.button} onClick={prev} disabled={index === 0} aria-label="Previous step">
          ← Prev
        </button>

        <div className={styles.midControls}>
          {autoPlay && (
            <button
              className={styles.iconButton}
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause' : 'Play'}
              title={playing ? 'Pause' : 'Play'}>
              {playing ? '⏸' : '▶'}
            </button>
          )}
          <div className={styles.dots} role="tablist">
            {steps.map((_, i) => (
              <button
                key={i}
                className={i === index ? `${styles.dot} ${styles.dotActive}` : styles.dot}
                onClick={() => go(i)}
                aria-label={`Go to step ${i + 1}`}
                aria-selected={i === index}
              />
            ))}
          </div>
        </div>

        <button className={styles.button} onClick={next} disabled={index === total - 1} aria-label="Next step">
          Next →
        </button>
      </div>

      {zoom && step.img && (
        <Lightbox
          src={step.img}
          alt={step.caption ?? `Step ${index + 1}`}
          onClose={() => setZoom(false)}
        />
      )}
    </div>
  );
}
