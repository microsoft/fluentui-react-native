import { StyleSheet } from 'react-native';
import { IStackProps } from '@fluentui-react-native/stack';

export const commonTestStyles = StyleSheet.create({
  root: {
    marginTop: 16,
    marginRight: 32,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  header: {
    marginVertical: 6,
    fontSize: 16,
  },
  section: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B6A0B',
    marginTop: 12,
  },
  separatorStack: {
    height: 200,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  settings: {
    flexGrow: 1,
  },
  vmargin: {
    marginVertical: 6,
  },
  stack: {
    borderWidth: 2,
    borderColor: '#bdbdbd',
    padding: 12,
    margin: 8,
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBox: {
    borderWidth: 1,
    height: 25,
    fontSize: 12,
    width: 150,
    marginBottom: 8,
    paddingVertical: 0,
  },
  view: {
    minHeight: 200,
    justifyContent: 'space-between',
  },
});

export const fluentTesterStyles = StyleSheet.create({
  testRoot: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    minHeight: 550,
    minWidth: 300,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 4,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  testHeader: {
    marginBottom: 8,
    marginTop: 4,
  },

  testList: {
    minWidth: 160,
    flexShrink: 0,
    flexGrow: 0,
    flexDirection: 'row',
  },

  testListContainerStyle: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  testListItem: {
    width: 150,
  },

  testSection: {
    flexGrow: 1,
  },

  noTest: {
    alignSelf: 'center',
    fontSize: 18,
  },
});

export const stackStyle: IStackProps['style'] = {
  borderWidth: 1,
  borderColor: '#bdbdbd',
  paddingVertical: 8,
  paddingHorizontal: 12,
  margin: 8,
};

export const separatorStackStyle: IStackProps['style'] = {
  height: 200,
  flexDirection: 'row',
  justifyContent: 'space-evenly',
};

export const mobileStyles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  testList: {
    width: '100%',
  },
  testListItem: {
    width: '100%',
    height: 'auto',
    fontSize: 18,
    paddingVertical: 8,
  },
  testSection: {
    width: '100%',
  },
});
