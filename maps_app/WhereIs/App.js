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
  Button,
  Alert,
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
    this._displaySavedLocations = this._displaySavedLocations.bind(this);
    this._savedButtonPressed = this._savedButtonPressed.bind(this);

    this.state = {
      searchBar: false,
      m_pos: {
        latitude: 37.421998,
        longitude: -122.084,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      },
      locations: [],
      isSaved: false,
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
      return (state.searchBar = !state.searchBar);
    });
  }

  _displaySearchBar() {
    if (this.state.searchBar) {
      return (
        <View>
          <TouchableOpacity
            onPress={() => this._onPressButton()}
            style={styles.DropDown}>
            <Text style={{color: 'white'}}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this._onPressButton()}
            style={styles.DropDown}>
            <Text style={{color: 'white'}}>About</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return null;
    }
  }

  _displaySavedLocations() {
    if (this.state.isSaved) {
      return this.state.locations.map((element, index) => {return(
          <View style={{borderColor:'black', borderWidth: 1}}>
            <Button title={"Location "+ (index+1)}/>
          </View>
      )});

    }
    else {
      return (
        <View style={{alignSelf: 'center', paddingTop: 100}}>
          <Text style={{fontSize: 20}}> No Saved Location </Text>
        </View>
      );
    }
  }
  /*
  this.state.m_pos.latitude = parseFloat(position.coords.latitude);
  this.state.m_pos.longitude = parseFloat(position.coords.longitude);
   */
  _changeRegion() {
    Geolocation.getCurrentPosition(
      position => {
        this.setState(state => {
          return ({m_pos: {
              latitude: parseFloat(position.coords.latitude),
              longitude: parseFloat(position.coords.longitude),
              latitudeDelta: 0.00922,
              longitudeDelta: 0.00421,
            }});
        });
      },
      err => {
        console.log(err);
      },
      {enableHighAccuracy: true, timeout: 2000, maximumAge: 3600000},
    );
  }

  _savedButtonPressed() {
    Alert.alert(
      'Save Current Location?',
      '',
      [
        {text: 'No'},
        {
          Text: 'Yes',
          onPress: () => {
            this.state.locations.push([
              this.state.m_pos.latitude,
              this.state.m_pos.longitude,
            ]);
            this.state.isSaved = true;
          },
        },
      ],
      {cancelable: false},
    );
    console.log(this.state.locations);
  }
  /*
  https://maps.googleapis.com/maps/api/directions/json?
      origin=Toronto&destination=Montreal
  &key=YOUR_API_KEY
  */
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
          onRegionChange={this._changeRegion()}>
          <Marker
            coordinate={{latitude: 37.421998, longitude: -122.084}}
            title="myLoc"
            description="this is my loc"
          />
        </MapView>
        <Button
          onPress={() => this._savedButtonPressed()}
          title="Save Current Location"
        />
        <ScrollView style={{flex: 0.4}}>
          {this._displaySavedLocations()}
        </ScrollView>
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
    flex: 1,
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
