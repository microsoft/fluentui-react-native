# What is a token?

A token is type of prop which maps to one or more style properties. In effect, a token becomes a semantic representation of a style value, where the style might be inline, or exposed as a CSS property.

`put example`

A token prop can map to styles in a variety of ways:

- Mapped - these tokens will be copied to a style directly, using the key name with the values remaining unchanged.
- Renamed - these tokens might map to a different name. If a higher order control has two text elements, it might expose a color token for each element.
- Semantic - a token might be able to reference the name of a theme color, or a standard padding value, which will be resolved before it is pushed to a style.
- One to Many - a single token could cause multiple properties of style to be set such as a font variant (e.g. 'caption') might cause family, size, and weight to be set.

Note that some, or all, of these might be combined for a given token.

## Why use tokens?

In the case of a simple control where the styling never changes, using styles directly works fine. When components need to be customizable, particularly when they are complicated, is when a token based approach pays dividends.

### Flexible customization

A component built using tokens allows the focus to be on authoring rather than the details of rendering.

While a style has values whos types are fixed by either react-native or CSS, a token can allow types to be extended to include semantic references. Some examples might be:

- Allow colors to also reference an entry in the theme by name
- Allow font styles to reference semantic styles in the theme or in a table. So defining a font size as 'large' instead of '14pt' or 14.

Tokens also allow for simplifying the usage of style parameters. For a control that can be vertical or horizontal there might be a general purpose alignment token which can define 'start' | 'center' | 'end' as values. These would get translated to the appropriate flexbox settings depending on the orientation set in the props.

### Separation of concerns

In the case of a higher order component, this component will contain multiple sub-components that it is managing. As a result to customize the control it may be necessary to set some style values on the outer component and some on the sub-components.

Even if a means of setting styles on sub-components is provided this is inherently fragile as it requires a consumer of the component to know about how that component is implemented. This makes the act of customizing a component more difficult and requires deep understanding. If a HOC has an additional mode that isn't accounted for, the customization may break when that mode is set. Even more concerning, if the implementation changes in any way in a subsequent release there is a very real chance the customizations will break, often in subtle ways.

### Memoization

One critical aspect of component design is having style values that only change when needed. In CSS this means creating the minimum number of new classes in code. In react-native or where using inline styles, this means having the object identity stay consistent from render to render such that we re-render the minimal set of components.

By their very nature tokens allow expressing more complex concepts in a simpler way. Because each token will expand to one or more styles, it is inherently a set that is less than or equal to the set of style values, defined in a consistent location. Rather than memoizing on all the set of style values across a collection of styles, the tokens can be memoized as a single set.

`more examples`

## Defining Token Interfaces

Token interfaces can be defined in a standard or component specific manner. These can be grouped into related sets of properties for easy consumption.

### Standard token interfaces

A general token interface directly represents styles that apply to most or all controls. Some examples might be:

    export interface IBorderTokens {
      borderColor?: string;
      borderWidth?: number;
      borderRadius?: AnimatableNumericValue | string;
      // ...other related border properties
    }

These interfaces should have the following characteristics:

- Names of the tokens should match the names of the style values where possible
- The set of tokens should be related such that a component would include all or none of them
- If more granularity is desired they can be broken into more granular interfaces then composed into larger convenience interfaces.

#### Semantic naming for HOCs

In the case of higher order components there may be a need to alias values. An example of this might be a control that has a primary and secondary text element.

- Names for these should be semantic where it makes sense so having a token value for `secondaryTextColor` is generally preferable to having `buttonSecondLineTextColor`.
- Note that if the mapping of token to value is not obvious a more specific name should be used. So for a calendar control it might make sense to have `dayHeaderTextColor` rather than a more generic name.

### Component specific token interfaces

In many cases the set of tokens on a component will be a mix of standard values and component specific values. While the standard values should map very directly to style values, component specific tokens might have multiple related effects. An example might be a switch for vertical or horizontal alignment of a complex control. This could produce or shift a number of values around across a number of sub-components.

One way to think about this is whether a token could just be transferred to a sub-component. If a component exposes a `backgroundColor` token, but really applies that value to an inner control, that token can just be set on the inner control. Whereas a `spinnerMode` token is only understood by the spinner control itself.

### Public vs. custom tokens

It is also possible to split tokens into two sets. Those that should be exposed on the public props interface for the component, and those that should be exposed only via settings customizations. For a simple token where the value is not expected to change based on control state a public exposure makes sense.

For properties like the colors of interactable controls, exposing these only via settings avoids the combinatoric expansion of property + state combinations. On a public interface the token values for a button would need to have backgroundColor, backgroundColorHovered, backgroundColorPressed, backgroundColorDisabled, and so on.

## Usage

For a detailed look at usage see the [Token Usage Guide](src/TokenUsage.md).
