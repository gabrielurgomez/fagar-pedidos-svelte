import { PrismaClient } from '@prisma/client';
import { error } from '@sveltejs/kit';
import { type RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { formatearFechaISO8601aYYYYMMDD } from '$lib/utils/fechas';
import type { PedidoConDetalle } from '$lib/types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ url }) => {
	try {
		const finalidad = url.searchParams.get('finalidad');
		if (!finalidad) {
			return json({ status: 400, message: 'No se recibio la clave finalidad en el servidor' });
		}

		const buscarpor = url.searchParams.get('buscarpor');
		if (!buscarpor) {
			return json({ status: 400, message: 'No se recibio la clave buscarpor en el servidor' });
		}

		const limiteregistros = url.searchParams.get('limiteregistros');
		if (!limiteregistros) {
			return json({
				status: 400,
				message: 'No se recibio la clave limiteregistros en el servidor',
			});
		}
		if (isNaN(parseInt(limiteregistros))) {
			return json({ status: 400, message: 'El valor de limiteregistros no es un numero' });
		}

		const ordenadopor = url.searchParams.get('ordenadopor');
		if (!ordenadopor) {
			return json({ status: 400, message: 'No se recibio la clave ordenadopor en el servidor' });
		}

		const condicionordenado = url.searchParams.get('condicionordenado');
		if (!condicionordenado) {
			return json({
				status: 400,
				message: 'No se recibio la clave condicionordenado en el servidor',
			});
		}

		const idVendedor = url.searchParams.get('idvendedor');
		if (!idVendedor) {
			return json({
				status: 400,
				message:
					'No se recibio la clave idvendedor en el servidor para buscar los pedidos recientes',
			});
		}
		if (isNaN(parseInt(idVendedor))) {
			return json({ status: 400, message: 'El valor de idVendedor no es un numero' });
		}

		let pedidos: PedidoConDetalle[] = [];

		switch (finalidad) {
			case 'recientes': {
				pedidos = await prisma.pedidos.findMany({
					take: parseInt(limiteregistros),
					orderBy: {
						id: 'desc',
					},
					include: {
						detallePedido: true,
						vendedor: false,
					},
					where: {
						idVendedor: parseInt(idVendedor),
					},
				});
				break;
			}
		}

		if (pedidos.length > 0) {
			let pedidosFechasFormateadas = pedidos.map((p: PedidoConDetalle) => {
				return {
					...p,
					fechaEntrega: formatearFechaISO8601aYYYYMMDD(p.fechaEntrega),
					creado: formatearFechaISO8601aYYYYMMDD(p.creado),
				};
			});

			console.log('pedidosFechasFormateadas', pedidosFechasFormateadas);

			return new Response(JSON.stringify(pedidosFechasFormateadas), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		} else {
			return json({ status: 404, message: 'No se encontraron pedidos' });
		}
	} catch (e) {
		console.error(e);
		throw error(500, 'Internal Server Error');
	}
};
