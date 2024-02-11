import React, { PropsWithChildren } from 'react';
import { Trans as OriginalTrans } from 'react-i18next';

export const Trans: React.FC<PropsWithChildren> = React.memo((props) => {
  return <OriginalTrans>{props.children}</OriginalTrans>;
});
Trans.displayName = 'Trans';
