import client from '../api/client';

export const TicketsService = {
    obtenerMisTickets: async () => {
        const response = await client.get('/tickets/mios');
        return response.data;
    },
    getTicket: async (id: number) => {
        const response = await client.get(`/tickets/${id}`);
        return response.data;
    },
    obtenerCategorias: async () => {
        const response = await client.get('/tickets/categorias');
        return response.data;
    },
    crearTicket: async (formData: FormData) => {
        const response = await client.post('/tickets', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    actualizarEstado: async (idTicket: number, estado: number) => {
        const response = await client.put(`/tickets/${idTicket}`, { estado });
        return response.data;
    },
    marcarNoResuelto: async (idTicket: number, formData: FormData) => {
        const response = await client.put(`/tickets/${idTicket}/no-resuelto`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    calificarTicket: async (idTicket: number, formData: FormData) => {
        const response = await client.post(`/tickets/calificar/${idTicket}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    agregarObservacionTecnico: async (idTicket: number, formData: FormData) => {
        const response = await client.post(`/tickets/observacion/${idTicket}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};
