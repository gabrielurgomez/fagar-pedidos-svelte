import type { pedidos, detallePedido } from '@prisma/client';

export type Pedido = pedidos & {
	detallePedido: detallePedido[];
};

export type DetallePedido = detallePedido;

//El id no lo necesito, es autoincremental, el idPedido Prisma lo crea automaticamente
export type detallePedidoCrear = Omit<DetallePedido, 'id' | 'idPedido'>;

export type PedidoCrear = Omit<
	Pedido,
	| 'id'
	| 'idPedidoPendiente'
	| 'fechaEntrega'
	| 'creado'
	| 'motivoRechazo'
	| 'fechaCreado'
	| 'porcentajeIVA'
	| 'detallePedido'
> & {
	fechaEntrega: Date | null;
};

export type FinalidadesPedido = 'COTIZACION' | 'PROFORMA';
export type FinalidadesPedidoConSeleccione = 'SELECCIONE' | FinalidadesPedido;
