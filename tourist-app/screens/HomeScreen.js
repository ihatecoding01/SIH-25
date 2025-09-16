import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
  ImageBackground,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ session }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // MOVED: handlePanic is now defined directly in the component scope
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
    let subscription = null; // Variable to hold our location listener

    const startLocationTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is needed to ensure your safety.');
        return;
      }

      // Store the subscription so we can remove it later
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 20,
        },
        (location) => {
          console.log('New location:', location.coords);
          const { latitude, longitude } = location.coords;

          if (session?.user) {
            supabase
              .from('locations')
              .upsert({
                user_id: session.user.id,
                latitude,
                longitude,
                updated_at: new Date(),
              }, {
                onConflict: 'user_id',
              })
              .then(({ error }) => {
                if (error) console.error('Error updating location:', error.message);
              });
          }
        }
      );
    };

    startLocationTracking();

    // Cleanup function: This runs when the component is unmounted (e.g., user logs out)
    return () => {
      if (subscription) {
        subscription.remove(); // Stop the location listener
      }
    };
  }, [session]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <LinearGradient
      colors={['#87CEEB', '#98FB98', '#90EE90']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />


        {/* Header Section */}
        <View style={styles.headerCard}>
          <View style={styles.profileSection}>
            <View style={styles.profileImage}>
              <Ionicons name="person" size={24} color="#666" />
            </View>
            <View style={styles.greetingSection}>
              <Text style={styles.greetingText}>Namaste, Anya!</Text>
              <Text style={styles.locationText}>Exploring Assam</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.miniPanicButton} onPress={handlePanic}>
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Safe Zone Indicator */}
        <View style={styles.safeZoneContainer}>
          <View style={styles.semicircle}>
            <Text style={styles.safeZoneText}>You are in a{'\n'}Safe Zone</Text>
          </View>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="location" size={24} color="#007AFF" />
            <Text style={styles.actionText}>Share Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="calendar" size={24} color="#34C759" />
            <Text style={styles.actionText}>View Itinerary</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="call" size={24} color="#FF9500" />
            <Text style={styles.actionText}>Local Emergency</Text>
          </TouchableOpacity>
        </View>

        {/* Main Panic Button */}
        <TouchableOpacity style={styles.panicButton} onPress={handlePanic}>
          <View style={styles.panicIcon}>
            <Ionicons name="add" size={24} color="white" />
          </View>
          <Text style={styles.panicText}>PANIC BUTTON</Text>
        </TouchableOpacity>

        

        {/* Footer Text */}
        <Text style={styles.footerText}>आपनो सस्या साह, निसंत्त याया गुत्गार्डे !</Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  timeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    marginLeft: 8,
  },
  headerCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  greetingSection: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  miniPanicButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeZoneContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  semicircle: {
    width: width * 0.8,
    height: width * 0.4,
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: width * 0.4,
    borderTopRightRadius: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  safeZoneText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  panicButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 30,
  },
  panicIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  panicText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'left',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
});