import * as ReactNative from 'react-native';

export const commonTestStyles = ReactNative.StyleSheet.create({
  viewStyle: {
    minHeight: 200,
    justifyContent: 'space-between'
  },
  stackStyle: {
    borderWidth: 2,
    borderColor: '#bdbdbd',
    padding: 12,
    margin: 8
  },
  separatorStackStyle: {
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  }
});

export const fabricTesterStyles = ReactNative.StyleSheet.create({
  root: { 
    flexDirection: 'row', 
    minHeight: 500,
    minWidth: 300,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 4
  },

  testHeader: {
    marginBottom: 8
  },

  testList: {
    width: 160
  },

  testListContainerStyle: {
    flexDirection: 'column', 
    alignItems: 'stretch'
  },

  testListItem: {
    width: 150
  },

  separator: {
    marginHorizontal: 8,
    width: 2
  },

  noTest: {
    alignSelf: 'center'
  },
});