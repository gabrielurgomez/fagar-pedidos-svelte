//import { error } from '@sveltejs/kit';
import { type RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { obtenerFechaYHoraActual, formetearFechaToISO8601 } from '$lib/utils/fechas';
import { transporterSistemas } from '$lib/server/nodemailer';
import { env } from '$env/dynamic/private';
import type { ProductoEnPedido } from '$lib/types/producto.type';
import { EstadosPedido, TiposProductos } from '$lib/constants/pedido.constant';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { timeStampActual_UTCMinus5_ObjJS, fechaHoraActualISO8601_UTC } =
			obtenerFechaYHoraActual();

		const {
			idCliente,
			clienteSedeCiudad,
			clienteSedeDireccion,
			idVendedor,
			fechaEntrega,
			finalidad,
			comentario,
			productos,
		} = await request.json();

		if (!idCliente) {
			return new Response(JSON.stringify({ error: 'No se recibio la clave idCliente' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		if (!clienteSedeCiudad) {
			return new Response(JSON.stringify({ error: 'No se recibio la clave clienteSedeCiudad' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		if (!clienteSedeDireccion) {
			return new Response(
				JSON.stringify({ error: 'No se recibio la clave clienteSedeDireccion' }),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		}

		if (!idVendedor) {
			return new Response(JSON.stringify({ error: 'No se recibio la clave idVendedor' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		if (!fechaEntrega) {
			return new Response(JSON.stringify({ error: 'No se recibio la clave fechaEntrega' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		if (!finalidad) {
			return new Response(JSON.stringify({ error: 'No se recibio la clave finalidad' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		if (productos.length === 0) {
			return new Response(JSON.stringify({ error: 'No se recibieron productos' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		//valido que a ningun producto le falte la cantidad, o que si el producto es distinto de tipo externo tenga el tipoAceite
		productos.forEach((p: ProductoEnPedido) => {
			if (!p.cantidad) {
				return new Response(
					JSON.stringify({ error: 'Uno de los productos no tienen la cantidad' }),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
						},
					},
				);
			}
			if (p.tipo !== TiposProductos.externo && !p.tipoAceite) {
				return new Response(
					JSON.stringify({ error: 'Uno de los productos no tienen el tipoAceite' }),
					{
						status: 400,
						headers: {
							'Content-Type': 'application/json',
						},
					},
				);
			}
		});

		/*creandolo con una sola query, primero el pedido y luego los productos*/
		const nuevoPedido = await prisma.pedidos.create({
			data: {
				idCliente: idCliente,
				clienteSedeCiudad: clienteSedeCiudad,
				clienteSedeDireccion: clienteSedeDireccion,
				idVendedor: idVendedor,
				fechaEntrega: formetearFechaToISO8601(fechaEntrega),
				fechaCreado: timeStampActual_UTCMinus5_ObjJS,
				estado: EstadosPedido.creado,
				finalidad: finalidad,
				comentario: comentario,
				idPedidoPendiente: null, //un pedido recien creado no tiene un pedido pendiente derivado de el
				motivoRechazo: null,
				detallePedido: {
					create: productos.map((p: ProductoEnPedido) => ({
						idProducto: p.id,
						tipo: p.tipo,
						tipoAceite: p.tipoAceite,
						nombreProducto: p.nombre,
						pesoProducto: p.peso,
						cantidadEnvases: p.cantidadEnvases,
						cantidad: p.cantidad,
						valor: p.valor,
					})),
				},
				creado: fechaHoraActualISO8601_UTC,
			},
		});
		if (nuevoPedido) {
			//se envia correo notificando

			//se busca el vendedor para poder obtener el nombre
			const vendedor = await prisma.vendedores.findUnique({
				where: {
					id: idVendedor,
				},
			});

			let cuerpoHtml = `<b>Se notifica nuevo pedido</b><br>;
			<br>
			<b>Vendedor</b>: ${vendedor ? vendedor.nombre : 'Vendedor no encontrado'}<br>
			<b>Fecha de entrega:</b> ${fechaEntrega}<br>
			<b>Comentario:</b> ${comentario ? comentario : 'Ninguno'}<br>
			<b>Cantidad de productos:</b> ${productos.length}<br>
			<br>`;

			//se notifica por correo electronico a la empresa
			try {
				await transporterSistemas.sendMail({
					from: 'sistemas@fagarcomercial.com',
					to: env.EMAIL_NOTIFICACION_PEDIDO,
					replyTo: 'sistemas@fagarcomercial.com',
					subject: `PEDIDOS - Nuevo pedido ID #${nuevoPedido.id}`,
					html: cuerpoHtml,
				});
			} catch (e) {
				return new Response(
					JSON.stringify({
						message: `El pedido se creó pero no se pudo notificar por correo electronico a la empresa, favor avisar de este error, pedido creado con ID:${nuevoPedido.id}`,
					}),
					{
						status: 201,
						headers: {
							'Content-Type': 'application/json',
						},
					},
				);
			}

			return new Response(JSON.stringify({ message: `Pedido creado con ID ${nuevoPedido.id}` }), {
				status: 201,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} else {
			return new Response(JSON.stringify({ error: 'No se pudo crear el pedido' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	} catch (e) {
		console.error(e);
		if (e instanceof Error && 'response' in e) {
			return new Response(JSON.stringify(e.response), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		} else {
			return new Response(JSON.stringify({ error: 'Error desconocido' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}
	}
};
