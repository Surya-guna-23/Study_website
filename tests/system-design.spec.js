const {test, expect} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const topics = ['foundations', 'patterns', 'parking', 'cases'].flatMap((name) =>
  JSON.parse(fs.readFileSync(path.join(root, 'src/data/system-design', `${name}.json`), 'utf8')),
);

test('all catalog entries have unique IDs, valid sources, routes and anchors', async ({request}) => {
  expect(topics.length).toBe(43);
  expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length);
  expect(new Set(topics.map((topic) => topic.slug)).size).toBe(topics.length);
  const pages = new Map();
  for (const topic of topics) {
    for (const field of ['title', 'category', 'summary', 'sourceNote', 'kind']) {
      expect(topic[field], `${topic.id}.${field}`).toBeTruthy();
    }
    for (const source of topic.sources) {
      expect(new URL(source.url).protocol).toBe('https:');
    }
    const [slug, anchor] = topic.slug.split('#');
    const route = `/docs/system-design/${slug}`;
    if (!pages.has(route)) {
      const response = await request.get(route);
      expect(response.status(), route).toBe(200);
      pages.set(route, await response.text());
    }
    if (anchor) expect(pages.get(route), `${route}#${anchor}`).toContain(`id="${anchor}"`);
  }
});

test('catalog supports search, category combinations, empty state and reset', async ({page}) => {
  await page.goto('/docs/system-design/intro');
  const catalog = page.getByRole('region', {name: 'System Design topic catalog'});
  const status = catalog.getByRole('status');
  await expect(status).toContainText('43 of 43');
  await catalog.getByRole('searchbox').fill('parking');
  await expect(status).toContainText('1 of 43');
  await expect(catalog.getByRole('heading', {name: 'Parking Lot'})).toBeVisible();
  await catalog.getByRole('combobox').selectOption('Foundations');
  await expect(status).toContainText('0 of 43');
  await expect(catalog.getByText('No matching topics.', {exact: false})).toBeVisible();
  await catalog.getByRole('searchbox').fill('');
  await expect(status).toContainText('3 of 43');
  await catalog.getByRole('combobox').selectOption('All');
  await expect(status).toContainText('43 of 43');
  await catalog.getByRole('searchbox').fill('  STRATEGY  ');
  await expect(catalog.getByRole('heading', {name: 'Strategy', exact: true})).toBeVisible();
});

test('homepage and catalog fit a narrow screen in light and dark themes', async ({page}) => {
  await page.setViewportSize({width: 375, height: 812});
  for (const route of ['/', '/docs/system-design/intro']) {
    await page.goto(route);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} ${theme}`).toBe(true);
    }
  }
});

test('Parking Lot starts with roadmap and speaking-script links', async ({page}) => {
  await page.goto('/docs/system-design/case-studies/parking-lot');
  const article = await detailedNotes(page);
  await expect(article.getByRole('link', {name: '3. Parking Lot: problem overview', exact: true}).first()).toBeVisible();
  const scriptLink = article.getByRole('link', {name: 'EXACTLY HOW TO PRESENT THIS TO THE INTERVIEWER', exact: true}).first();
  await scriptLink.click();
  await expect(page).toHaveURL(/#exactly-how-to-present-this-to-the-interviewer$/);
  await expect(page.locator('#exactly-how-to-present-this-to-the-interviewer')).toBeInViewport();
});

function markdownFiles(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(file) : /\.mdx?$/.test(entry.name) ? [file] : [];
  });
}

async function detailedNotes(page) {
  // The guided player's current diagram is not part of the original Markdown.
  const notes = page.locator('#lld-detailed-notes');
  return await notes.count() ? notes : page.locator('main .theme-doc-markdown');
}

for (const file of markdownFiles(path.join(root, 'docs/system-design'))) {
  const text = fs.readFileSync(file, 'utf8');
  const diagrams = [...text.matchAll(/^```mermaid\s*$/gm)].length;
  if (!diagrams) continue;
  const route = '/' + path.relative(root, file).replaceAll(path.sep, '/').replace(/\.mdx?$/, '');
  test(`Mermaid renders all ${diagrams} diagrams: ${route}`, async ({page}) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route);
    const notes = await detailedNotes(page);
    await expect(notes.locator('.docusaurus-mermaid-container svg')).toHaveCount(diagrams);
    await expect(page.getByText('This component crashed', {exact: false})).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}