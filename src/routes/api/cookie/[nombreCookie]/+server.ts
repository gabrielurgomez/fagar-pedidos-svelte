import { error } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params, cookies }) => {
	try {
		const nombreCookie = params.nombreCookie;

		if (!nombreCookie) {
			return new Response(JSON.stringify({ message: 'No se recibio la clave nombreCookie' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		//obtengo la cookie a eliminar
		const cookieAEliminar = cookies.get(nombreCookie);

		//si la cookie no existe, envio un 200 pues es como si se hubiese eliminado
		if (!cookieAEliminar) {
			return new Response(JSON.stringify({ message: '' }), {
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		cookies.delete(nombreCookie, {
			path: '/',
		});

		return new Response(JSON.stringify({ message: '' }), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	} catch (e) {
		console.error(e);
		throw error(500, 'Internal Server Error');
	}
};
