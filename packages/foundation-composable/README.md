# Composable - un-opinionated and composable base components

This package provides a framework for writing unopinionated functional components that can easily be extended to inject styling, and composed together in an efficient manner.

This provides a foundation for writing both simple and higher order components with the following characteristics:

- **Unopinionated** - Components can be written such that they encapsulate the core functionality of a component, without having opinions on what styling system to use. There are myriad styling systems and all involve tradeoffs between flexibility, simplicity, and performance. Writing components which allow injection of a styling system allows consumers to optimize for their scenarios.
- **Reusable** - Modern practice in react encourages making functionality reusable via hooks. This framework provides a standardized pattern for hooks and how their results are communicated to the actual rendering. This allows replacing or augmenting either the hook or rendering portions without the need of writing everything from scratch.
- **Customizeable** - Typical customization patterns involve either passing customizations via props, or customizing via wrapping. Passing customizations via props explode the complexity of the props and cause issues with cacheability and performance. Wrapping components adds additional layers to the react hierarchy and still precludes access to internals of the component.
- **Composable** - This framework provides a repeatable pattern which allows for a wrapped component, or a part of a higher order component, to be executed functionally without adding extra layers to the react hierarchy.
- **Scalable** - Composable components can be used for both simple and higher order components. The framework uses the concept of slots to make targeting and customizing sub-components easier.
- **Flexible** - This pattern is suitable for use with both react and react-native. None of the concepts are platform specific.

## Guides

- [Getting Started: Simple Components](./GuideSimple.md) - a walkthrough of creating a simple composable component. Start here to understand the base concepts.
- [Getting Started: Higher Order Components](./GuideHOC.md) - a walkthrough of creating a complex composable component. Read this next to better understand how the pieces fit together and can be recombined.

## Writing a Higher Order Component

While the composable pattern works for simple components, it is designed to help manage the complexity of higher order components. Let's use writing a simple Button as an example, this time working backwards from `render`.
