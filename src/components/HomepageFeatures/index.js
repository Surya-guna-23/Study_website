import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '📊 DSA Patterns',
    to: '/docs/dsa/intro',
    description: (
      <>
        Curated LeetCode &amp; Striver (TUF) problems across 10 patterns — Arrays
        &amp; Hashing, Two Pointers, Sliding Window, Binary Search, Linked List,
        Stack, Trees, Heap, Backtracking and Dynamic Programming — each worked
        from brute force through to the optimal solution.
      </>
    ),
  },
  {
    title: '🖼️ Visual Dry Runs',
    to: '/docs/dsa/arrays-and-hashing/two-sum',
    description: (
      <>
        Every problem ships with an interactive, step-by-step player that
        animates arrays, hash maps, linked lists and binary trees — pointers,
        windows and all — just like a whiteboard explanation.
      </>
    ),
  },
  {
    title: '⚙️ JS Polyfills',
    to: '/docs/polyfills/intro',
    description: (
      <>
        Implement the building blocks of JavaScript from scratch — Promise,
        Promise.all, Promise.race, cancellable promises and more — to master how
        the language works under the hood.
      </>
    ),
  },
];

function Feature({title, description, to}) {
  return (
    <div className={clsx('col col--4')}>
      <Link to={to} className={styles.featureCard}>
        <div className="padding-horiz--md padding-vert--md">
          <Heading as="h3">{title}</Heading>
          <p>{description}</p>
          <span className={styles.featureLink}>Explore →</span>
        </div>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
