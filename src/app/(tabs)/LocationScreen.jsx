import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useGlobalContext } from '../GlobalContext'; // Update the path accordingly
import colors from '../../constants/colors';

const HomeScreen = () => {
  const { globalState, updateGlobalState, updateConnectedState } = useGlobalContext();
  const [location, setLocation] = useState(globalState.location);
  const [secondLocation] = useState(globalState.secondLocation); // secondLocation is no longer updated
  const [showingSecondLocation, setShowingSecondLocation] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const mapRef = useRef(null);

  useEffect(() => {
    const getPermissions = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert("Permission required", "Please grant location permissions to use this feature.");
          setLoading(false);  // Stop loading if permissions are denied
          return;
        }

        const updateLocation = async () => {
          try {
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);

            // Update global state only with the current location
            updateConnectedState({ secondLocation: currentLocation })
            updateGlobalState({ location: currentLocation });
          } catch (error) {
            console.log("Error fetching location:", error);
          } finally {
            setLoading(false);  // Ensure loading stops even in case of an error
          }
        };

        // Update location once initially
        updateLocation();

        // Set up interval to update location periodically (e.g., every 10 seconds)
        const locationInterval = setInterval(updateLocation, 10000);

        // Cleanup on component unmount
        return () => clearInterval(locationInterval);

      } catch (error) {
        console.log("Error requesting location permissions:", error);
        setLoading(false); // Ensure loading stops if there's an error requesting permissions
      }
    };

    getPermissions();
  }, []);

  const handleLocationToggle = () => {
    if (secondLocation) {
      const newLocation = showingSecondLocation ? location : secondLocation;
      mapRef.current.animateToRegion({
        latitude: newLocation.coords.latitude,
        longitude: newLocation.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setShowingSecondLocation(!showingSecondLocation);
    }
  };

  return (
    <View style={styles.externalContainer}>
      <View style={styles.innerContainer}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          showsUserLocation={true}
          showsMyLocationButton={false}
          initialRegion={{
            latitude: location?.coords.latitude || 37.78825,
            longitude: location?.coords.longitude || -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Second Location Marker with custom user-like appearance */}
          {globalState.secondLocation && (
            <Marker
              key={`${globalState.secondLocation.coords.latitude}-${globalState.secondLocation.coords.longitude}`}
              coordinate={{
                latitude: globalState.secondLocation.coords.latitude,
                longitude: globalState.secondLocation.coords.longitude,
              }}
            >
              <View style={styles.customMarker}>
                <View>
                  <View style={styles.dot} />
                  <View style={styles.pulse} />
                </View>
              </View>
            </Marker>
          )}
        </MapView>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLocationToggle}
          disabled={loading} // Disable button when loading
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              {showingSecondLocation ? "Go to Your Location" : "Go to His Location"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  externalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#313131',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'black',
  },
  innerContainer: {
    flexGrow: 1,
    backgroundColor: '#404040',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    left: 1,
    top: 1,
    width: 14,
    height: 14,
    backgroundColor: 'red',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
    zIndex: 2,
  },
  pulse: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00000015',
    zIndex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: '#404040',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default HomeScreen;
