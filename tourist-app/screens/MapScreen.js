import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Alert, ActivityIndicator, Text, SafeAreaView } from 'react-native';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import MapView, { Marker, Polygon, Polyline } from 'react-native-maps';
import { Card, Button, Avatar, Title, Paragraph } from 'react-native-paper';

// --- Mock Data (Replace with real data from your backend later) ---
const MOCK_SAFETY_SCORE = 85; // Example safety score
const MOCK_HIGH_RISK_ZONE = [ // A polygon for a high-risk area
  { latitude: 19.078, longitude: 72.878 },
  { latitude: 19.080, longitude: 72.882 },
  { latitude: 19.075, longitude: 72.885 },
  { latitude: 19.073, longitude: 72.880 },
];
const MOCK_ITINERARY = [ // A polyline for the user's planned route
  { latitude: 19.0760, longitude: 72.8777 }, // Starting point (e.g., hotel)
  { latitude: 19.079, longitude: 72.879 },
  { latitude: 19.072, longitude: 72.883 },
  { latitude: 19.068, longitude: 72.875 }, // Ending point (e.g., tourist spot)
];
// --- End of Mock Data ---


export default function MapScreen({ session }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null); // Reference to the map to control it

  // --- Core Functions ---

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
    // This effect handles location tracking
    let subscription = null;
    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is crucial for safety features.');
        setLoading(false);
        return;
      }

      let initialLocation = await Location.getCurrentPositionAsync({});
      setLocation(initialLocation.coords);
      setLoading(false);

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 5000, distanceInterval: 10 },
        (newLocation) => {
          setLocation(newLocation.coords);
          // [Supabase upsert logic remains the same]
        }
      );
    };

    startLocationTracking();

    return () => {
      if (subscription) subscription.remove();
    };
  }, [session]);


  // --- UI Components ---

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2E8B57" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02, // Zoom level
          longitudeDelta: 0.02,
        } : null}
        showsUserLocation={true} // Use the default blue dot for the user's location
        provider="google" // Use Google Maps for better rendering
      >
        {/* Itinerary Polyline */}
        <Polyline
          coordinates={MOCK_ITINERARY}
          strokeColor="#007BFF" // Blue
          strokeWidth={4}
        />
        {/* High-Risk Zone Polygon */}
        <Polygon
          coordinates={MOCK_HIGH_RISK_ZONE}
          strokeColor="rgba(255, 0, 0, 0.5)" // Red border
          fillColor="rgba(255, 0, 0, 0.2)" // Transparent red fill
        />
      </MapView>

      {/* Safety Score Card (Top Overlay) */}
      <Card style={styles.safetyCard}>
        <Card.Content style={styles.cardContent}>
          <View>
            <Title style={styles.cardTitle}>Safety Score</Title>
            <Paragraph style={styles.scoreText}>{MOCK_SAFETY_SCORE}/100</Paragraph>
          </View>
          <Avatar.Icon size={48} icon="shield-check" style={styles.shieldIcon} />
        </Card.Content>
      </Card>

      {/* Panic Button (Bottom Overlay) */}
      <View style={styles.panicButtonContainer}>
        <Button
          icon="alert-octagon"
          mode="contained"
          onPress={handlePanic}
          labelStyle={styles.panicButtonText}
          style={styles.panicButton}
        >
          PANIC
        </Button>
      </View>
    </SafeAreaView>
  );
}


// --- Stylesheet ---

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
  // Safety Score Card Styles
  safetyCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 15,
    elevation: 8, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#333'
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E8B57' // Green color for a good score
  },
  shieldIcon: {
    backgroundColor: '#2E8B57'
  },
  // Panic Button Styles
  panicButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: '15%',
    right: '15%',
  },
  panicButton: {
    borderRadius: 30,
    paddingVertical: 12,
    backgroundColor: '#D32F2F', // A strong red color
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  panicButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});