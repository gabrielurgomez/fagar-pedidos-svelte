//import { error } from '@sveltejs/kit';
import { type RequestHandler } from '@sveltejs/kit';

import { PrismaClient } from '@prisma/client';
import { obtenerFechaYHoraActual, formearFechaISO8601 } from '$lib/server/fechas';
import { transporterSistemas } from '$lib/server/nodemailer';

//recordar que estos datos de producto no estan la bd de admon2 si no en admon,
//por eso ese type no está en prisma
type ProductoEnPedido = { id: number; nombre: string; cantidad: number, cantidadEnvases: number, valor: number };


const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
    try {

        const { fechaHoraActualISO8601 } = obtenerFechaYHoraActual();
        //console.log('fechaHoraActualISO8601', fechaHoraActualISO8601);

        const { idCliente, clienteSedeCiudad, clienteSedeDireccion, idVendedor, fechaEntrega, comentario, productos, nombreVendedor } = await request.json();

        if (!idCliente || idCliente === 0) {
            return new Response(JSON.stringify({ error: 'No se recibio la clave idCliente' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (!clienteSedeCiudad || clienteSedeCiudad === '') {
            return new Response(JSON.stringify({ error: 'No se recibio la clave clienteSedeCiudad' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (!clienteSedeDireccion || clienteSedeDireccion === '') {
            return new Response(JSON.stringify({ error: 'No se recibio la clave clienteSedeDireccion' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

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
                idCliente: idCliente,
                clienteSedeCiudad: clienteSedeCiudad,
                clienteSedeDireccion: clienteSedeDireccion,
                idVendedor: idVendedor,
                fechaEntrega: formearFechaISO8601(fechaEntrega),
                creado: fechaHoraActualISO8601,
                estado: 'creado',
                comentario: comentario,
            }
        });

        //se crean los productos en la tabla detallePedido
        const productosGuardados = await Promise.all(productos.map(async (p: ProductoEnPedido) => {
            const nuevoDetallePedido = await prisma.detallePedido.create({
                data: {
                    idPedido: nuevoPedido.id,
                    idProducto: p.id,
                    nombreProducto: p.nombre,
                    cantidadEnvases: p.cantidadEnvases,
                    cantidad: p.cantidad,
                    valor: p.valor
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

        //se envia correo notificando
        let cuerpoHtml = "<b>Se notifica nuevo pedido</b><br>";
        cuerpoHtml += `<br>`;
        cuerpoHtml += `<b>Vendedor</b>: ${nombreVendedor}<br>`;
        cuerpoHtml += `<b>Fecha de entrega:</b> ${fechaEntrega}<br>`;
        cuerpoHtml += `<b>Comentario:</b> ${comentario}<br>`;
        cuerpoHtml += `<b>Cantidad de productos:</b> ${productos.length}<br>`;
        cuerpoHtml += `<br>`;
        cuerpoHtml += `<div>Para mas detalles, inicie sesión en la aplicacion pedidos.fagarcomercial.com</div>`;

        //se notifica por correo electronico a la empresa
        try {
            await transporterSistemas.sendMail({
                from: "sistemas@fagarcomercial.com",
                to: 'info@colsysnet.com',
                replyTo: "sistemas@fagarcomercial.com",
                subject: `PEDIDOS - Nuevo pedido ID #${nuevoPedido.id}`,
                html: cuerpoHtml
            });
            //console.log('envio', envio)
        } catch (e) {
            console.log('e', e)
            return new Response(JSON.stringify({ message: `El pedido se creó pero no se pudo notificar por correo electronico a la empresa, favor avisar de este error, pedido creado con ID:${nuevoPedido.id}` }), {
                status: 201,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        return new Response(JSON.stringify({ message: `Pedido creado con ID ${nuevoPedido.id}` }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (e) {
        console.error(e);
        if (e instanceof Error && 'response' in e) {
            return new Response(JSON.stringify(e.response), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            return new Response(JSON.stringify({ error: 'Error desconocido' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    }
};