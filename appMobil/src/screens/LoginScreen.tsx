import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const logo = require('../../assets/logo_01.png');

export default function LoginScreen() {
    const [identificador, setIdentificador] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!identificador || !password) {
            Alert.alert('Error', 'Por favor ingresa todos los campos');
            return;
        }
        setLoading(true);
        try {
            await login(identificador, password);
        } catch (e) {
            Alert.alert('Error', 'Credenciales incorrectas o error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Image source={logo} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.title}>Sistema de Incidencias</Text>
                        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
                    </View>

                    <View style={styles.form}>
                        <Text style={styles.label}>Usuario / Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingrese su identificador"
                            value={identificador}
                            onChangeText={setIdentificador}
                            autoCapitalize="none"
                            placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="******"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            placeholderTextColor="#9ca3af"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>INGRESAR</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0a3a6b', // Brand Blue
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    form: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 14,
        marginBottom: 20,
        fontSize: 16,
        color: '#1f2937',
    },
    button: {
        backgroundColor: '#0a3a6b',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#1e3a8a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    }
});
