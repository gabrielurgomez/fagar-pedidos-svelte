import { nombresCookies } from '$lib/constants/cookie.constant';
import { PrismaClient } from '@prisma/client';
import type { VendedorLogueado } from '$lib/types/vendedor.type';

const prisma = new PrismaClient();

export const load = async ({ cookies }) => {
	let vendedorLogueado: VendedorLogueado | null = null;
	let numeroCedulaVendedor = '';
	let fechaExpedicionDocumentoVendedor = '';

	//se lee la cookie datosUsuarioLogueado, si esta esta plasmada quiere decir que la sesion ya fue abierta alguna vez
	//simplemente se hace para recordar el numero de cedula y la fecha de expedicion del documento
	//de todas maneras en el frontend se valida de nuevo el usuario
	const cookieDatosUsuarioLogueado = cookies.get(nombresCookies.datosUsuarioLogueado);

	if (cookieDatosUsuarioLogueado) {
		const datosUsuarioLogueadoObj = JSON.parse(cookieDatosUsuarioLogueado);

		numeroCedulaVendedor = datosUsuarioLogueadoObj.cedula;
		fechaExpedicionDocumentoVendedor =
			datosUsuarioLogueadoObj.fechaExpedicionDocumento.split('T')[0];
	}

	return {
		numeroCedulaVendedor,
		fechaExpedicionDocumentoVendedor,
	};
};
