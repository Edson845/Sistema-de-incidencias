import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import client from '../api/client';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (identificador: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            const storedToken = await SecureStore.getItemAsync('token');
            if (storedToken) {
                setToken(storedToken);
                const decoded: any = jwtDecode(storedToken);
                // Map decoded token to User interface
                const userInfo: User = {
                    nombre: decoded.nombre || decoded.username || 'Usuario',
                    email: decoded.email || '',
                    rol: decoded.rol || decoded.role || 'Empleado',
                    // Spread other potential fields
                    ...decoded
                };
                setUser(userInfo);
            }
        } catch (e) {
            console.log('Login check failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (identificador: string, password: string) => {
        try {
            const response = await client.post('/auth/login', { identificador, password });
            const { token } = response.data;

            await SecureStore.setItemAsync('token', token);
            setToken(token);
            const decoded: any = jwtDecode(token);
            const userInfo: User = {
                nombre: decoded.nombre || decoded.username || 'Usuario',
                email: decoded.email || '',
                rol: decoded.rol || decoded.role || 'Empleado',
                ...decoded
            };
            setUser(userInfo);
        } catch (error) {
            console.error("Login Error", error);
            throw error; // Re-throw to be handled by UI
        }
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
