import type { vendedores, detalleClientesVendedores } from '@prisma/client';

export type Vendedor = vendedores;
export type ClienteVendedor = detalleClientesVendedores;
export type VendedorSeleccionado = Pick<vendedores, 'id' | 'nombre'>;
