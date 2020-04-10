import React, { useEffect } from 'react'
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
import styled from '@emotion/styled'

declare global {
  interface Window {
    appInsights: ApplicationInsights
  }
}

const StyledAppInsights = styled.div`
  display: none;
`
export interface IAppInsightsPageViewProps {
  path: string | null
}

export interface IAppInsightsEventViewProps {
  eventName: string
  eventPropertyName?: string
  eventPropertyValue?: any
}

const AppInsightsLoadable = (props: IAppInsightsPageViewProps | IAppInsightsEventViewProps) => {
  useEffect(() => {
    if (window.appInsights === undefined) {
      /* TODO: The key needs to be injected for production vs development */
      window.appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: `${process.env.GATSBY_APPLICATIONINSIGHTS_KEY}`,
          enableAutoRouteTracking: true,

          /* ...Other Configuration Options... */
        },
      })

      window.appInsights.loadAppInsights()
    }
    let eventProps = props as IAppInsightsEventViewProps
    if (eventProps.eventName !== undefined) {
      if (eventProps.eventPropertyName !== undefined) {
        window.appInsights.trackEvent({
          name: eventProps.eventName,
          properties: [eventProps.eventPropertyName] = eventProps.eventPropertyValue,
        })
      } else {
        window.appInsights.trackEvent({ name: eventProps.eventName })
      }
    } else {
      let pageViewProps = props as IAppInsightsPageViewProps
      let path = pageViewProps.path ? pageViewProps.path : window.location.pathname
      if (path === '/') {
        path = document.title
      } else {
        path = path.replace(/^\//, '')
      }
      if (path) {
        window.appInsights.trackPageView({ name: path })
      }
    }
  }, [])

  return <StyledAppInsights />
}
export default AppInsightsLoadable
