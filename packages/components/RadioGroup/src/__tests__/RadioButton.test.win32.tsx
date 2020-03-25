// import * as React from 'react';
// import { RadioButton } from '../';
// import * as renderer from 'react-test-renderer';

// beforeEach(() => {});

// it('RadioButton default', () => {
//   const tree = renderer.create(<RadioButton content="Default RadioButton" buttonKey="A" />).toJSON();
//   expect(tree).toMatchSnapshot();
// });

// it('RadioButton all props', () => {
//   const tree = renderer
//     .create(<RadioButton content="Default RadioButton" buttonKey="A" disabled={false} ariaLabel="This is the ariaLabel" />)
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });

// it('RadioButton all props and tokens', () => {
//   const CustomRadioButton = RadioButton.customize({
//     tokens: { backgroundColor: 'blue', borderColor: 'blue', color: 'blue', fontSize: 14 }
//   });
//   const tree = renderer
//     .create(<CustomRadioButton content="Default RadioButton" buttonKey="A" disabled={false} ariaLabel="This is the ariaLabel" />)
//     .toJSON();
//   expect(tree).toMatchSnapshot();
// });
