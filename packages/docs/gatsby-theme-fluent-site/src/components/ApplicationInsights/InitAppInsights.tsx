import { ApplicationInsights, IEventTelemetry } from '@microsoft/applicationinsights-web'
import React from 'react'

interface AppInsightsWrapper {
  appInsights: ApplicationInsights
}

declare global {
  interface Window {
    appInsights: ApplicationInsights
  }
}
/**
 * Returns an instance of the Application Insights object, undefined, or false(during SSR)
 **/
export default function InitAppInsights(): ApplicationInsights | undefined {
  const windowGlobal = (typeof window !== 'undefined' && window) as Window
  const key = `${process.env.GATSBY_APPLICATIONINSIGHTS_KEY}`
  if (windowGlobal && key !== undefined && key !== '') {
    if (windowGlobal.appInsights === undefined) {
      /* TODO: The key needs to be injected for production vs development */
      windowGlobal.appInsights = new ApplicationInsights({
        config: {
          instrumentationKey: key,
          enableAutoRouteTracking: true,

          /* ...Other Configuration Options... */
        },
      })

      windowGlobal.appInsights.loadAppInsights()
    }
    return windowGlobal.appInsights
  }
  return undefined
}
