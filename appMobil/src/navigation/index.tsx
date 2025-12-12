import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import TicketListScreen from '../screens/TicketListScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import CreateTicketScreen from '../screens/CreateTicketScreen';

export type RootStackParamList = {
    Login: undefined;
    TicketList: undefined;
    TicketDetail: { idTicket: number };
    CreateTicket: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
}

function MainStack() {
    return (
        <Stack.Navigator screenOptions={{
            headerStyle: { backgroundColor: '#0a3a6b' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' }
        }}>
            <Stack.Screen name="TicketList" component={TicketListScreen} options={{ headerShown: false }} />
            <Stack.Screen name="TicketDetail" component={TicketDetailScreen} options={{ title: 'Detalle del Ticket' }} />
            <Stack.Screen name="CreateTicket" component={CreateTicketScreen} options={{ title: 'Nuevo Ticket' }} />
        </Stack.Navigator>
    );
}

const AppNavigatorContent = () => {
    const { user, isLoading } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0a3a6b" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            {user ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

export default function AppNavigator() {
    return (
        <AuthProvider>
            <AppNavigatorContent />
        </AuthProvider>
    );
}
