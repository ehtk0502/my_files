import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';

import MapView from 'react-native-maps';

export default class App extends Component {
  constructor(props) {
    super(props);
    this._onPressButton = this._onPressButton.bind(this);
  }

  _onPressButton() {
    alert('You tapped the button!');
  }
  render() {
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
        <View style={{position: 'absolute'}}>
          <TouchableOpacity
            onPress={() => this._onPressButton()}
            style={styles.Button}>
            <Image
              source={require('./Asset/button.png')}
              style={styles.Image}
            />
          </TouchableOpacity>
          <View className="dropDown">
              <TouchableOpacity style={styles.DropDown}>
                  <Text style={{color:'white'}}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.DropDown}>
                  <Text style={{color:'white'}}>About</Text>
              </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }
}

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
  Button: {
    alignItems: 'center',
  },
  Image: {
    width: 30,
    height: 30,
  },
  DropDown:{
      alignItems: 'center',
      backgroundColor: 'black',
      borderColor: 'white',
      padding:10,
      marginTop : 2.5,
  }
});
