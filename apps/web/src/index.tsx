import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
  initialProp: {},
  rootTag: document.getElementById('root')
});