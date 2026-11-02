import React, {useMemo, useState} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import parking from '@site/src/data/system-design/parking.json';
import foundations from '@site/src/data/system-design/foundations.json';
import patterns from '@site/src/data/system-design/patterns.json';
import cases from '@site/src/data/system-design/cases.json';
import styles from './styles.module.css';

const topics = [...foundations, ...patterns, ...parking, ...cases];
const categories = ['All', ...new Set(topics.map((topic) => topic.category))];
const walkthroughIds = new Set([...parking, ...cases].map((topic) => topic.id));

export default function SystemDesignCatalog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => topics.filter((topic) =>
    (category === 'All' || topic.category === category) &&
    `${topic.title} ${topic.summary} ${topic.category}`.toLowerCase().includes(query.trim().toLowerCase()),
  ), [query, category]);

  return (
    <section aria-label="System Design topic catalog">
      <div className={styles.controls}>
        <label className={styles.search}>Find a topic
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Strategy, payment, or Parking Lot" />
        </label>
        <label>Learning area
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
      </div>
      <p role="status" aria-live="polite">{filtered.length} of {topics.length} topics · Full playbooks and shorter learning guides are labelled separately.</p>
      <div className={styles.grid}>
        {filtered.map((topic) => (
          <article key={topic.id} className={styles.card}>
            <div className={styles.meta}>
              <span>{topic.category}</span><span>{topic.kind}</span>
              {walkthroughIds.has(topic.id) && <span className={styles.guided}>10-step walkthrough</span>}
            </div>
            <Heading as="h3"><Link to={`/docs/system-design/${topic.slug}`}>{topic.title}</Link></Heading>
            <p>{topic.summary}</p>
            <p className={styles.source}>{topic.sourceNote}</p>
            <div className={styles.links}>
              <Link to={`/docs/system-design/${topic.slug}`}>
                {walkthroughIds.has(topic.id) ? 'Learn & rehearse →' : 'Study guide →'}
              </Link>
              {(topic.sources || []).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}
            </div>
          </article>
        ))}
      </div>
      {filtered.length === 0 && <p>No matching topics. Try another term or select All.</p>}
    </section>
  );
}