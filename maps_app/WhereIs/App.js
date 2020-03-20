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
  PermissionsAndroid,
} from 'react-native';

import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

export default class App extends Component {
  constructor(props) {
    super(props);
    this._onPressButton = this._onPressButton.bind(this);
    this._displaySearchBar = this._displaySearchBar.bind(this);
    this.requestPermission = this.requestPermission.bind(this);
    this._changeRegion = this._changeRegion.bind(this);
    this.state = {
      searchBar: false,
      m_pos: {
        latitude: 37.421998,
        longitude: -122.084,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      },
    };
  }

  async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'press ok to grant permission',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('yes1');
        return true;
      } else {
        console.log('no1');
        return false;
      }
    } catch (err) {
      console.warn(err);
    }
  }

  componentDidMount() {
    var m_permission;

    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ).then(res => {
      if (res) {
        console.log('yes');
        m_permission = true;
      } else {
        console.log('no');
        m_permission = false;
      }
    });

    if (!m_permission) {
      this.requestPermission();
    }
  }

  _onPressButton() {
    this.setState(state => {
      return (state.searchBar = !this.state.searchBar);
    });
  }

  _displaySearchBar() {
    if (this.state.searchBar) {
      return (
        <View>
          <TouchableOpacity style={styles.DropDown}>
            <Text style={{color: 'white'}}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.DropDown}>
            <Text style={{color: 'white'}}>About</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  }

  _changeRegion() {
    Geolocation.getCurrentPosition(
      position => {
        this.setState(state => {
          state.m_pos.longitude = parseFloat(position.coords.longitude);
          state.m_pos.latitude = parseFloat(position.coords.latitude);
        });
      },
      err => {
        console.log(err);
      },
      {enableHighAccuracy: true, timeout: 2000, maximumAge: 3600000},
    );
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
          region={this.state.m_pos}
          onRegionChange={this._changeRegion()}
        >
          <Marker coordinate={{latitude: 37.421998, longitude: -122.084}} title='myLoc' description='this is my loc'/>
        </MapView>
        <View style={{position: 'absolute'}}>
          <TouchableOpacity
            onPress={() => this._onPressButton()}
            style={styles.Button}>
            <Image
              source={require('./Asset/button.png')}
              style={styles.Image}
            />
          </TouchableOpacity>
          {this._displaySearchBar()}
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
    backgroundColor: 'black',
  },
  Button: {
    alignItems: 'center',
  },
  Image: {
    width: 30,
    height: 25,
  },
  DropDown: {
    backgroundColor: 'black',
    borderColor: 'white',
  },
});
