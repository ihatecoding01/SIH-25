// ProfileScreen.js
import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Alert,
    Clipboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Mock user data - in a real app, this would come from your API
const mockUser = {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    passport_no: 'B87654321',
    blockchain_hash: '9720dfa2190e9d919baa5e831b4faefb93ce34e22d20049f9606766887405623',
    avatar_url: `https://i.pravatar.cc/150?u=jane.smith@example.com`,
};

const ProfileScreen = () => {
    const [language, setLanguage] = useState('English');

    const handleCopyHash = () => {
        Clipboard.setString(mockUser.blockchain_hash);
        Alert.alert('Copied!', 'Blockchain ID has been copied to your clipboard.');
    };

    const handlePanicButton = () => {
        Alert.alert(
            'Panic Alert',
            'Are you sure you want to send a distress signal to the authorities?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes, I am in Danger', onPress: () => console.log('Panic signal sent!'), style: 'destructive' },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', onPress: () => console.log('User logged out!') },
        ]);
    };

    const truncateHash = (hash) => {
        return `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Image source={{ uri: mockUser.avatar_url }} style={styles.avatar} />
                    <Text style={styles.nameText}>{mockUser.name}</Text>
                    <Text style={styles.emailText}>{mockUser.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Details</Text>
                    <View style={styles.row}>
                        <Feather name="shield" size={20} color="#555" />
                        <Text style={styles.rowLabel}>Passport No.</Text>
                        <Text style={styles.rowValue}>B87...321</Text>
                    </View>
                    <TouchableOpacity style={styles.row} onPress={handleCopyHash}>
                        <Feather name="hash" size={20} color="#555" />
                        <Text style={styles.rowLabel}>Blockchain ID</Text>
                        <Text style={styles.rowValue}>{truncateHash(mockUser.blockchain_hash)}</Text>
                        <Feather name="copy" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Settings</Text>
                    <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Language settings are not implemented yet.')}>
                        <Feather name="globe" size={20} color="#555" />
                        <Text style={styles.rowLabel}>Language</Text>
                        <Text style={styles.rowValue}>{language}</Text>
                        <Feather name="chevron-right" size={20} color="#AAA" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.panicButton} onPress={handlePanicButton}>
                    <Feather name="alert-triangle" size={24} color="#FFFFFF" />
                    <Text style={styles.panicButtonText}>PANIC BUTTON</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Feather name="log-out" size={20} color="#FF3B30" />
                    <Text style={styles.logoutButtonText}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    emailText: {
        fontSize: 16,
        color: '#888',
        marginTop: 4,
    },
    section: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#888',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EFEFEF',
    },
    rowLabel: {
        fontSize: 18,
        color: '#333',
        marginLeft: 15,
        flex: 1,
    },
    rowValue: {
        fontSize: 16,
        color: '#555',
        marginRight: 10,
    },
    panicButton: {
        backgroundColor: '#FF3B30', // A strong red color
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 12,
        margin: 20,
        marginTop: 30,
        // Shadow for iOS
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        // Shadow for Android
        elevation: 8,
    },
    panicButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        marginHorizontal: 20,
    },
    logoutButtonText: {
        color: '#FF3B30',
        fontSize: 18,
        marginLeft: 10,
    },
});

export default ProfileScreen;


