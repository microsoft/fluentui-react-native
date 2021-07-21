# AssertNever

This package contains a utility function which helps ensure that all entries of an enum are handled in a switch case statement.

## Example

```ts
enum A {
  foo,
  bar,
}

...

function B(arg: A){
  switch(A) {
    case foo:
      return 'foo';
    case bar:
      return 'bar';
    default:
      assertNever(A); // Will cause build error if another entry is added to A
  }
}
```
