import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//const consultarVendedorSQL = 'SELECT * FROM `vendedores` WHERE numeroDocumento = ? AND fechaExpedicionDocumento = ?';
export const GET: RequestHandler = async ({ url }) => {
    try {
        const cedula = url.searchParams.get('cedula');

        if (!cedula || cedula === '') {
            return new Response('[]', {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        //console.log('cedula recibida', cedula)

        /*const [vendedor] = await pool.query(consultarVendedorSQL, ['1098685807', '1990-04-24']);
        console.log('vendedor', vendedor);*/

        const fechaExpedicionDocumento = new Date('1990-04-24').toISOString();

        const vendedor = await prisma.vendedores.findUnique({
            where: { cedula: cedula, fechaExpedicionDocumento: fechaExpedicionDocumento }
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