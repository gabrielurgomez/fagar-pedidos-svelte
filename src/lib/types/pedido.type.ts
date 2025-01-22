import type { pedidos, detallePedido } from '@prisma/client';

export type PedidoConDetalle = pedidos & {
	detallePedido: detallePedido[];
};
