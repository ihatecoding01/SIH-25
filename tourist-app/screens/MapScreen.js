import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button, Alert, ActivityIndicator, Text } from 'react-native';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

export default function MapScreen({ session }) {
  const [location, setLocation] = useState(null); // State to hold current location
  const [loading, setLoading] = useState(true);

  const handlePanic = async () => {
    if (!session?.user) return;

    Alert.alert(
      "Confirm Panic",
      "Are you sure you want to send a distress signal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, I'm in Danger",
          onPress: async () => {
            console.log("Panic signal sent!");
            const { error } = await supabase
              .from('locations')
              .update({ is_panic: true })
              .eq('user_id', session.user.id);

            if (error) {
              Alert.alert('Error', 'Could not send panic signal. Please try again.');
              console.error('Panic error:', error.message);
            } else {
              Alert.alert('Signal Sent', 'Your distress signal has been sent to the nearest authorities.');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  useEffect(() => {
    let subscription = null;

    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed for safety features.');
        setLoading(false);
        return;
      }

      // Get initial location to center the map
      let initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation.coords);
      setLoading(false);

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 20 },
        (newLocation) => {
          setLocation(newLocation.coords); // Update marker position on map
          // ... [Supabase upsert logic remains the same]
        }
      );
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [session]);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        } : null}
        showsUserLocation
        followsUserLocation
      >
        {location && <Marker coordinate={location} title="Your Location" />}
      </MapView>
      <View style={styles.panicButtonContainer}>
        <Button title="PANIC" color="white" onPress={handlePanic} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  panicButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: '10%',
    right: '10%',
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 10,
    
  },
});