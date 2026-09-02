# Link usage

## When to use

Use a link when activation takes the user somewhere: an external URL, a route
inside the app, or any other destination the caller resolves. Use it for
navigation cues in a column, a footer, or a panel, and for references inside
prose.

Use a button instead when activation does something: submits, saves, opens an
overlay, or changes state. The two can be styled to look alike, and that does not
change which one is correct. If the result is a new location, it is a link.

## Basic usage

```tsx
import { Link } from '@fluentui-react-native/agentic-components';

<Link content="View the 2026 fiscal report" url="https://example.com/fiscal-2026" />;
```

`typeSet` defaults to `functional`, `inline` to `false`, and `disabled` to
`false`. With no `content` the link renders the placeholder text `Link`, which is
useful in a story and wrong in an app: always pass a real label.

## Navigation is delegated

`url` is handed to React Native's linking module. Link does not check the
destination first and does not wait for the result, so an unroutable scheme or a
missing handler fails after the press, not before it.

`onPress` runs on every activation, before navigation, so a link can report the
interaction and travel at the same time.

```tsx
<Link content="Open the release notes" onPress={() => telemetry.record('release-notes')} url="https://example.com/release-notes" />
```

A link with no `url` navigates nothing. Use that form when the caller does its
own routing.

```tsx
<Link content="Back to inbox" onPress={() => navigate('inbox')} />
```

## Failed navigation

A rejected navigation is reported to `onNavigationError` when you supply one, and
left untouched when you do not. Supply one whenever a failure should be handled rather
than merely observed.

```tsx
<Link content="Open the invoice" onNavigationError={(error) => showMessage(String(error))} url={invoiceUrl} />
```

Do not wrap a link in a handler that discards the error. A destination that will
not open is a bug, and hiding it makes it permanent.

## Inline links

Set `inline` for any link that sits inside a run of text. It keeps the underline
visible at rest, which is the only thing distinguishing the link from the words
around it, and it drops the standalone typography so the link inherits the
surrounding text style.

```tsx
<Text style={{ fontSize: 18, lineHeight: 24 }}>
  Read the <Link content="deployment guide" inline url="https://example.com/deploy" /> before you start.
</Text>
```

Leave `inline` unset only for standalone links that sit in whitespace, in a
column of links, or in a navigation region. Those acquire the underline on press
and on focus.

```tsx
<View style={{ gap: 8 }}>
  <Link content="Privacy" url="https://example.com/privacy" />
  <Link content="Terms" url="https://example.com/terms" />
</View>
```

## Type sets

Match `typeSet` to the surface. `functional` belongs in interface chrome —
toolbars, panels, dialogs, navigation. `content` belongs in prose — articles,
marketing pages, editorial. Mixing them inside one surface reads as a defect.

```tsx
<Link content="Manage permissions" typeSet="functional" url={permissionsUrl} />
<Link content="Read the full study" typeSet="content" url={studyUrl} />
```

`typeSet` has no effect on an inline link, which inherits its typography from the
text around it.

## Leaving the app

When activation opens a browser or a new window, pair a trailing glyph with an
accessible name that says so. The glyph is the visual cue and the name is the
assistive-technology cue, and each one alone leaves half the users guessing.

```tsx
<Link
  accessibilityLabel="View the 2026 fiscal report, opens in your browser"
  content="View the 2026 fiscal report"
  icon={{ fontSource: { codepoint: 0x2197 } }}
  url="https://example.com/fiscal-2026"
/>
```

## Disabled links

```tsx
<Link content="View the 2026 fiscal report" disabled />
```

A disabled link cannot be focused, pressed, or navigated, and reports its
disabled state. Reach for it only when the link must stay in place; when a
destination is simply unavailable, render plain text instead.

## Writing the label

Write labels that survive being read on their own, because assistive technology
lists links without the prose around them. Use sentence case. Keep raw URLs out
of body text, and keep the sentence's final period outside the link.

## Common mistakes

Using a link for an action, or a button for a destination, because the two were
styled to look alike.

Forgetting `inline` on a link inside prose, which leaves it the same color as the
text around it with nothing else to mark it.

Locking a standalone type set onto an inline link, which makes it the wrong size
for the paragraph it sits in.

Expecting a hover underline. There is no hover on these platforms; a standalone
link shows its underline on press and on focus.

Expecting a visited link to change color. There is no visited state, and the
source design specifies visited as identical to rest anyway.

Leaving the placeholder label in place.
