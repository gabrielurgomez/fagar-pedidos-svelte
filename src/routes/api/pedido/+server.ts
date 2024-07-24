import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { obtenerFechaYHoraActual, formearFechaISO8601 } from '$lib/server/script';

//recordar que estos datos de producto no estan la bd de admon2 si no en admon,
//por eso ese type no está en prisma
type ProductoEnPedido = { id: number; nombre: string; cantidad: number };


const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
    try {

        const { fechaHoraActualISO8601 } = obtenerFechaYHoraActual();
        console.log('fechaHoraActualISO8601', fechaHoraActualISO8601);

        const { idVendedor, fechaEntrega, comentario, productos } = await request.json();

        if (!idVendedor || idVendedor === 0) {
            return new Response(JSON.stringify({ error: 'No se recibio la clave idVendedor' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (!fechaEntrega || fechaEntrega === '') {
            return new Response(JSON.stringify({ error: 'No se recibio la clave fechaEntrega' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (productos.length === 0) {
            return new Response(JSON.stringify({ error: 'No se recibieron productos' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }


        const nuevoPedido = await prisma.pedidos.create({
            data: {
                idVendedor: idVendedor,
                fechaEntrega: formearFechaISO8601(fechaEntrega),
                creado: fechaHoraActualISO8601,
                comentario: comentario,
            }
        });

        //se crean los productos en la tabla detallePedido
        const productosGuardados = await Promise.all(productos.map(async (p: ProductoEnPedido) => {
            const nuevoDetallePedido = await prisma.detallePedido.create({
                data: {
                    idPedido: nuevoPedido.id,
                    idProducto: p.id,
                    cantidad: p.cantidad
                }
            });

            return nuevoDetallePedido;
        }));


        if (productosGuardados.length !== productos.length) {
            return new Response(JSON.stringify({ error: 'No se pudieron guardar todos los productos' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify(nuevoPedido), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (e) {
        console.error(e);
        throw error(500, 'Internal Server Error');
    }
};