import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ params }) => {

    try {
        const cedula = params.cedula;
        const fechaExpedicionDocumento = params.fechaExpedicionDocumento;        

        if (!cedula) {
            return new Response(JSON.stringify({ message: 'No se recibio la clave cedula' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        if (!fechaExpedicionDocumento) {
            return new Response(JSON.stringify({ message: 'No se recibio la clave fechaExpedicionDocumento' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        const vendedor = await prisma.vendedores.findUnique({
            where: { cedula: cedula, fechaExpedicionDocumento: new Date(fechaExpedicionDocumento).toISOString() }
        })
        if (vendedor) {
            return new Response(JSON.stringify(vendedor), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            return new Response('[]', {
                status: 404,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (e) {
        console.error(e);
        throw error(500, 'Internal Server Error');
    }
};