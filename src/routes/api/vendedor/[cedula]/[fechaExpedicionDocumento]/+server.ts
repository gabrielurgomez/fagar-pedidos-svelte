import type { RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { json } from '@sveltejs/kit';
import { nombresCookies } from '$lib/constants/cookie.constant';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ params, cookies }) => {
	try {
		const cedula = params.cedula;
		const fechaExpedicionDocumento = params.fechaExpedicionDocumento;

		if (!cedula) {
			return json({ message: 'No se recibio la clave cedula' }, { status: 400 });
		}
		if (!fechaExpedicionDocumento) {
			return json({ message: 'No se recibio la clave fechaExpedicionDocumento' }, { status: 400 });
		}

		//primero elimino la cookie por si hay una sesión anterior
		cookies.delete(nombresCookies.datosUsuarioLogueado, {
			path: '/',
		});

		const vendedor = await prisma.vendedores.findUnique({
			where: {
				cedula: cedula,
				fechaExpedicionDocumento: new Date(fechaExpedicionDocumento).toISOString(),
			},
		});
		if (vendedor) {
			//antes de retornar el 200, se plasma la cookie para que el FE sepa que el usuario está logueado
			cookies.set(
				nombresCookies.datosUsuarioLogueado,
				JSON.stringify({
					cedula: vendedor.cedula,
					fechaExpedicionDocumento: vendedor.fechaExpedicionDocumento,
				}),
				{
					path: '/',
					maxAge: 60 * 60 * 24 * 30, //30 días
				},
			);

			return json({ vendedor: vendedor }, { status: 200 });
		} else {
			return json(
				{
					message: `No se encontró el vendedor con cedula ${cedula} y fecha de expedición ${fechaExpedicionDocumento}`,
				},
				{ status: 404 },
			);
		}
	} catch (e) {
		console.error(e);
		return json(
			{
				message: e,
			},
			{ status: 500 },
		);
	}
};
