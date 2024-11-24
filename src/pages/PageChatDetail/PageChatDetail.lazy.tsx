import React, { lazy, Suspense } from 'react';

const LazyPageChatDetail = lazy(() => import('./PageChatDetail'));

const PageChatDetail = (props: JSX.IntrinsicAttributes & { children?: React.ReactNode; }) => (
  <Suspense fallback={null}>
    <LazyPageChatDetail {...props} />
  </Suspense>
);

export default PageChatDetail;
