/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import MapView from 'react-native-maps';

const App: () => React$Node = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.Menu}>
        <Text style={styles.Logo}> WhereIs </Text>
      </View>
      <MapView
        style={styles.Map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  Map: {
    flex: 0.5,
  },
  Logo: {
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'white',
  },
  Menu: {
    flex: 0.05,
    backgroundColor: 'black',
  },
});

export default App;
