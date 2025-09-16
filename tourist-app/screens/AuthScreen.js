import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Button, Card, TextInput, Text, HelperText } from 'react-native-paper';

export default function AuthScreen() {
    // This state controls which view is shown: 'login', 'signUp', or 'forgotPassword'
    const [authView, setAuthView] = useState('login');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    };

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', "Passwords do not match.");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Success', 'Please check your email for a confirmation link!');
        setLoading(false);
    };

    const handlePasswordReset = async () => {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Success', 'Password reset link sent! Please check your email.');
        setLoading(false);
    };

    // Renders the Login form
    const renderLoginView = () => (
        <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>Log in</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>Enter your email and password to securely access your account.</Text>
            <TextInput label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="email" />} />
            <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="lock" />} right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />} />
            <Button mode="text" onPress={() => setAuthView('forgotPassword')} style={styles.forgotPasswordButton}>Forgot Password</Button>
            <Button mode="contained" onPress={handleSignIn} loading={loading} disabled={loading} style={styles.button}>Login</Button>
            <View style={styles.switchView}>
                <Text>Don't have an account? </Text>
                <Button mode="text" onPress={() => setAuthView('signUp')}>Sign Up here</Button>
            </View>
        </Card.Content>
    );

    // Renders the Sign Up form
    const renderSignUpView = () => (
        <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>Create a new account to get started.</Text>
            <TextInput label="Name" value={name} onChangeText={setName} autoCapitalize="words" style={styles.input} left={<TextInput.Icon icon="account" />} />
            <TextInput label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="email" />} />
            <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry={!passwordVisible} autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="lock" />} right={<TextInput.Icon icon={passwordVisible ? "eye-off" : "eye"} onPress={() => setPasswordVisible(!passwordVisible)} />} />
            <TextInput label="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!passwordVisible} autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="lock-check" />} />
            <HelperText type="error" visible={password !== confirmPassword && confirmPassword.length > 0}>Passwords do not match!</HelperText>
            <Button mode="contained" onPress={handleSignUp} loading={loading} disabled={loading} style={styles.button}>Create Account</Button>
            <View style={styles.switchView}>
                <Text>Already have an account? </Text>
                <Button mode="text" onPress={() => setAuthView('login')}>Sign In here</Button>
            </View>
        </Card.Content>
    );

    // Renders the Forgot Password form
    const renderForgotPasswordView = () => (
        <Card.Content>
            <Button icon="arrow-left" mode="text" onPress={() => setAuthView('login')} style={styles.backButton}>Back to Login</Button>
            <Text variant="headlineMedium" style={styles.title}>Forgot Password</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>Enter your email to receive a reset link.</Text>
            <TextInput label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" style={styles.input} left={<TextInput.Icon icon="email" />} />
            <Button mode="contained" onPress={handlePasswordReset} loading={loading} disabled={loading} style={styles.button}>Send Reset Link</Button>
        </Card.Content>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card style={styles.card}>
                {authView === 'login' && renderLoginView()}
                {authView === 'signUp' && renderSignUpView()}
                {authView === 'forgotPassword' && renderForgotPasswordView()}
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f0f2f5' // A light grey background
    },
    card: {
        width: '100%',
        paddingVertical: 16,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 24,
        color: '#666'
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: 16,
        paddingVertical: 8,
        backgroundColor: '#2E8B57' // A shade of green, like the inspiration
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
    },
    switchView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    backButton: {
        alignSelf: 'flex-start',
        marginLeft: -8,
    }
});