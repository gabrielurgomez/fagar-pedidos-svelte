import type { vendedores, detalleClientesVendedores } from '@prisma/client';

export type Vendedor = vendedores;
export type VendedorLogueado = Pick<Vendedor, 'id' | 'nombre'>;
export type ClienteVendedor = detalleClientesVendedores;
export type VendedorSeleccionado = Pick<vendedores, 'id' | 'nombre'>;
