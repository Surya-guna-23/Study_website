import { useMemo, useState } from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const PROBLEMS = [
  // Arrays & Hashing
  { name: 'Contains Duplicate', pattern: 'Arrays & Hashing', level: 'Easy', slug: 'arrays-and-hashing/contains-duplicate' },
  { name: 'Valid Anagram', pattern: 'Arrays & Hashing', level: 'Easy', slug: 'arrays-and-hashing/valid-anagram' },
  { name: 'Two Sum', pattern: 'Arrays & Hashing', level: 'Easy', slug: 'arrays-and-hashing/two-sum' },
  { name: 'Group Anagrams', pattern: 'Arrays & Hashing', level: 'Medium', slug: 'arrays-and-hashing/group-anagrams' },
  { name: 'Top K Frequent Elements', pattern: 'Arrays & Hashing', level: 'Medium', slug: 'arrays-and-hashing/top-k-frequent-elements' },
  { name: 'Product of Array Except Self', pattern: 'Arrays & Hashing', level: 'Medium', slug: 'arrays-and-hashing/product-of-array-except-self' },
  { name: 'Longest Consecutive Sequence', pattern: 'Arrays & Hashing', level: 'Medium', slug: 'arrays-and-hashing/longest-consecutive-sequence' },
  // Two Pointers
  { name: 'Valid Palindrome', pattern: 'Two Pointers', level: 'Easy', slug: 'two-pointers/valid-palindrome' },
  { name: 'Two Sum II', pattern: 'Two Pointers', level: 'Medium', slug: 'two-pointers/two-sum-ii' },
  { name: '3Sum', pattern: 'Two Pointers', level: 'Medium', slug: 'two-pointers/three-sum' },
  { name: 'Container With Most Water', pattern: 'Two Pointers', level: 'Medium', slug: 'two-pointers/container-with-most-water' },
  { name: 'Trapping Rain Water', pattern: 'Two Pointers', level: 'Hard', slug: 'two-pointers/trapping-rain-water' },
  // Sliding Window
  { name: 'Best Time to Buy and Sell Stock', pattern: 'Sliding Window', level: 'Easy', slug: 'sliding-window/best-time-to-buy-and-sell-stock' },
  { name: 'Longest Substring Without Repeating Characters', pattern: 'Sliding Window', level: 'Medium', slug: 'sliding-window/longest-substring-without-repeating-characters' },
  { name: 'Longest Repeating Character Replacement', pattern: 'Sliding Window', level: 'Medium', slug: 'sliding-window/longest-repeating-character-replacement' },
  // Binary Search
  { name: 'Binary Search', pattern: 'Binary Search', level: 'Easy', slug: 'binary-search/binary-search' },
  { name: 'Koko Eating Bananas', pattern: 'Binary Search', level: 'Medium', slug: 'binary-search/koko-eating-bananas' },
  { name: 'Search in Rotated Sorted Array', pattern: 'Binary Search', level: 'Medium', slug: 'binary-search/search-in-rotated-sorted-array' },
  { name: 'Find Minimum in Rotated Sorted Array', pattern: 'Binary Search', level: 'Medium', slug: 'binary-search/find-minimum-in-rotated-sorted-array' },
  { name: 'Median of Two Sorted Arrays', pattern: 'Binary Search', level: 'Hard', slug: 'binary-search/median-of-two-sorted-arrays' },
  // Linked List
  { name: 'Reverse Linked List', pattern: 'Linked List', level: 'Easy', slug: 'linked-list/reverse-linked-list' },
  { name: 'Merge Two Sorted Lists', pattern: 'Linked List', level: 'Easy', slug: 'linked-list/merge-two-sorted-lists' },
  { name: 'Linked List Cycle', pattern: 'Linked List', level: 'Easy', slug: 'linked-list/linked-list-cycle' },
  { name: 'Reorder List', pattern: 'Linked List', level: 'Medium', slug: 'linked-list/reorder-list' },
  { name: 'Remove Nth Node From End', pattern: 'Linked List', level: 'Medium', slug: 'linked-list/remove-nth-node-from-end' },
  { name: 'Copy List With Random Pointer', pattern: 'Linked List', level: 'Medium', slug: 'linked-list/copy-list-with-random-pointer' },
  { name: 'Add Two Numbers', pattern: 'Linked List', level: 'Medium', slug: 'linked-list/add-two-numbers' },
  { name: 'Find the Duplicate Number', pattern: 'Linked List', level: 'Medium', slug: 'linked-list/find-the-duplicate-number' },
  { name: 'Merge K Sorted Lists', pattern: 'Linked List', level: 'Hard', slug: 'linked-list/merge-k-sorted-lists' },
  { name: 'Reverse Nodes in K-Group', pattern: 'Linked List', level: 'Hard', slug: 'linked-list/reverse-nodes-in-k-group' },
  // Stack
  { name: 'Valid Parentheses', pattern: 'Stack', level: 'Easy', slug: 'stack/valid-parentheses' },
  { name: 'Min Stack', pattern: 'Stack', level: 'Medium', slug: 'stack/min-stack' },
  { name: 'Evaluate Reverse Polish Notation', pattern: 'Stack', level: 'Medium', slug: 'stack/evaluate-reverse-polish-notation' },
  { name: 'Daily Temperatures', pattern: 'Stack', level: 'Medium', slug: 'stack/daily-temperatures' },
  { name: 'Generate Parentheses', pattern: 'Stack', level: 'Medium', slug: 'stack/generate-parentheses' },
  // Trees
  { name: 'Invert Binary Tree', pattern: 'Trees', level: 'Easy', slug: 'trees/invert-binary-tree' },
  { name: 'Maximum Depth of Binary Tree', pattern: 'Trees', level: 'Easy', slug: 'trees/maximum-depth-of-binary-tree' },
  { name: 'Same Tree', pattern: 'Trees', level: 'Easy', slug: 'trees/same-tree' },
  { name: 'Binary Tree Level Order Traversal', pattern: 'Trees', level: 'Medium', slug: 'trees/binary-tree-level-order-traversal' },
  { name: 'Lowest Common Ancestor of a BST', pattern: 'Trees', level: 'Medium', slug: 'trees/lowest-common-ancestor-of-a-bst' },
  { name: 'Validate Binary Search Tree', pattern: 'Trees', level: 'Medium', slug: 'trees/validate-binary-search-tree' },
  // Heap / Priority Queue
  { name: 'Last Stone Weight', pattern: 'Heap / Priority Queue', level: 'Easy', slug: 'heap/last-stone-weight' },
  { name: 'Kth Largest Element in a Stream', pattern: 'Heap / Priority Queue', level: 'Easy', slug: 'heap/kth-largest-element-in-a-stream' },
  { name: 'K Closest Points to Origin', pattern: 'Heap / Priority Queue', level: 'Medium', slug: 'heap/k-closest-points-to-origin' },
  { name: 'Kth Largest Element in an Array', pattern: 'Heap / Priority Queue', level: 'Medium', slug: 'heap/kth-largest-element-in-an-array' },
  // Backtracking
  { name: 'Subsets', pattern: 'Backtracking', level: 'Medium', slug: 'backtracking/subsets' },
  { name: 'Combination Sum', pattern: 'Backtracking', level: 'Medium', slug: 'backtracking/combination-sum' },
  { name: 'Permutations', pattern: 'Backtracking', level: 'Medium', slug: 'backtracking/permutations' },
  { name: 'Word Search', pattern: 'Backtracking', level: 'Medium', slug: 'backtracking/word-search' },
  // 1-D Dynamic Programming
  { name: 'Climbing Stairs', pattern: '1-D Dynamic Programming', level: 'Easy', slug: 'dynamic-programming/climbing-stairs' },
  { name: 'House Robber', pattern: '1-D Dynamic Programming', level: 'Medium', slug: 'dynamic-programming/house-robber' },
  { name: 'Coin Change', pattern: '1-D Dynamic Programming', level: 'Medium', slug: 'dynamic-programming/coin-change' },
  { name: 'Longest Increasing Subsequence', pattern: '1-D Dynamic Programming', level: 'Medium', slug: 'dynamic-programming/longest-increasing-subsequence' },
];

const PATTERNS = [
  'All',
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Linked List',
  'Stack',
  'Trees',
  'Heap / Priority Queue',
  'Backtracking',
  '1-D Dynamic Programming',
];
const LEVELS = ['All', 'Easy', 'Medium', 'Hard'];

const LEVEL_COLOR = {
  Easy: { bg: '#1b3a2a', fg: '#7ee2b8', bd: '#2e6b4d' },
  Medium: { bg: '#3a331b', fg: '#f5d67b', bd: '#8a7526' },
  Hard: { bg: '#3a1f1f', fg: '#f79a9a', bd: '#8a3636' },
};

function LevelBadge({ level }) {
  const c = LEVEL_COLOR[level];
  return (
    <span
      className={styles.badge}
      style={{ color: c.fg, background: c.bg, border: `1px solid ${c.bd}` }}>
      {level}
    </span>
  );
}

function Row({ p }) {
  const href = useBaseUrl(`/docs/dsa/${p.slug}`);
  return (
    <tr>
      <td>
        <Link to={href}>{p.name}</Link>
      </td>
      <td>{p.pattern}</td>
      <td>
        <LevelBadge level={p.level} />
      </td>
    </tr>
  );
}

export default function ProblemIndex() {
  const [query, setQuery] = useState('');
  const [pattern, setPattern] = useState('All');
  const [level, setLevel] = useState('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROBLEMS.filter(
      (p) =>
        (pattern === 'All' || p.pattern === pattern) &&
        (level === 'All' || p.level === level) &&
        (q === '' || p.name.toLowerCase().includes(q)),
    );
  }, [query, pattern, level]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.controls}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search problems…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={styles.select} value={pattern} onChange={(e) => setPattern(e.target.value)}>
          {PATTERNS.map((p) => (
            <option key={p} value={p}>{p === 'All' ? 'All patterns' : p}</option>
          ))}
        </select>
        <select className={styles.select} value={level} onChange={(e) => setLevel(e.target.value)}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>{l === 'All' ? 'All levels' : l}</option>
          ))}
        </select>
      </div>

      <div className={styles.count}>
        Showing {filtered.length} of {PROBLEMS.length} problems
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Problem</th>
            <th>Pattern</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <Row key={p.slug} p={p} />
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={3} className={styles.empty}>No problems match your filters.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
