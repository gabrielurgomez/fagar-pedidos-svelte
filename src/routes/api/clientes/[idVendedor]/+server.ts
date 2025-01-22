import { error } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ params }) => {
	try {
		const idVendedor = params.idVendedor;
		if (!idVendedor) {
			return new Response(JSON.stringify({ message: 'No se recibio la clave idVendedor' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		//console.log('idVendedor', idVendedor);

		const clientes = await prisma.clientes.findMany({
			include: {
				sedes: true,
			},
			where: {
				vendedores: {
					some: {
						idVendedor: parseInt(idVendedor),
						estado: 'ACTIVO',
					},
				},
			},
		});

		//console.log(`Clientes del vendedor de ID ${idVendedor}`, clientes);

		await prisma.$disconnect();
		if (clientes.length > 0) {
			return new Response(JSON.stringify(clientes), {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} else {
			return new Response('[]', {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	} catch (e) {
		console.error(e);
		throw error(500, 'Internal Server Error');
	}
};
