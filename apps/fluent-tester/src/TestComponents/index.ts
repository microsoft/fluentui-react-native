import * as React from 'react';

interface E2EContextType {
  e2eMode: boolean;
  setE2EMode: (enable: boolean) => any;
}

export const E2EContext = React.createContext<E2EContextType>({
  e2eMode: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setE2EMode: () => {}, // This empty function is an initial value that is overridden in FluentTester.tsx
});

export type TestDescription = {
  name: string;
  component: React.FunctionComponent;
  testPageButton: string;
  platforms: string[];
};
