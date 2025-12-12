import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import client from '../api/client';
import { useNavigation } from '@react-navigation/native';

export default function CreateTicketScreen() {

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categorias, setCategorias] = useState<any[]>([]);
    const [categoriaId, setCategoriaId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        client.get('/tickets/categorias')
            .then(res => setCategorias(res.data))
            .catch(console.error)
            .finally(() => setFetching(false));
    }, []);

    const handleSubmit = async () => {
        if (!titulo || !descripcion || !categoriaId) {
            Alert.alert('Error', 'Por favor complete todos los campos');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('descripcion', descripcion);
            formData.append('idCategoria', categoriaId.toString());

            await client.post('/tickets', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            Alert.alert('Éxito', 'Ticket creado correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error("Error al crear ticket:", error);
            Alert.alert('Error', 'No se pudo crear el ticket.');
        } finally {
            setLoading(false);
        }
    };


    if (fetching) return <View style={styles.center}><ActivityIndicator color="#0a3a6b" /></View>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Título</Text>
            <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
                placeholder="Resumen del problema"
                placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Descripción</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={descripcion}
                onChangeText={setDescripcion}
                multiline
                numberOfLines={4}
                placeholder="Detalles detallados de la incidencia"
                placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Categoría</Text>
            <View style={styles.catContainer}>
                {categorias.map(c => (
                    <TouchableOpacity
                        key={c.idCategoria || c.id_categoria}
                        style={[styles.catButton, categoriaId === (c.idCategoria || c.id_categoria) && styles.catSelected]}
                        onPress={() => setCategoriaId(c.idCategoria || c.id_categoria)}
                    >
                        <Text style={[styles.catText, categoriaId === (c.idCategoria || c.id_categoria) && styles.catTextSelected]}>
                            {c.nombreCategoria || c.nombre_categoria}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear Ticket</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 24, backgroundColor: '#f8f9fa', flexGrow: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#374151' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', padding: 14, borderRadius: 8, marginBottom: 20, fontSize: 16 },
    textArea: { height: 120, textAlignVertical: 'top' },
    button: { backgroundColor: '#0a3a6b', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 2 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    catContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24, gap: 8 },
    catButton: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: '#0a3a6b', borderRadius: 20 },
    catSelected: { backgroundColor: '#0a3a6b' },
    catText: { color: '#0a3a6b', fontWeight: '500' },
    catTextSelected: { color: '#fff' }
});
