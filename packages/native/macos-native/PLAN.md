# Create a thin native wrapper for macOS native components

1. This should be a single package called @fluentui-react-native/macos-native
2. It should contain a set of native components for using macOS control directly in react-native.
3. Components should depend on framework-base and should be primitive components
4. Components should work in both paper and fabric
5. Components should have stories and should be shown in the storybook

## Component Inventory

Inventory the stock controls for macOS and for each control:
- Give the name, description, what it does
- List what customizations can be applied to the control
- List whether it has special appearance changes for things like liquid glass
- Give a brief summary of whether it would be useful to include with a decision field for implement now, implement later, don't implement.

Put the component inventory in an inventory.md file in this directory.

## Plan refinement

At the same time refine the overall plan but hold off on implementing it until decisions are made on the component inventory.