import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// CHANGE THIS to your machine's IP if running on a physical device.
// For Android Emulator, 10.0.2.2 points to the host machine's localhost.
const BASE_URL = 'http://192.168.100.51:3000/api';

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.error('Error attaching token:', error);
    }
    return config;
});

export default client;
