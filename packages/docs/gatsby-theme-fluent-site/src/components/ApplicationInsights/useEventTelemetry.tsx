import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import { IEventTelemetry } from '@microsoft/applicationinsights-web'

import InitAppInsights from './InitAppInsights'

//#region IEventTelemetry Hook
/**
 * Returns a stateful value of a IEventTelemetry object and a function to invoke the telemetry call
 * @param {IEventTelemetry} data  IEventTelemetry Object
 * @returns [IEventTelemetry, Function to invoke the call]
 **/
export default function usePageViewTelemetry(
  data: IEventTelemetry | undefined
): [IEventTelemetry, Dispatch<SetStateAction<IEventTelemetry | undefined>>] {
  data = data || ({} as IEventTelemetry)
  const [telementryData, setTelementryData] = useState(data)

  const invoke = (newData: IEventTelemetry | undefined) => {
    if (newData !== undefined) {
      setTelementryData(newData)
    }
    newData = newData || telementryData
    if (newData !== undefined) {
      let appInsights = InitAppInsights()
      if (appInsights) {
        appInsights.trackEvent(newData)
      }
    }
  }

  return [telementryData, invoke]
}
//#endregion
