import React from 'react';
import styles from './board.module.css';

/**
 * VizBoard — renders a step's visualization purely from data (no SVG files).
 *
 * viz shape:
 * {
 *   arrays: [
 *     {
 *       label: 'nums',
 *       values: [2, 7, 11, 15],
 *       // per-index states: 'active' | 'done' | 'match' | 'muted' | 'window'
 *       states: {1: 'active', 0: 'match'},
 *       // pointer labels under specific indices: [{index, label}]
 *       pointers: [{index: 0, label: 'L'}, {index: 3, label: 'R'}],
 *     },
 *   ],
 *   // key/value rows (great for hash maps / frequency counts)
 *   map: {label: 'map', entries: [['2', '0']], highlightKey: '2'},
 *   // arbitrary "name = value" note lines
 *   notes: ['sum = 9'],
 * }
 */
function cellClass(state) {
  switch (state) {
    case 'active':
      return `${styles.cell} ${styles.active}`;
    case 'done':
      return `${styles.cell} ${styles.done}`;
    case 'match':
      return `${styles.cell} ${styles.match}`;
    case 'window':
      return `${styles.cell} ${styles.window}`;
    case 'muted':
      return `${styles.cell} ${styles.muted}`;
    default:
      return styles.cell;
  }
}

function ArrayRow({label, values = [], states = {}, pointers = []}) {
  const pointerByIndex = {};
  pointers.forEach((p) => {
    pointerByIndex[p.index] = pointerByIndex[p.index]
      ? `${pointerByIndex[p.index]} ${p.label}`
      : p.label;
  });

  return (
    <div className={styles.arrayRow}>
      {label && <span className={styles.arrayLabel}>{label}</span>}
      <div className={styles.cells}>
        {values.map((v, i) => (
          <div key={i} className={styles.cellWrap}>
            <div className={cellClass(states[i])}>{String(v)}</div>
            <div className={styles.index}>{i}</div>
            {pointerByIndex[i] && <div className={styles.pointer}>{pointerByIndex[i]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function MapBox({label, entries = [], highlightKey}) {
  return (
    <div className={styles.mapBox}>
      {label && <span className={styles.arrayLabel}>{label}</span>}
      <div className={styles.mapEntries}>
        {entries.length === 0 && <span className={styles.mapEmpty}>{'{ }'}</span>}
        {entries.map(([k, v], i) => (
          <span
            key={i}
            className={
              String(k) === String(highlightKey)
                ? `${styles.mapEntry} ${styles.mapEntryHi}`
                : styles.mapEntry
            }>
            {String(k)} → {String(v)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function VizBoard({viz}) {
  if (!viz) return null;
  const {arrays = [], map, notes = []} = viz;
  return (
    <div className={styles.board}>
      {arrays.map((a, i) => (
        <ArrayRow key={i} {...a} />
      ))}
      {map && <MapBox {...map} />}
      {notes.length > 0 && (
        <div className={styles.notes}>
          {notes.map((n, i) => (
            <span key={i} className={styles.note}>
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
