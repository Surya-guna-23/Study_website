import parking from './parking.json';
import cases from './cases.json';
import games from './lessons/games';
import resources from './lessons/resources';
import machines from './lessons/machines';
import commerce from './lessons/commerce';
import accounting from './lessons/accounting';

// Original interview models distilled from the local guides, not upstream APIs.
// Java is display-only, partial, and not executed. No browser or filesystem APIs.
const stages = [
  ['boundaries', 'Problem and boundaries', 'Scope'],
  ['invariants', 'Clarify assumptions and invariants', 'Clarify'],
  ['entities', 'Draw the core entities', 'Draw'],
  ['coordination', 'Add coordinating responsibility', 'Draw'],
  ['policy', 'Choose only justified policies', 'Design'],
  ['success', 'Trace success one call at a time', 'Trace'],
  ['failure', 'Trace failure and protect the invariant', 'Trace'],
  ['code', 'Explain the critical method', 'Code'],
  ['tradeoffs', 'Justify patterns and tradeoffs', 'Defend'],
  ['rehearse', 'Rehearse the complete answer', 'Rehearse'],
];

function buildLesson(profile, topic) {
  const [core, coordinator, policy] = profile.classes;
  const diagrams = [core, `${core}\n${coordinator}`, `${core}\n${coordinator}\n${policy}`]
    .map(body => `classDiagram\n${body}`);
  const followUps = profile.followUps.map(([question, answer]) => ({question, answer}));
  const beats = [...profile.beats, [
    `Present ${topic.title} as one coherent design and answer three challenges.`,
    profile.recap,
    profile.script,
    profile.closing,
    followUps.map((item, index) => `${index + 1}. ${item.question}`).join('\n'),
    followUps.map((item, index) => `${index + 1}. ${item.answer}`).join('\n'),
  ]];
  return {
    id: profile.id,
    title: topic.title,
    sourceNote: `Original interview model; see source audit below. Source snapshot, not production. ${profile.source}`,
    steps: beats.map(([goal, draw, say, why, prompt, answer], index) => {
      const [id, title, phase] = stages[index];
      const diagram = index >= 2 && index <= 4 ? diagrams[index - 2]
        : index === 5 ? `sequenceDiagram\n${profile.success}`
          : index === 6 ? `sequenceDiagram\n${profile.failure}` : '';
      return {
        id: `${profile.id}-${id}`, title, phase, goal, draw, say, why,
        checkpoint: prompt,
        diagram,
        // A meaningful text alternative for every diagram, including runtime order.
        diagramSummary: diagram ? `${draw} ${say}` : '',
        ...(index === 7 ? {code: {
          language: 'java', text: profile.code,
          explanation: `Original partial Java excerpt, not executed or standalone. ${profile.codeNote}`,
        }} : {}),
        prompt, answer,
      };
    }),
    followUps,
  };
}

const topics = [...parking, ...cases];
const profiles = [...resources, ...games, ...machines, ...commerce, ...accounting];
const profileById = new Map(profiles.map(profile => [profile.id, profile]));
if (profiles.length !== 15 || profileById.size !== 15 || topics.length !== 15
    || new Set(topics.map(topic => topic.id)).size !== 15
    || topics.some(topic => !profileById.has(topic.id))) {
  throw new Error('Lesson profiles must cover parking.json + cases.json exactly once');
}
for (const profile of profiles) {
  if (profile.beats.length !== 9 || profile.classes.length !== 3
      || profile.followUps.length !== 3 || !profile.code || !profile.source
      || profile.beats.some(beat => beat.length !== 6 || beat.some(value => typeof value !== 'string' || !value.trim()))) {
    throw new Error(`Incomplete topic profile: ${profile.id}`);
  }
}

export const lessons = topics.map(topic => buildLesson(profileById.get(topic.id), topic));

// Fail early on authoring mistakes rather than silently shipping empty slides.
for (const lesson of lessons) {
  if (lesson.steps.length !== 10 || new Set(lesson.steps.map(step => step.id)).size !== 10
      || lesson.followUps.some(item => !item.question || !item.answer)) {
    throw new Error(`Invalid lesson: ${lesson.id}`);
  }
  for (const step of lesson.steps) {
    for (const field of ['id', 'title', 'phase', 'goal', 'draw', 'say', 'why', 'checkpoint', 'prompt', 'answer']) {
      if (typeof step[field] !== 'string' || !step[field].trim()) {
        throw new Error(`Missing ${field}: ${step.id}`);
      }
    }
    if (step.diagram.startsWith('sequenceDiagram') && step.diagram.includes(';')) {
      throw new Error(`Mermaid sequence labels cannot contain semicolons: ${step.id}`);
    }
  }
  if (lesson.steps.filter(step => step.diagram.startsWith('classDiagram')).length !== 3
      || lesson.steps.filter(step => step.diagram.startsWith('sequenceDiagram')).length !== 2
      || lesson.steps[7].code?.language !== 'java') {
    throw new Error(`Missing teaching artifacts: ${lesson.id}`);
  }
}

const lessonById = new Map(lessons.map(lesson => [lesson.id, lesson]));
// Unknown/non-case-study IDs intentionally return undefined so callers can fall back.
export function getLesson(topicId) {
  return lessonById.get(topicId);
}