import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen({ session }) {
    return (
        <View style={styles.container}>
            <Text style={styles.emailText}>{session?.user?.email}</Text>
            <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emailText: { fontSize: 16, marginBottom: 20 }
});