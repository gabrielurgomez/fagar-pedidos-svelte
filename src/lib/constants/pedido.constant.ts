import type { FinalidadesPedido } from '$lib/types/pedido.type';

export enum EstadosPedido {
	creado = 'CREADO',
	aprobado = 'APROBADO',
	rechazado = 'RECHAZADO',
	pendiente = 'PENDIENTE',
}

export enum Tabs {
	consultar = 'consultar',
	crearCargue = 'crearCargue',
	generarPendientes = 'generarPendientes',
}

export enum TiposProductos {
	principal = 'PRINCIPAL',
	externo = 'EXTERNO',
}

export const PORCENTAJE_IVA = 19;

export const LIMITEULTIMOSPEDIDOS = 300;

export enum FinalidadesPedidoEnum {
	cotizacion = 'COTIZACION',
	proforma = 'PROFORMA',
}

// export const finalidadesPedido: Record<keyof typeof FinalidadesPedidoEnum, FinalidadesPedido> = {
// 	cotizacion: FinalidadesPedidoEnum.cotizacion,
// 	proforma: FinalidadesPedidoEnum.proforma,
// };

export const arrayFinalidadesPedido: FinalidadesPedido[] = [
	FinalidadesPedidoEnum.cotizacion,
	FinalidadesPedidoEnum.proforma,
];

// export const FinalidadesPedido = {
// 	cotizacion: 'COTIZACION',
// 	proforma: 'PROFORMA',
// };
