export interface User {
    id?: number;
    idUsuario?: number; // Backend might send id or idUsuario
    nombre: string;
    apellido?: string;
    email: string;
    rol: string;
    // Add other fields if present in decoded token
    username?: string;
    role?: string;
    dni?: string;
}

export interface Ticket {
    idTicket: number;
    tituloTicket: string;
    descTicket: string;
    idEstado: number;
    nombreEstado?: string; // Derived or from API
    idPrioridad: number;
    nombrePrioridad: string;
    idCategoria?: number;
    nombreCategoria: string;
    fechaCreacion: string;
    asignadoA?: string | null;
    nombreTecnico?: string;
    apellidoTecnico?: string;
    usuarioCrea?: string;
    nombreUsuario?: string;
    apellidoUsuario?: string;
    adjunto?: string; // File URL or path
}

export const TICKET_STATES = {
    1: 'Nuevo',
    2: 'Abierto',
    3: 'Pendiente', // 'Proceso' in some places, 'Pendiente' in HTML
    4: 'Resuelto',
    5: 'Cerrado',
    6: 'No procede',
    7: 'No resuelto'
};

export const TICKET_PRIORITIES = {
    1: 'Muy Baja',
    2: 'Baja',
    3: 'Media',
    4: 'Alta',
    5: 'Muy Alta'
};
