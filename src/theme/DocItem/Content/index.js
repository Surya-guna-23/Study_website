import React from 'react';
import Original from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import LLDWalkthrough from '@site/src/components/LLDWalkthrough';
import {getLesson} from '@site/src/data/system-design/lessons';

export default function DocItemContent(props) {
  const {metadata} = useDoc();
  const id = metadata.id;
  const topicId = id.startsWith('system-design/case-studies/') ? id.split('/').pop() : null;
  // Preserve the exact original tree for unrelated pages and missing lessons.
  if (!topicId || !getLesson(topicId)) return <Original {...props} />;
  return (
    <>
      <LLDWalkthrough key={id} topicId={topicId} />
      <div id="lld-detailed-notes" tabIndex={-1} style={{scrollMarginTop: '5rem'}}>
        <Original {...props} />
      </div>
    </>
  );
}