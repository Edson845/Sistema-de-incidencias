import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import client from '../api/client';
import { Ticket, TICKET_STATES } from '../types';
import { format } from 'date-fns';

type ParamList = {
    TicketDetail: { idTicket: number };
};

export default function TicketDetailScreen() {
    const route = useRoute<RouteProp<ParamList, 'TicketDetail'>>();
    const { idTicket } = route.params;
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await client.get(`/tickets/${idTicket}`);
                // Verify structure, API usually returns object for detail
                setTicket(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [idTicket]);

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0a3a6b" /></View>;
    if (!ticket) return <View style={styles.center}><Text>Ticket no encontrado</Text></View>;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{ticket.tituloTicket}</Text>
                <View style={[styles.badge,
                {
                    backgroundColor: ticket.idEstado === 1 ? '#1e3a8a' :
                        ticket.idEstado === 4 ? '#10b981' : '#3b82f6'
                }
                ]}>
                    <Text style={styles.badgeText}>{TICKET_STATES[ticket.idEstado as keyof typeof TICKET_STATES] || ticket.nombreEstado}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.value}>{ticket.descTicket}</Text>
            </View>

            <View style={styles.grid}>
                <View style={styles.gridItem}>
                    <Text style={styles.label}>Categoría</Text>
                    <Text style={styles.value}>{ticket.nombreCategoria}</Text>
                </View>
                <View style={styles.gridItem}>
                    <Text style={styles.label}>Prioridad</Text>
                    <Text style={styles.value}>{ticket.nombrePrioridad}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Técnico Asignado</Text>
                <Text style={styles.value}>{ticket.nombreTecnico ? `${ticket.nombreTecnico} ${ticket.apellidoTecnico || ''}` : 'Sin asignar'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Fecha Creación</Text>
                <Text style={styles.value}>{format(new Date(ticket.fechaCreacion), 'dd/MM/yyyy HH:mm')}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 24, borderBottomWidth: 1, borderColor: '#f3f4f6', paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
    section: { marginBottom: 20 },
    label: { fontSize: 13, color: '#6b7280', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' },
    value: { fontSize: 16, color: '#111827', lineHeight: 24 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    gridItem: { width: '48%' }
});
