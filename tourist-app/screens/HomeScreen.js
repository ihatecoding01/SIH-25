import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Button, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';

export default function HomeScreen({ session }) {

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

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.emailText}>{session?.user?.email}</Text>

      <View style={styles.panicButtonContainer}>
        <Button title="PANIC" color="white" onPress={handlePanic} />
      </View>

      <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  panicButtonContainer: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 10,
    marginVertical: 20,
    width: '80%',
  },
});