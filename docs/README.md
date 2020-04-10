# Fluent Website Content

__Key Concepts:__
1. [Folder path === URL](#adding-new-content)
2. [Left hand navigation defined per folder/folder tree](#creating-navigation)
3. [Built with MD, MDX or TSX](#supported-page-formats)
4. [Host your content anywhere](#hosting-your-content)

## Adding new content

Files in the `docs` folders are built to a page with the same URL as the relative directory. `index` files will be rendered as the folder's root page.

`docs/components/button.mdx` will be built to `example.com/components/button.html`. `docs/styles/index.tsx` will be built to `example.com/styles/index.html`


## Creating navigation

The vertical navigation of each page is written in a `toc.yml` file that includes `name`, `link` and any children `items`.

- `name` is the link text
- `link` is the full url to the page
- `items` is an array of name/link pairs and can be further nested


```yml
- name: Components
  items:
  - name: Button
    link: components/button
  - name: Toggle
    link: components/toggle

```

### Unique navigation for sub controls

Often you'll want a subsection of the site to have its own navigation. The navigation of each page is based off of the closest `toc.yml` file to the page.

```md
docs/
  styles.mdx
  toc.yml
  components/
    button.mdx
    toc.yml
  foo/
    bar.mdx

```

The `styles` page will have the navigation from `docs/toc.yml` and `button` page will use the navigation found in `docs/components/toc.yml`.

`docs/foo` does not contain a `toc.yml` so `docs/toc.yml` will be used for `bar.mdx`.

## Supported page formats

The Fluid UI Site supports multiple page formats.

### MDX

[MDX](https://mdxjs.com/) is a superset of markdown that adds the power of JSX to the file.
This means you can import JSX directly into your markdown content.

#### Importing JSX into MDX

```md
import {Button} from 'office-ui-fabric-react'

## This is a Fabric button

<Button primary={true}> Click Me </Button>

```

#### Importing MD into MDX

Another great feature of MDX is the ability to import other MD or MDX files into a single file.
This is a great way to split content out into multiple files and combine/reuse it.

```md
import Stuff from './somestuff.md'

Hello, this is my <Stuff />
```

### TSX Files

TSX files can be used when you need complete control over the page contents. No assumptions will be made about the page contents, styles or meta information (other than URL).


#### Leveraging site templates

Unless your page is meant to be a standalone app, we recommend using the built in `PageTemplate` to render the default page shell.

```tsx
import React from 'react';
import PageTemplate from 'gatsby-theme-fluent-site/src/templates/PageTemplate'
import

export default () => {
  return <PageTemplate>Page Content</PageTemplate>
}
```
## Hosting your content

Gatsby can source pages from multiple locations. Content added to this repo under `docs/ios` could easily be moved to another repo under `fluentui-docs/ios` and produce the exact same page content. This workflow is not yet fully implemented, but it is a core tenent and fully supported by our tech choices.
