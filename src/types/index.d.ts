interface Categoria {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    categoria_id: number;
    categoria?: string;
    activo: boolean;
}

interface DetallePedido {
    producto_id: number;
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    total: number;
}

interface Pedido {
    id: number;
    tipo: 'cocina' | 'cafe';
    estado: 'pendiente' | 'en_preparacion' | 'listo' | 'cancelado';
    productos: DetallePedido[];
    fecha: Date;
    total: number; 
    descuento?: number;
    mesa?: string;
    cliente?: string;
    usuario_id?: number;
    historial?: PedidoEstadoHistorial[];
}

interface PedidoEstadoHistorial {
    id: number;
    pedido_id: number;
    estado: string;
    fecha: Date;
    usuario_id?: number;
}

interface Usuario {
    id: number;
    nombre: string;
    usuario: string;
    rol: 'caja' | 'cocina' | 'barista' | 'admin';
}

interface ReporteDiario {
    fecha: Date;
    totalVentas: number;
    totalPedidos: number;
    detalles: Pedido[];
}

