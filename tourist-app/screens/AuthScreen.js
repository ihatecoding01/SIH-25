import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, Button } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        // Use try...catch for better error details
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error; // This will be caught by the catch block

        } catch (error) {
            // Log the entire error object
            console.error("Authentication error:", error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function signUpWithEmail() {
        setLoading(true);
        // Use try...catch for better error details
        try {
            const { error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) throw error; // This will be caught by the catch block

        } catch (error) {
            // Log the entire error object
            console.error("Authentication error:", error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Tourist Safety App</Text>
            <Text style={styles.description}>Sign in or create an account.</Text>
            <TextInput
                style={styles.input}
                label="Email"
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="email@address.com"
                autoCapitalize={'none'}
            />
            <TextInput
                style={styles.input}
                label="Password"
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="Password"
                autoCapitalize={'none'}
            />
            <View style={styles.buttonContainer}>
                <Button
                    title={loading ? 'Loading...' : 'Sign In'}
                    onPress={signInWithEmail}
                    disabled={loading}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    title={loading ? 'Loading...' : 'Sign Up'}
                    onPress={signUpWithEmail}
                    disabled={loading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        textAlign: 'center',
        marginBottom: 20,
        color: 'gray',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonContainer: {
        marginTop: 10,
    },
});