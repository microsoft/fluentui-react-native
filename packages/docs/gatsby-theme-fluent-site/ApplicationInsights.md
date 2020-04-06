
# Application Insights README
Fluent website telementry information

**Table of Contents**
<!-- TOC -->

- [Application Insights README](#application-insights-readme)
  - [Description](#description)
  - [Usage](#usage)
  - [IMPORTANT! Build notes](#important-build-notes)
  - [NPM Packages](#npm-packages)
  - [Resources](#resources)

<!-- /TOC -->


## Description
The Application Insights interface has be designed as a client side only react component. It hooks into the equivelent of
 onComponentDidMount event (via hooks) and runs once per instantiation.

## Usage

*PageView*
```typescript
import { usePageViewTelemetry } from '../components/ApplicationInsights'

...

  let pathName = "Home" // if pathName is null, it will use the window.location.pathName value
  const [pageView, setPageView] = usePageViewTelemetry({ name: props.path })

  // since the call is made immediately, you can just do the following if you are not updating the value
  usePageViewTelemetry({ name: props.path })

```
*EventView*
```jsx
import { useEventTelemetry } from '../components/ApplicationInsights'

...

 const [myEvent, invokeMyEventTelemetry] = useEventTelemetry({ name: 'MyEvent' })

 const buttonClick = () => {
   invokeMyEventTelemetry();
 }

return (
  <button onClick={buttonClick}>Click Here!</button>
)

```

*EventView With Name/Value Property*
```jsx
import { useEventTelemetry } from '../components/ApplicationInsights'

...

 const [myEvent, invokeMyEventTelemetry] = useEventTelemetry({ name: 'MyEvent' })

 const sendEvent = (buttonId:number) => {
   myEvent.properties = myEvent.properties ? myEvent.properties : []
   myEvent.properties["Button_Clicked"] = buttonId
   // this call will send the update and send the telementry data
   invokeMyEventTelemetry(myEvent)

 }

return (
  <button onClick={() => {sendEvent(1)}}>Button 1</button>
  <button onClick={() => {sendEvent(2)}}>Button 2</button>
)

```

## IMPORTANT! Build notes
*NOTE
For production builds you need to set GATBSY_APPLICATIONINSIGHTS_KEY to the value of the production key *prior* to
a production build. This can be done as an evironment variable or in the .env.production file under src/website.
The key is retrieved from the Application Insights app on https://portal.azure.com

For development/test builds, modify the .env.developement file.

## NPM Packages
NPM package(s):
@microsoft/applicationinsights-web
@microsoft/applicationinsights-react-js

## Resources
[Azure Portal Resource](https://ms.portal.azure.com/#@microsoft.onmicrosoft.com/resource/subscriptions/9ccbac18-03d3-485b-a43e-87dc09014817/resourcegroups/OXOSharedRG/providers/microsoft.insights/components/FluentUI-Website/overview)

[Javascript NPM Setup](https://docs.microsoft.com/en-us/azure/azure-monitor/app/javascript#npm-based-setup)

[Application Insights React](https://github.com/microsoft/ApplicationInsights-JS/blob/17ef50442f73fd02a758fbd74134933d92607ecf/extensions/applicationinsights-react-js/README.md)
