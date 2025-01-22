import type { clientes, detalleClientesSedes, detalleClientesVendedores } from '@prisma/client';

export type Cliente = clientes & {
	sedes: detalleClientesSedes[];
	vendedores: detalleClientesVendedores[];
};
export type ClienteSede = detalleClientesSedes;
export type VendedorDetalleCliente = detalleClientesVendedores;
