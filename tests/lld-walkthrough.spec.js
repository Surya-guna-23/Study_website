const {test: base, expect} = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dataDirectory = path.resolve(__dirname, '../src/data/system-design');
const topics = ['parking', 'cases'].flatMap((name) =>
  JSON.parse(fs.readFileSync(path.join(dataDirectory, `${name}.json`), 'utf8')),
);

// These trusted, local data-only modules have one default array export. Adapt
// only that export for Node; no application JSX, bundler, or extra dependency.
const profiles = ['resources', 'games', 'machines', 'commerce', 'accounting'].flatMap((name) => {
  const filename = path.join(dataDirectory, 'lessons', `${name}.js`);
  const source = fs.readFileSync(filename, 'utf8');
  if ((source.match(/^export default /gm) || []).length !== 1 || /^import /m.test(source)) {
    throw new Error(`Update the data-only test loader for ${filename}`);
  }
  const context = {module: {exports: []}};
  vm.runInNewContext(source.replace(/^export default /m, 'module.exports = '), context, {
    filename, timeout: 1000,
  });
  return JSON.parse(JSON.stringify(context.module.exports));
});
const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

// An explicit UI contract, independent of the application's lesson builder.
const stages = [
  ['boundaries', 'Problem and boundaries'],
  ['invariants', 'Clarify assumptions and invariants'],
  ['entities', 'Draw the core entities'],
  ['coordination', 'Add coordinating responsibility'],
  ['policy', 'Choose only justified policies'],
  ['success', 'Trace success one call at a time'],
  ['failure', 'Trace failure and protect the invariant'],
  ['code', 'Explain the critical method'],
  ['tradeoffs', 'Justify patterns and tradeoffs'],
  ['rehearse', 'Rehearse the complete answer'],
];
const routeFor = (topic) => `/docs/system-design/${topic.slug}`;
const progressKey = (topic) => `lld-walkthrough:v1:${topic.id}`;
const stepId = (topic, index) => `${topic.id}-${stages[index][0]}`;
const playerFor = (page, topic) => page.getByRole('region', {name: topic.title, exact: true});
const diagramFor = (root) => root.locator('.docusaurus-mermaid-container svg');
const practiceButton = (root) => root.getByRole('button', {name: 'Mark step practised', exact: true});
const sample = topics.find((topic) => topic.id === 'tic-tac-toe');
const other = topics.find((topic) => topic.id === 'elevator');

// Attach before navigation, assert after every test (including mobile/storage
// cases). Do not suppress errors from React, Mermaid, or the surrounding docs.
const test = base.extend({
  browserErrors: [async ({page}, use) => {
    const errors = [];
    const onPageError = (error) => errors.push(`pageerror: ${error.message}`);
    const onConsole = (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    };
    page.on('pageerror', onPageError);
    page.on('console', onConsole);
    await use(errors);
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
    expect(errors, 'No browser JavaScript or console errors').toEqual([]);
  }, {auto: true}],
});

async function ready(page, topic) {
  const root = playerFor(page, topic);
  await expect(root).toHaveCount(1);
  await expect(root.getByRole('combobox', {name: 'Jump to step', exact: true})).toBeEnabled();
  return root;
}

async function openLesson(page, topic = sample) {
  const response = await page.goto(routeFor(topic));
  expect(response.status(), routeFor(topic)).toBe(200);
  return ready(page, topic);
}

async function expectStep(root, topic, index) {
  await expect(root.getByRole('combobox', {name: 'Jump to step', exact: true})).toHaveValue(stepId(topic, index));
  await expect(root.getByRole('heading', {level: 3, name: stages[index][1], exact: true})).toBeVisible();
  await expect(root.getByRole('navigation', {name: 'Lesson steps'}).getByRole('status'))
    .toHaveText(`Step ${index + 1} of 10`);
  await expect(root.getByRole('slider', {name: 'Lesson step', exact: true})).toHaveValue(String(index + 1));
}

async function jump(root, topic, index) {
  await root.getByRole('combobox', {name: 'Jump to step', exact: true}).selectOption({index});
  await expectStep(root, topic, index);
}

async function expectPractised(root, count) {
  await expect(root.getByRole('progressbar', {name: 'Steps practised'})).toHaveAttribute('value', String(count));
  await expect(root.getByText(`${count} of 10 steps practised`, {exact: true})).toBeVisible();
}

async function expectStored(page, topic, index, completed) {
  await expect.poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key)), progressKey(topic)))
    .toEqual({stepId: stepId(topic, index), completed: completed.map((i) => stepId(topic, i))});
}

async function seedStorage(page, values) {
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, values);
}

async function renderedLabels(svg) {
  // Ignore SVG style text and generated IDs: they change even for stale content.
  return svg.locator('text, foreignObject').evaluateAll((nodes) =>
    nodes.map((node) => node.textContent).join(' ').replace(/\s+/g, ' ').trim(),
  );
}

async function expectDiagram(root, profile, index, previousLabels) {
  const svg = diagramFor(root);
  await expect(svg).toHaveCount(1);
  await expect(svg).toBeVisible();
  const source = index <= 4 ? profile.classes.slice(0, index - 1).join('\n')
    : index === 5 ? profile.success : profile.failure;
  const names = index <= 4
    ? [...source.matchAll(/^class\s+(\w+)/gm)].map((match) => match[1])
    : [...source.matchAll(/^(?:actor|participant)\s+(\w+)(?:\s+as\s+([^\n]+))?/gm)]
      .map((match) => match[2] || match[1]);
  expect(names.length, `${profile.id} step ${index + 1} participants`).toBeGreaterThan(0);
  for (const name of names) await expect(svg).toContainText(name);
  if (index >= 5) {
    // Success and failure often share participants. Assert their actual calls
    // and notes, not just an SVG with the same lifeline names.
    const messages = [...source.matchAll(/^[^\n]*:\s+([^\n]+)$/gm)].map((match) => match[1]);
    expect(messages.length).toBeGreaterThan(0);
    for (const message of messages) await expect(svg).toContainText(message);
  }
  await expect.poll(() => renderedLabels(svg), 'The current diagram has real labels').not.toBe('');
  if (previousLabels !== undefined) {
    // Mermaid renders asynchronously. A new heading plus an old SVG must not
    // pass; class steps 3/4/5 must actually add new rendered content.
    await expect.poll(() => renderedLabels(svg), 'Diagram content changed for the selected step')
      .not.toBe(previousLabels);
  }
  await expect(root.getByText('Diagram unavailable.', {exact: false})).toHaveCount(0);
  return renderedLabels(svg);
}

test('LLD fixtures cover exactly 15 distinct case-study routes and follow-up sets', async () => {
  expect(topics).toHaveLength(15);
  expect(profiles).toHaveLength(15);
  expect(profileById.size).toBe(15);
  expect(new Set(topics.map((topic) => topic.slug)).size).toBe(15);
  expect(profiles.map((profile) => profile.id).sort()).toEqual(topics.map((topic) => topic.id).sort());
  expect(new Set(profiles.map((profile) => profile.script)).size).toBe(15);
  const questions = profiles.flatMap((profile) => profile.followUps.map(([question]) => question));
  expect(questions).toHaveLength(45);
  expect(new Set(questions).size).toBe(45);
});

for (const topic of topics) {
  test(`LLD ${topic.title}: ten slides, five fresh diagrams, Java and three exact follow-ups`, async ({page}) => {
    const profile = profileById.get(topic.id);
    const root = await openLesson(page, topic);
    await expect(root.getByRole('combobox', {name: 'Jump to step'}).locator('option')).toHaveCount(10);
    await expect(root.getByRole('button', {name: 'Previous step', exact: true})).toBeDisabled();
    await expect(root.getByRole('button', {name: 'Learn', exact: true})).toHaveAttribute('aria-pressed', 'true');
    await expect(root).toContainText(profile.source);
    let previousLabels;
    let diagramCount = 0;
    for (let index = 0; index < 10; index++) {
      await test.step(`Slide ${index + 1}: ${stages[index][1]}`, async () => {
        await jump(root, topic, index);
        const speech = index === 9 ? profile.script : profile.beats[index][2];
        const rationale = index === 9 ? profile.closing : profile.beats[index][3];
        await expect(root.getByText(speech, {exact: true})).toBeVisible();
        await expect(root.getByText(rationale, {exact: true})).toBeVisible();
        await expect(root.getByRole('heading', {name: 'Try it yourself', exact: true})).toBeVisible();
        if (index >= 2 && index <= 6) {
          previousLabels = await expectDiagram(root, profile, index, previousLabels);
          diagramCount++;
        } else {
          await expect(diagramFor(root)).toHaveCount(0);
          await expect(root.getByText('No diagram needed for this step.', {exact: true})).toBeVisible();
        }
        if (index === 7) {
          await expect(root.getByRole('heading', {name: 'Code for this step', exact: true})).toBeVisible();
          await expect(root.locator('pre code')).toHaveCount(1);
          // Prism inserts <br> between token lines, so use rendered text.
          await expect(root.locator('pre code')).toHaveText(profile.code, {useInnerText: true});
          await expect(root.locator('pre')).toHaveClass(/language-java/);
        } else {
          await expect(root.locator('pre code')).toHaveCount(0);
        }
        await expectPractised(root, 0);
        await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'false');
        if (index !== 9) await expect(root.locator('details')).toHaveCount(0);
      });
    }
    expect(diagramCount).toBe(5);
    await expect(root.getByRole('button', {name: 'Next step', exact: true})).toBeDisabled();
    const followUps = root.getByRole('region', {name: 'Interview follow-ups', exact: true});
    await expect(followUps.locator('summary')).toHaveText(profile.followUps.map(([question]) => question));
    for (const [question, answer] of profile.followUps) {
      await followUps.locator('summary').filter({hasText: question}).click();
      await expect(followUps.getByText(answer, {exact: true})).toBeVisible();
    }
  });
}

test('LLD practice is explicit, reversible and retained with the selected step after reload', async ({page}) => {
  let root = await openLesson(page);
  await practiceButton(root).click();
  await expectPractised(root, 1);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'true');
  await practiceButton(root).click();
  await expectPractised(root, 0);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'false');
  await practiceButton(root).click();
  await jump(root, sample, 7);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'false');
  await practiceButton(root).click();
  await expectStored(page, sample, 7, [0, 7]);
  await page.reload();
  root = await ready(page, sample);
  await expectStep(root, sample, 7);
  await expectPractised(root, 2);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'true');
  await practiceButton(root).click();
  await expectPractised(root, 1);
  await expectStored(page, sample, 7, [0]);
  await jump(root, sample, 0);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'true');
});

for (const [name, raw] of [
  ['invalid JSON', '{broken'],
  ['null', 'null'],
  ['array', '[]'],
  ['wrong field types', JSON.stringify({stepId: 7, completed: 'all'})],
  ['missing completed list', JSON.stringify({stepId: stepId(sample, 7)})],
]) {
  test(`LLD malformed storage recovers: ${name}`, async ({page}) => {
    await seedStorage(page, {[progressKey(sample)]: raw});
    const root = await openLesson(page);
    await expectStep(root, sample, 0);
    await expectPractised(root, 0);
    await expectStored(page, sample, 0, []);
    await root.getByRole('button', {name: 'Next step', exact: true}).click();
    await expectStep(root, sample, 1);
    await practiceButton(root).click();
    await expectStored(page, sample, 1, [1]);
  });
}

test('LLD storage filters unknown and foreign step IDs and deduplicates completed IDs', async ({page}) => {
  await seedStorage(page, {
    [progressKey(sample)]: JSON.stringify({
      stepId: 'removed-step',
      completed: [stepId(sample, 1), 'removed-step', stepId(other, 0), 3, null, {}, stepId(sample, 1), stepId(sample, 7)],
    }),
  });
  const root = await openLesson(page);
  await expectStep(root, sample, 0);
  await expectPractised(root, 2);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'false');
  await expectStored(page, sample, 0, [1, 7]);
  await jump(root, sample, 1);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'true');
});

for (const method of ['getItem', 'setItem']) {
  test(`LLD blocked storage ${method} falls back to usable session-only navigation`, async ({page}) => {
    await page.addInitScript((blockedMethod) => {
      const original = Storage.prototype[blockedMethod];
      Object.defineProperty(Storage.prototype, blockedMethod, {
        configurable: true,
        writable: true,
        value: function (key, ...args) {
          if (String(key).startsWith('lld-walkthrough:')) {
            throw new DOMException('LLD storage blocked by test', 'SecurityError');
          }
          return original.call(this, key, ...args);
        },
      });
    }, method);
    const root = await openLesson(page);
    await expect(root.getByRole('status').filter({hasText: 'Browser storage is unavailable.'})).toBeVisible();
    expect(await page.evaluate(() => {
      localStorage.setItem('unrelated-storage-probe', 'working');
      return localStorage.getItem('unrelated-storage-probe');
    })).toBe('working');
    await root.getByRole('button', {name: 'Next step', exact: true}).click();
    await expectStep(root, sample, 1);
    await practiceButton(root).click();
    await expectPractised(root, 1);
    await jump(root, sample, 9);
    await expect(root.locator('summary')).toHaveCount(3);
    await root.getByRole('button', {name: 'Previous step', exact: true}).click();
    await expectStep(root, sample, 8);
    await jump(root, sample, 1);
    await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'true');
    await practiceButton(root).click();
    await expectPractised(root, 0);
  });
}

async function followSidebarLink(page, topic) {
  // Real Docusaurus links exercise client-side doc reuse, unlike repeated goto.
  await page.locator(`a.menu__link[href="${routeFor(topic)}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`${routeFor(topic)}/?$`));
  return ready(page, topic);
}

test('LLD topics remain isolated through browser links, back navigation and reload', async ({page}) => {
  let first = await openLesson(page);
  await jump(first, sample, 7);
  await practiceButton(first).click();
  await first.getByRole('button', {name: 'Rehearse', exact: true}).click();
  await first.getByRole('button', {name: 'Show coaching', exact: true}).click();
  await expectStored(page, sample, 7, [7]);
  let second = await followSidebarLink(page, other);
  await expect(playerFor(page, sample)).toHaveCount(0);
  await expectStep(second, other, 0);
  await expectPractised(second, 0);
  await expect(second.getByRole('button', {name: 'Learn', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await jump(second, other, 1);
  await practiceButton(second).click();
  await expectStored(page, other, 1, [1]);
  await page.goBack();
  first = await ready(page, sample);
  await expectStep(first, sample, 7);
  await expectPractised(first, 1);
  await expect(first.getByRole('button', {name: 'Learn', exact: true})).toHaveAttribute('aria-pressed', 'true');
  second = await followSidebarLink(page, other);
  await expectStep(second, other, 1);
  await expectPractised(second, 1);
  await page.reload();
  second = await ready(page, other);
  await expectStep(second, other, 1);
  await expectPractised(second, 1);
  await expectStored(page, sample, 7, [7]);
  await expectStored(page, other, 1, [1]);
});

async function expectCoaching(root, visible) {
  for (const name of ['Say this to the interviewer', 'Why this design', 'Suggested answer']) {
    const heading = root.getByRole('heading', {name, exact: true, includeHidden: true});
    if (visible) await expect(heading).toBeVisible();
    else await expect(heading).toBeHidden();
  }
}

test('LLD Rehearse hides scripts, rationale and code until coaching and re-hides on navigation or mode changes', async ({page}) => {
  const root = await openLesson(page);
  const profile = profileById.get(sample.id);
  await jump(root, sample, 7);
  await expectCoaching(root, true);
  await expect(root.locator('pre code')).toHaveText(profile.code, {useInnerText: true});
  await root.getByRole('button', {name: 'Rehearse', exact: true}).click();
  await expectCoaching(root, false);
  await expect(root.getByText(profile.beats[7][2], {exact: true})).toBeHidden();
  await expect(root.getByText(profile.beats[7][3], {exact: true})).toBeHidden();
  await expect(root.locator('pre code')).toHaveCount(0);
  await expect(diagramFor(root)).toHaveCount(0);
  await expect(root.getByRole('heading', {name: 'Try it yourself', exact: true})).toBeVisible();
  // Detailed Markdown is intentionally outside the rehearsal disclosure.
  const notes = page.locator('#lld-detailed-notes');
  await expect(notes).toBeVisible();
  // The permalink contributes to the heading's accessible name.
  await expect(notes.locator('h2#original-java-critical-method')).toBeVisible();
  await expect(notes.locator('pre code').first()).toBeVisible();
  await root.getByRole('button', {name: 'Show coaching', exact: true}).click();
  await expectCoaching(root, true);
  await expect(root.locator('pre code')).toHaveText(profile.code, {useInnerText: true});
  await root.getByRole('button', {name: 'Hide coaching', exact: true}).click();
  await expectCoaching(root, false);
  await expect(root.locator('pre code')).toHaveCount(0);
  await root.getByRole('button', {name: 'Show coaching', exact: true}).click();
  await root.getByRole('button', {name: 'Next step', exact: true}).click();
  await expectStep(root, sample, 8);
  await expectCoaching(root, false);
  await root.getByRole('button', {name: 'Show coaching', exact: true}).click();
  await root.getByRole('button', {name: 'Learn', exact: true}).click();
  await expectCoaching(root, true);
  await root.getByRole('button', {name: 'Rehearse', exact: true}).click();
  await expectCoaching(root, false);
  await jump(root, sample, 9);
  await expect(diagramFor(root)).toHaveCount(0);
  await expect(root.getByText(profile.script, {exact: true})).toBeHidden();
  const followUps = root.getByRole('region', {name: 'Interview follow-ups', exact: true});
  for (const [question, answer] of profile.followUps) {
    await followUps.locator('summary').filter({hasText: question}).click();
    await expect(followUps.getByText(answer, {exact: true})).toHaveCount(0);
  }
  await expect(followUps.getByText('Select Show coaching to reveal the answer.', {exact: true})).toHaveCount(3);
  await root.getByRole('button', {name: 'Show coaching', exact: true}).click();
  await expect(root.getByText(profile.script, {exact: true})).toBeVisible();
  for (const [question, answer] of profile.followUps) {
    await followUps.locator('summary').filter({hasText: question}).click();
    await expect(followUps.getByText(answer, {exact: true})).toBeVisible();
  }
});

async function freezeClock(page) {
  // Only install after hydration. Freezing before page load can deadlock lazy
  // Mermaid work or Docusaurus initialization unrelated to the timer.
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
}

const timerFor = (root) => root.getByRole('group', {name: 'Optional five-minute rehearsal timer', exact: true});

async function expectTime(timer, text) {
  await expect(timer.locator('[aria-label$="seconds remaining"]')).toHaveText(text);
}

test('LLD timer ticks, pauses, resumes, resets and expires without navigating or completing steps', async ({page}) => {
  const root = await openLesson(page);
  await jump(root, sample, 1);
  await freezeClock(page);
  const timer = timerFor(root);
  await expectTime(timer, '5:00');
  await timer.getByRole('button', {name: 'Start timer', exact: true}).click();
  await expect(timer.getByRole('button', {name: 'Pause timer', exact: true})).toBeVisible();
  await page.clock.runFor(1000);
  await expectTime(timer, '4:59');
  await timer.getByRole('button', {name: 'Pause timer', exact: true}).click();
  await page.clock.runFor(5000);
  await expectTime(timer, '4:59');
  await timer.getByRole('button', {name: 'Start timer', exact: true}).click();
  await page.clock.runFor(1000);
  await expectTime(timer, '4:58');
  await timer.getByRole('button', {name: 'Reset timer', exact: true}).click();
  await expectTime(timer, '5:00');
  await expect(timer.getByRole('button', {name: 'Start timer', exact: true})).toBeVisible();
  await page.clock.runFor(2000);
  await expectTime(timer, '5:00');
  await timer.getByRole('button', {name: 'Start timer', exact: true}).click();
  await page.clock.fastForward(300000);
  await expectTime(timer, '0:00');
  await expect(timer.getByRole('status')).toHaveText('Time is up. Continue at your own pace.');
  await expect(timer.getByRole('button', {name: 'Start timer', exact: true})).toBeVisible();
  await page.clock.runFor(1000);
  await expectTime(timer, '0:00');
  await expectStep(root, sample, 1);
  await expectPractised(root, 0);
  await expectStored(page, sample, 1, []);
  await timer.getByRole('button', {name: 'Start timer', exact: true}).click();
  await expectTime(timer, '5:00');
  await expect(timer.getByRole('status')).toBeEmpty();
});

test('LLD reset uses inline cancel/confirm, preserves unrelated keys and stops the timer', async ({page}) => {
  const root = await openLesson(page);
  const otherProgress = JSON.stringify({stepId: stepId(other, 7), completed: [stepId(other, 7)]});
  const untouched = {
    [progressKey(other)]: otherProgress,
    'lld-walkthrough:v2:tic-tac-toe': 'future-version-sentinel',
    'unrelated-study-setting': 'keep-me',
    theme: 'light',
  };
  await page.evaluate((entries) => {
    for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value);
  }, untouched);
  await practiceButton(root).click();
  await jump(root, sample, 1);
  await practiceButton(root).click();
  await expectStored(page, sample, 1, [0, 1]);
  await freezeClock(page);
  const timer = timerFor(root);
  await timer.getByRole('button', {name: 'Start timer', exact: true}).click();
  await page.clock.runFor(1000);
  await expectTime(timer, '4:59');
  const reset = root.getByRole('button', {name: 'Reset progress', exact: true});
  const confirmation = root.getByRole('group', {name: 'Confirm progress reset', exact: true});
  await reset.click();
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole('button', {name: 'Cancel', exact: true})).toBeFocused();
  await expectStep(root, sample, 1);
  await expectPractised(root, 2);
  await confirmation.getByRole('button', {name: 'Cancel', exact: true}).click();
  await expect(confirmation).toHaveCount(0);
  await expect(reset).toBeFocused();
  await expectStored(page, sample, 1, [0, 1]);
  await page.clock.runFor(1000);
  await expectTime(timer, '4:58');
  await reset.click();
  await confirmation.getByRole('button', {name: 'Confirm reset', exact: true}).click();
  await expect(confirmation).toHaveCount(0);
  await expect(reset).toBeFocused();
  await expectStep(root, sample, 0);
  await expectPractised(root, 0);
  await expect(practiceButton(root)).toHaveAttribute('aria-pressed', 'false');
  await expectTime(timer, '5:00');
  await expect(timer.getByRole('button', {name: 'Start timer', exact: true})).toBeVisible();
  await page.clock.runFor(2000);
  await expectTime(timer, '5:00');
  await expectStored(page, sample, 0, []);
  expect(await page.evaluate((keys) => Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])), Object.keys(untouched)))
    .toEqual(untouched);
});

test('LLD keyboard range moves exactly one step without hijacking text input or button focus', async ({page}) => {
  const root = await openLesson(page);
  const slider = root.getByRole('slider', {name: 'Lesson step', exact: true});
  await slider.focus();
  await slider.press('ArrowRight');
  await expectStep(root, sample, 1);
  await expect(slider).toBeFocused();
  await slider.press('ArrowLeft');
  await expectStep(root, sample, 0);
  await slider.press('ArrowLeft');
  await expectStep(root, sample, 0);
  const next = root.getByRole('button', {name: 'Next step', exact: true});
  await next.focus();
  await next.press('Enter');
  await expectStep(root, sample, 1);
  await expect(next).toBeFocused();
  // The player has no free-text field. Insert a native input in its subtree to
  // catch accidental document/section arrow-key handlers without app changes.
  await root.evaluate((element) => {
    const input = document.createElement('input');
    input.setAttribute('aria-label', 'Keyboard isolation probe');
    input.value = 'abcd';
    element.appendChild(input);
  });
  const input = root.getByRole('textbox', {name: 'Keyboard isolation probe', exact: true});
  await input.focus();
  await input.evaluate((element) => element.setSelectionRange(1, 1));
  await input.press('ArrowRight');
  expect(await input.evaluate((element) => element.selectionStart)).toBe(2);
  await expectStep(root, sample, 1);
  await input.press('ArrowLeft');
  expect(await input.evaluate((element) => element.selectionStart)).toBe(1);
  await expectStep(root, sample, 1);
  await expect(input).toHaveValue('abcd');
  await expect(input).toBeFocused();
  await expectPractised(root, 0);
});

async function expectNoOverflow(page, root, label) {
  await expect.poll(() => root.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.left >= -1 && bounds.right <= window.innerWidth + 1
      && element.scrollWidth <= element.clientWidth + 1;
  }), `${label}: player fits the viewport`).toBe(true);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    `${label}: no document-wide horizontal overflow (including detailed notes)`).toBe(true);
}

for (const topic of topics) {
  for (const theme of ['light', 'dark']) {
    test(`LLD ${topic.title}: mobile 375x812 diagrams and code fit ${theme} theme`, async ({page}) => {
      await page.setViewportSize({width: 375, height: 812});
      await page.emulateMedia({colorScheme: theme, reducedMotion: 'reduce'});
      await seedStorage(page, {theme});
      const root = await openLesson(page, topic);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expectNoOverflow(page, root, `${topic.id} ${theme} start`);
      let previousLabels;
      for (let index = 2; index <= 6; index++) {
        await jump(root, topic, index);
        previousLabels = await expectDiagram(root, profileById.get(topic.id), index, previousLabels);
        await expectNoOverflow(page, root, `${topic.id} ${theme} slide ${index + 1}`);
      }
      await jump(root, topic, 7);
      await expect(root.locator('pre code')).toBeVisible();
      await expect(diagramFor(root)).toHaveCount(0);
      await expectNoOverflow(page, root, `${topic.id} ${theme} code`);
    });
  }
}