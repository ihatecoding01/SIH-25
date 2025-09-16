import 'react-native-url-polyfill/auto';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './lib/supabase';

import AuthScreen from './screens/AuthScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <NavigationContainer>
      {session && session.user ? (
        <Tab.Navigator>
          <Tab.Screen name="Home">
            {() => <ProfileScreen session={session} />}
          </Tab.Screen>
          <Tab.Screen name="Map">
            {() => <MapScreen session={session} />}
          </Tab.Screen>
          <Tab.Screen name="Profile">
            {() => <ProfileScreen session={session} />}
          </Tab.Screen>
        </Tab.Navigator>
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}