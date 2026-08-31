import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './404.module.css';

export default function NotFound() {
  return (
    <Layout title="Page not found" description="This page could not be found.">
      <main className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.code}>404</div>
          <h1 className={styles.title}>This page took a wrong turn</h1>
          <p className={styles.subtitle}>
            The page you are looking for doesn&apos;t exist or may have moved.
            Let&apos;s get you back to studying.
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/">
              Go to Home
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/dsa/intro">
              Browse DSA
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
