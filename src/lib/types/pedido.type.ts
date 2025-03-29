import type { pedidos, detallePedido } from '@prisma/client';

export type Pedido = pedidos;
export type PedidoConDetalleFormulario = Omit<
	Pedido,
	'idPedidoPendiente' | 'fechaEntrega' | 'fechaCreado' | 'creado'
> & {
	fechaEntrega: Date | null;
	fechaCreado: Date | null;
	detallePedido: detallePedido[];
};
