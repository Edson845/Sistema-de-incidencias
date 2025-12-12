import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, TextInput, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import client from '../api/client';
import { Ticket, TICKET_STATES } from '../types';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
    TicketList: undefined;
    TicketDetail: { idTicket: number };
    CreateTicket: undefined;
};

type TicketListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TicketList'>;

export default function TicketListScreen() {
    const { logout } = useContext(AuthContext);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');

    const navigation = useNavigation<TicketListScreenNavigationProp>();

    const fetchTickets = async () => {
        try {
            const response = await client.get('/tickets/mios');
            const sorted = response.data.sort((a: Ticket, b: Ticket) =>
                new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
            );
            setTickets(sorted);
            setFilteredTickets(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "Cerrar Sesión",
            "¿Estás seguro que deseas salir?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Salir", style: "destructive", onPress: logout }
            ]
        );
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Reload when screen is focused (e.g. coming back from create ticket)
    useFocusEffect(
        useCallback(() => {
            fetchTickets();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTickets();
    }, []);

    const handleSearch = (text: string) => {
        setSearch(text);
        if (!text) {
            setFilteredTickets(tickets);
            return;
        }
        const lower = text.toLowerCase();
        const filtered = tickets.filter(t =>
            t.tituloTicket.toLowerCase().includes(lower) ||
            t.descTicket.toLowerCase().includes(lower) ||
            t.nombreCategoria.toLowerCase().includes(lower)
        );
        setFilteredTickets(filtered);
    };

    const getStatusColor = (id: number) => {
        switch (id) {
            case 1: return '#1e3a8a'; // Nuevo
            case 2: return '#3b82f6'; // Abierto
            case 3: return '#d97706'; // Pendiente/Proceso (Yellow/Orange)
            case 4: return '#10b981'; // Resuelto
            case 5: return '#6b7280'; // Cerrado
            case 6: return '#851d1d'; // No procede
            case 7: return '#d97706'; // No resuelto
            default: return '#6b7280';
        }
    };

    const renderItem = ({ item }: { item: Ticket }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TicketDetail', { idTicket: item.idTicket })}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.ticketId}>#{item.idTicket}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.idEstado) }]}>
                    <Text style={styles.badgeText}>{item.nombreEstado || TICKET_STATES[item.idEstado as keyof typeof TICKET_STATES]}</Text>
                </View>
            </View>

            <Text style={styles.title} numberOfLines={1}>{item.tituloTicket}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.descTicket}</Text>

            <View style={styles.footer}>
                <Text style={styles.category}>{item.nombreCategoria}</Text>
                <Text style={styles.date}>{format(new Date(item.fechaCreacion), 'dd/MM/yy HH:mm')}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestión de Tickets</Text>
                <TouchableOpacity onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar tickets..."
                    value={search}
                    onChangeText={handleSearch}
                    placeholderTextColor="#6b7280"
                />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#0a3a6b" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredTickets}
                    renderItem={renderItem}
                    keyExtractor={item => item.idTicket.toString()}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>No hay tickets encontrados</Text>}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateTicket')}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        paddingBottom: 10,
        backgroundColor: '#0a3a6b',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchContainer: {
        padding: 16,
        paddingTop: 5,
        backgroundColor: '#0a3a6b',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    searchInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    list: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    ticketId: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 8,
    },
    category: {
        fontSize: 12,
        color: '#1e40af',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    date: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#6b7280',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#0a3a6b',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        color: 'white',
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: -4,
    }
});
