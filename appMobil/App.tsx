import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

export default function App() {
  useEffect(() => {
    (async () => {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        Alert.alert('Permiso requerido', 'Se necesitan permisos para mostrar notificaciones de tickets.');
      }
    })();
  }, []);

  return <AppNavigator />;
}
