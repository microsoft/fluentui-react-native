// @ts-check

const enzyme = require('enzyme');
const Adapter = require('@cfaester/enzyme-adapter-react-18');

enzyme.configure({ adapter: new Adapter() });
