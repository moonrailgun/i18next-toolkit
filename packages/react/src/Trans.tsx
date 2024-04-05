import React, { PropsWithChildren } from 'react';
import { Trans as OriginalTrans } from 'react-i18next';

export const Trans: React.FC<PropsWithChildren<{ ns?: string }>> = React.memo(
  (props) => {
    return <OriginalTrans {...props} />;
  }
);
Trans.displayName = 'Trans';
