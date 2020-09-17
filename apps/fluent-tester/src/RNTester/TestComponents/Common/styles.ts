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
    fontSize: 16
  },
  section: {
    fontSize: 20,
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
  },
  focusZoneStyle1: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: 10
  },
  focusZoneContainer: {
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    padding: 4,
  },
  focusZoneButton: {
    marginRight: 60,
    height: 50,
    width: 50,
  },
  focusZoneButton0: {
    height: 50,
    width: 50,
  },
  focusZoneButton2: {
    height: 75,
    width: 75,
  },
  focusZoneButton3: {
    marginTop: 6,
    height: 100,
    width: 100,
  },
  testView: {
    marginTop: 10
  }
});

export const fabricTesterStyles = StyleSheet.create({
  root: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
    minHeight: 550,
    minWidth: 300,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 4
  },

  testRoot: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'row',
    minHeight: 550,
    minWidth: 300,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: 4
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  pickerRoot: {
    flexDirection: 'row',
  },

  picker: {
    flexDirection: 'row',
    padding: 4
  },

  pickerLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: 'bold'
  },

  dropdown: {
    height: 30,
    width: 90,
    fontSize: 12,
  },

  testHeader: {
    marginBottom: 8,
    marginTop: 4,
    fontSize: 18,
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
    width: '85%'
  },

  noTest: {
    alignSelf: 'center',
    fontSize: 18
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

export const stackStyleFocusZone: IStackProps['style'] = {
  flexDirection: 'column',
  marginBottom: 40
};
