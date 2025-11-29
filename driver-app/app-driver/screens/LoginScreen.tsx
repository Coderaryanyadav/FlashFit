import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('driver@test.com');
    const [password, setPassword] = useState('password');

    const handleLogin = async () => {
        try {
            // Stub login for now
            // await signInWithEmailAndPassword(auth, email, password);
            navigation.replace('Home');
        } catch (error) {
            console.error(error);
            alert('Login failed');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Driver Login</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center' },
    content: { padding: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 16, borderRadius: 8, marginBottom: 16, fontSize: 16 },
    button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
