import * as React from 'react';
import PageShell from './PageShell';
import { Sidebar } from '../components/Sidebar';
import { PageInnerContent } from '../components/Content';
import styled from '@emotion/styled';
import { usePageViewTelemetry } from '../components/ApplicationInsights';
import { Header } from '../components/Header';
import { PageContext } from '../components/Provider';
import { Footer } from '../components/Footer';

export default props => {
  usePageViewTelemetry({ name: props.path });
  const sidebarItems = props.pathContext !== undefined ? props.pathContext.toc : undefined;

  return (
    <PageContext.Provider value={props}>
      <PageShell>
        <Header />
        <Canvas>
          {sidebarItems && <Sidebar items={sidebarItems} />}
          <PageInnerContent>{props.children}</PageInnerContent>
        </Canvas>
        <Footer />
      </PageShell>
    </PageContext.Provider>
  );
};

const HeaderHeight = 69;
const FooterHeight = 162;

const Canvas = styled.div`
  display: flex;
  min-height: calc(100vh - ${HeaderHeight}px - ${FooterHeight}px);
  max-height: fit-content;
  overflow: hidden;
`;
