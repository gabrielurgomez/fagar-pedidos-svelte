import { nombresCookies } from '$lib/constants/cookie.constant';

export const load = async ({ cookies }) => {
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
