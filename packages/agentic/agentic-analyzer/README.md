# @fluentui-react-native/agentic-analyzer

A test/analysis toolkit for safely refactoring v1 components. It builds a **sentinel theme** whose every leaf value is unique, renders components with `@testing-library/react-native` to capture accessibility trees, computed styles, and snapshots, and **reverse-maps** resolved style values back to the exact theme/token slot they came from — so a refactor that changes _which_ token feeds a style is caught even when the final pixel value is unchanged. Also provides a strategy for multiplexing jest per platform.

See [`PLAN.md`](./PLAN.md) for the full design and phased plan.
