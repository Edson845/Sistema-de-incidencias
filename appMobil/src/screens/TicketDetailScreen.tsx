import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { TicketsService } from '../services/tickets.service';
import { Ticket, TICKET_STATES, User } from '../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

type ParamList = {
    TicketDetail: { idTicket: number };
};

export default function TicketDetailScreen() {
    const route = useRoute<RouteProp<ParamList, 'TicketDetail'>>();
    const { idTicket } = route.params;
    const { user } = useContext(AuthContext);
    const navigation = useNavigation();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);

    // Modal controls
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'resolver' | 'no-resuelto' | 'calificar' | 'asignar' | null>(null);
    const [observacion, setObservacion] = useState('');
    const [calificacion, setCalificacion] = useState(5);
    const [adjunto, setAdjunto] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Admin Assignment State
    const [tecnicos, setTecnicos] = useState<User[]>([]);
    const [selectedTecnico, setSelectedTecnico] = useState<number | null>(null);

    const loadTicket = async () => {
        try {
            setLoading(true);
            const data = await TicketsService.getTicket(idTicket);
            setTicket(data);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo cargar el ticket");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [idTicket]);

    // Load technicians if admin opens assignment modal
    const loadTecnicos = async () => {
        try {
            const data = await TicketsService.obtenerTecnicos();
            setTecnicos(data);
        } catch (error) {
            console.error("Error loading technicians", error);
            Alert.alert("Error", "No se pudieron cargar los técnicos");
        }
    };

    const handleEstadoChange = async (nuevoEstado: number) => {
        try {
            await TicketsService.actualizarEstado(idTicket, nuevoEstado);
            Alert.alert("Éxito", "Estado actualizado correctamente");
            loadTicket();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo cambiar el estado");
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAdjunto(result.assets[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const submitAction = async () => {
        setActionLoading(true);
        try {
            const formData = new FormData();

            if (modalType === 'resolver') {
                if (!observacion.trim()) { Alert.alert("Error", "Observación requerida"); setActionLoading(false); return; }
                formData.append('observacionTecnico', observacion);
                if (adjunto) {
                    const file = { uri: adjunto.uri, name: adjunto.name, type: adjunto.mimeType || 'application/octet-stream' } as any;
                    formData.append('adjunto', file);
                }
                await TicketsService.agregarObservacionTecnico(idTicket, formData);
                Alert.alert("Éxito", "Ticket resuelto");

            } else if (modalType === 'no-resuelto') {
                if (!observacion.trim()) { Alert.alert("Error", "Observación requerida"); setActionLoading(false); return; }
                if (!adjunto) { Alert.alert("Error", "Adjunto requerido"); setActionLoading(false); return; }
                formData.append('observacion', observacion);
                const file = { uri: adjunto.uri, name: adjunto.name, type: adjunto.mimeType || 'application/octet-stream' } as any;
                formData.append('archivo', file);
                await TicketsService.marcarNoResuelto(idTicket, formData);
                Alert.alert("Éxito", "Marcado como no resuelto");

            } else if (modalType === 'calificar') {
                formData.append('rol', 'usuario');
                formData.append('calificacion', calificacion.toString());
                formData.append('comentario', observacion || 'Sin comentario');
                // En routes: router.post('/calificar/:idTicket', upload.array('fotos', 5), calificarTicket);
                // Si hay adjunto...
                if (adjunto) {
                    // TODO: Support attachment for calibration if needed
                }
                await TicketsService.calificarTicket(idTicket, formData);
                Alert.alert("Éxito", "Ticket calificado y cerrado");

            } else if (modalType === 'asignar') {
                if (!selectedTecnico) { Alert.alert("Error", "Seleccione un técnico"); setActionLoading(false); return; }
                await TicketsService.asignarTicket(idTicket, selectedTecnico);
                Alert.alert("Éxito", "Ticket asignado correctamente");
            }

            setModalVisible(false);
            setObservacion('');
            setAdjunto(null);
            setSelectedTecnico(null);
            loadTicket();
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Ocurrió un error al procesar la acción");
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = async (type: 'resolver' | 'no-resuelto' | 'calificar' | 'asignar') => {
        setModalType(type);
        setObservacion('');
        setAdjunto(null);
        setSelectedTecnico(null);
        if (type === 'asignar') {
            await loadTecnicos();
        }
        setModalVisible(true);
    };

    const renderActionButtons = () => {
        if (!ticket || !user) return null;
        const rol = String(user.rol || '').toLowerCase();
        const estado = ticket.idEstado;

        // Admin Assignment Button
        if (rol === 'admin' && (estado === 1 || estado === 2 || estado === 3)) {
            // Show 'Asignar' button always or just for unassigned/reassignable?
            // Assuming Admin can always re-assign if not closed.
            return (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6366f1', marginBottom: 15 }]} onPress={() => openModal('asignar')}>
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text style={styles.actionBtnText}>Asignar Técnico</Text>
                </TouchableOpacity>
            );
        }

        if (rol === 'tecnico' || rol === 'admin') {
            if (estado === 2) { // Abierto
                return (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleEstadoChange(3)}>
                        <Ionicons name="play-circle" size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Empezar a Trabajar</Text>
                    </TouchableOpacity>
                );
            }
            if (estado === 3) { // En Proceso
                return (
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: '#10b981' }]} onPress={() => openModal('resolver')}>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.actionBtnText}>Resolver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: '#ef4444' }]} onPress={() => openModal('no-resuelto')}>
                            <Ionicons name="close-circle" size={20} color="#fff" />
                            <Text style={styles.actionBtnText}>No Resuelto</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
        }

        if (rol === 'usuario') {
            if (estado === 4) { // Resuelto
                return (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f59e0b' }]} onPress={() => openModal('calificar')}>
                        <Ionicons name="star" size={20} color="#fff" />
                        <Text style={styles.actionBtnText}>Calificar y Cerrar</Text>
                    </TouchableOpacity>
                );
            }
        }

        return null;
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#0a3a6b" /></View>;
    if (!ticket) return <View style={styles.center}><Text>Ticket no encontrado</Text></View>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{ticket.tituloTicket}</Text>
                <View style={[styles.badge, { backgroundColor: ticket.idEstado === 4 ? '#10b981' : '#3b82f6' }]}>
                    <Text style={styles.badgeText}>{ticket.nombreEstado}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.value}>{ticket.descTicket}</Text>
            </View>

            {/* Render Attachments if any */}
            {ticket.adjunto && (
                <View style={styles.section}>
                    <Text style={styles.label}>Adjuntos</Text>
                    <Text style={styles.value}>{ticket.adjunto}</Text>
                    {/* TODO: Add logic to download/view attachment if needed */}
                </View>
            )}

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

            <View style={{ marginTop: 20 }}>
                {renderActionButtons()}
            </View>

            {/* ACTION MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {modalType === 'resolver' ? 'Resolver Ticket' :
                                modalType === 'no-resuelto' ? 'Marcar No Resuelto' :
                                    modalType === 'asignar' ? 'Asignar Técnico' : 'Calificar Atención'}
                        </Text>

                        {modalType === 'asignar' ? (
                            <ScrollView style={{ maxHeight: 300, marginBottom: 20 }}>
                                {tecnicos.map(tec => (
                                    <TouchableOpacity
                                        key={tec.idUsuario || tec.dni} // Fallback to whatever ID is available
                                        style={[styles.techItem, selectedTecnico === (tec.idUsuario || tec.id) && styles.techItemActive]}
                                        onPress={() => setSelectedTecnico(tec.idUsuario || tec.id as number)}
                                    >
                                        <Ionicons
                                            name={selectedTecnico === (tec.idUsuario || tec.id) ? "radio-button-on" : "radio-button-off"}
                                            size={20}
                                            color={selectedTecnico === (tec.idUsuario || tec.id) ? "#0a3a6b" : "#6b7280"}
                                        />
                                        <Text style={styles.techName}>{tec.nombre} {tec.apellido || ''}</Text>
                                    </TouchableOpacity>
                                ))}
                                {tecnicos.length === 0 && <Text>Cargando técnicos...</Text>}
                            </ScrollView>
                        ) : (
                            <>
                                {modalType === 'calificar' ? (
                                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <TouchableOpacity key={star} onPress={() => setCalificacion(star)}>
                                                <Ionicons name={star <= calificacion ? "star" : "star-outline"} size={32} color="#f59e0b" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : null}

                                <Text style={styles.label}>
                                    {modalType === 'calificar' ? 'Comentario (Opcional)' : 'Observación / Motivo'}
                                </Text>
                                <TextInput
                                    style={styles.textArea}
                                    multiline
                                    numberOfLines={4}
                                    value={observacion}
                                    onChangeText={setObservacion}
                                    placeholder="Escriba los detalles..."
                                />

                                {/* File Attachment for Actions */}
                                <TouchableOpacity style={styles.fileButton} onPress={pickDocument}>
                                    <Ionicons name="attach" size={20} color="#0a3a6b" />
                                    <Text style={styles.fileButtonText}>
                                        {adjunto ? adjunto.name : (modalType === 'no-resuelto' ? "Adjuntar Evidencia (Requerido)" : "Adjuntar Archivo (Opcional)")}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#9ca3af' }]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#0a3a6b' }]} onPress={submitAction} disabled={actionLoading}>
                                {actionLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Confirmar</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#fff', padding: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 24, borderBottomWidth: 1, borderColor: '#f3f4f6', paddingBottom: 16 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
    badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' },
    section: { marginBottom: 20 },
    label: { fontSize: 13, color: '#6b7280', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase' },
    value: { fontSize: 16, color: '#111827', lineHeight: 24 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    gridItem: { width: '48%' },
    actionBtn: { flexDirection: 'row', backgroundColor: '#0a3a6b', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    actionBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#111827' },
    textArea: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, height: 100, textAlignVertical: 'top', marginBottom: 15 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: 'bold' },
    fileButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: '#0a3a6b', borderStyle: 'dashed', borderRadius: 8, marginBottom: 15, justifyContent: 'center', backgroundColor: '#eef2ff' },
    fileButtonText: { marginLeft: 8, color: '#0a3a6b', fontWeight: '500' },
    techItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    techItemActive: { backgroundColor: '#eef2ff' },
    techName: { marginLeft: 10, fontSize: 16, color: '#374151' }
});
