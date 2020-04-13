import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { IPageViewTelemetry } from '@microsoft/applicationinsights-web'

import InitAppInsights from './InitAppInsights'

//#region usePageViewTelemetry Hook
/**
 * Returns a stateful value of a IPageViewTelemetry object and a function to update the telemetry value
 * @param {IPageViewTelemetry} data  IPageViewTelemetry Object
 * @returns [IPageViewTelemetry, Function to update]
 **/
export default function usePageViewTelemetry(
  data: IPageViewTelemetry | undefined
): [IPageViewTelemetry | undefined, Dispatch<SetStateAction<IPageViewTelemetry | undefined>>] {
  // Send the data immediately (OnComponentMount) if instantiated with data
  const [telementryData, setTelementryData] = useState(data)

  useEffect(() => {
    if (typeof window !== undefined && window && telementryData !== undefined) {
      let appInsights = InitAppInsights()
      if (appInsights !== undefined) {
        let path = telementryData.name
        if (path === undefined) {
          path = window.location.pathname
          if (path === '/') {
            path = document.title
          } else {
            path = path.replace(/^\//, '')
          }
          telementryData.name = path
          setTelementryData(telementryData)
        }
        appInsights.trackPageView(telementryData)
      }
    }
  }, [])

  return [telementryData, setTelementryData]
}

//#endregion
