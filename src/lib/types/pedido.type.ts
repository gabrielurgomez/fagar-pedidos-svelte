import type { pedidos, detallePedido } from '@prisma/client';

export type Pedido = pedidos & {
	detallePedido: detallePedido[];
};

export type PedidoConDetalleFormulario = Omit<
	Pedido,
	'id' | 'idPedidoPendiente' | 'fechaEntrega' | 'fechaCreado' | 'creado' | 'motivoRechazo'
> & {
	fechaEntrega: Date | null;
	fechaCreado: Date | null;
	detallePedido: detallePedido[];
};

export type FinalidadesPedido = 'COTIZACION' | 'PROFORMA';
export type FinalidadesPedidoConSeleccione = 'SELECCIONE' | FinalidadesPedido;
