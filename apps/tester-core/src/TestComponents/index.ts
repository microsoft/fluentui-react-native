import type * as React from 'react';

export type TestDescription = {
  name: string;
  component: React.FunctionComponent;
  testPageButton: string;
  platforms: string[];
};
