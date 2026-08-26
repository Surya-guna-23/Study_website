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
        Curated LeetCode & Striver (TUF) problems grouped by pattern — Arrays &
        Hashing, Two Pointers, Sliding Window, Binary Search, Linked List and
        more, each with clean solutions and step-by-step dry runs.
      </>
    ),
  },
  {
    title: '🖼️ Visual Dry Runs',
    to: '/docs/dsa/arrays-and-hashing/two-sum',
    description: (
      <>
        Every problem ships with a diagram that walks through the algorithm one
        step at a time. Click any diagram to zoom in and follow the logic just
        like a whiteboard explanation.
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
