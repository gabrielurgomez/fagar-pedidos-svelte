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

export const FinalidadesPedido = {
	cotizacion: 'COTIZACION',
	proforma: 'PROFORMA',
};
