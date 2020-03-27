import { StyleSheet } from 'react-native';
import { IStackProps } from '@fluentui-react-native/stack';

export const commonTestStyles = StyleSheet.create({
  root: {
    marginTop: 16,
    marginRight: 32,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  header: {
    marginVertical: 6,
    fontSize: 12
  },
  section: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 12
  },
  separatorStack: {
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  settings: {
    flexGrow: 1
  },
  slider: {
    marginVertical: 6
  },
  stack: {
    borderWidth: 2,
    borderColor: '#bdbdbd',
    padding: 12,
    margin: 8
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textBox: {
    borderWidth: 1,
    height: 25,
    fontSize: 12,
    width: 150,
    marginBottom: 8
  },
  view: {
    minHeight: 200,
    justifyContent: 'space-between'
  }
});

export const fabricTesterStyles = StyleSheet.create({
  root: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    minHeight: 550,
    minWidth: 300,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 4
  },

  testHeader: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 'bold'
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

  testSection: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 12
  },

  separator: {
    marginHorizontal: 8,
    width: 2
  },

  noTest: {
    alignSelf: 'center',
    fontSize: 14
  }
});

export const stackStyle: IStackProps['style'] = {
  borderWidth: 1,
  borderColor: '#bdbdbd',
  paddingVertical: 8,
  paddingHorizontal: 12,
  margin: 8
};

export const separatorStackStyle: IStackProps['style'] = {
  height: 200,
  flexDirection: 'row',
  justifyContent: 'space-evenly'
};
