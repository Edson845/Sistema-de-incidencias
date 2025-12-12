import { io, Socket } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const BASE_URL = 'http://192.168.100.51:3000'; // Same IP as client.ts

// Configure local notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

class WebSocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) return;

        this.socket = io(BASE_URL, {
            extraHeaders: {
                Authorization: `Bearer ${token}`
            },
            auth: {
                token: token
            }
        });

        this.socket.on('connect', () => {
            console.log('Socket Connected:', this.socket?.id);
        });

        this.socket.on('connect_error', (err) => {
            console.log('Socket Connection Error:', err);
        });

        this.setupListeners();
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    private setupListeners() {
        if (!this.socket) return;

        // Listener: Nuevo Ticket (For Admins)
        this.socket.on('nuevo-ticket', (data: any) => {
            // Logic to filter if user is admin is better handled here if we had user context,
            // OR backend only sends to admin room. 
            // Assuming backend broadcasts to all, we might need to filter.
            // But 'nuevo-ticket' might be interesting for everyone or just admins.
            this.scheduleNotification('Nuevo Ticket', `Se ha creado el ticket #${data.idTicket}: ${data.tituloTicket}`);
        });

        // Listener: Ticket Actualizado
        this.socket.on('ticket-actualizado', (data: any) => {
            this.scheduleNotification('Actualización de Ticket', `El ticket #${data.idTicket} ha sido actualizado.`);
        });

        // Listener: Asignacion (often part of ticket-actualizado or separate)
        // Backend `asignarTicketConHerramientasService` emits `ticket-actualizado`.
    }

    async scheduleNotification(title: string, body: string) {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: 'default',
            },
            trigger: null, // Immediate
        });
    }
}

export default new WebSocketService();
