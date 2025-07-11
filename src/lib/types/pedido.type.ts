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
	| 'porcentajeDescuento'
	| 'estado'
	| 'detalleAbonosId'
> & {
	fechaEntrega: Date | null;
};

//Al editar no se permite cambiar fechaEntrega ni el cliente, pero si la sede
//por eso se omite idCliente pero no se omite clienteSedeCiudad y clienteSedeDireccion
export type PedidoEditar = Omit<
	Pedido,
	| 'idPedidoPendiente'
	| 'idCliente'
	| 'idVendedor'
	| 'fechaEntrega'
	| 'creado'
	| 'motivoRechazo'
	| 'fechaCreado'
	| 'porcentajeIVA'
	| 'detallePedido'
	| 'porcentajeDescuento'
	| 'estado'
	| 'detalleAbonosId'
>;

export type FinalidadesPedido = 'COTIZACION' | 'PROFORMA';
