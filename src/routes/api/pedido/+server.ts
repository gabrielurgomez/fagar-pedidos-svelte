import { type RequestHandler } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { obtenerFechaYHoraActual, formetearFechaToISO8601 } from '$lib/utils/fechas';
import { transporterSistemas } from '$lib/server/nodemailer';
import { env } from '$env/dynamic/private';
import type { detallePedidoCrear } from '$lib/types/pedido.type';
import { EstadosPedido, TiposProductos } from '$lib/constants/pedido.constant';
import { PORCENTAJE_IVA } from '$lib/constants/pedido.constant';
import { FinalidadesPedidoEnum } from '$lib/constants/pedido.constant';

const prisma = new PrismaClient();

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { timeStampActual_UTCMinus5_ObjJS, fechaHoraActualISO8601_UTC } =
			obtenerFechaYHoraActual();

		const { pedido, productosAgregadosAlPedido } = await request.json();

		console.log('pedido ====>', pedido);
		console.log('productosAgregadosAlPedido ====>', productosAgregadosAlPedido);

		const {
			idCliente,
			clienteSedeCiudad,
			clienteSedeDireccion,
			idVendedor,
			fechaEntrega,
			finalidad,
			comentario,
		} = pedido;

		if (!idCliente) {
			return new Response(JSON.stringify({ error: 'No se recibio la clave idCliente' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		//todos los clientes tienen parametrizado un porcentajeDescuento,
		//este debe ir en el producto el cual tambien se llama porcentajeDescuento
		//por ende se necesita consultar el cliente para saber si tiene o no ese porcentajeDescuento
		const cliente = await prisma.clientes.findUnique({
			where: {
				id: idCliente,
			},
		});
		if (!cliente) {
			return new Response(
				JSON.stringify({
					error: `No se puede crear el pedido por que no se encuentra el cliente de ID ${idCliente}, este es necesario para saber el porcentaje de descuento que aplica al pedido`,
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
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

		if (productosAgregadosAlPedido.length === 0) {
			return new Response(JSON.stringify({ error: 'No se recibieron productos' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		//Se realizan las siguientes validaciones:
		//que el id del producto sea un valor valido
		//que a ningun producto le falte la cantidad
		//que si el producto es distinto de tipo externo tenga el tipoAceite
		//que el peso sea mayor a 0
		//que el nombre del producto sea un valor valido
		productosAgregadosAlPedido.forEach((p: detallePedidoCrear) => {
			if (!p.idProducto) {
				return new Response(JSON.stringify({ error: 'Uno de los productos no tiene el id' }), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}
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
			if (p.pesoProducto <= 0 || !p.pesoProducto) {
				return new Response(JSON.stringify({ error: 'Uno de los productos no tiene el peso' }), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}
			if (!p.nombreProducto) {
				return new Response(JSON.stringify({ error: 'Uno de los productos no tiene el nombre' }), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				});
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
					create: productosAgregadosAlPedido.map((p: detallePedidoCrear) => ({
						idProducto: p.idProducto,
						tipo: p.tipo,
						tipoAceite: p.tipoAceite,
						nombreProducto: p.nombreProducto,
						pesoProducto: p.pesoProducto,
						cantidadEnvases: p.tipo === TiposProductos.externo ? null : p.cantidadEnvases,
						cantidad: p.cantidad,
						valor: p.valor,
					})),
				},
				porcentajeIVA: finalidad === FinalidadesPedidoEnum.cotizacion ? null : PORCENTAJE_IVA,
				porcentajeDescuento: cliente.porcentajeDescuento,
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

			const cuerpoHtml = `<b>Se notifica nuevo pedido</b><br>
			<br>
			<b>ID:</b> ${nuevoPedido.id}<br>
			<b>Vendedor</b>: ${vendedor ? vendedor.nombre : 'Vendedor no encontrado'}<br>
			<b>Fecha de entrega:</b> ${fechaEntrega}<br>
			<b>Comentario:</b> ${comentario ? comentario : 'Ninguno'}<br>
			<b>Cantidad de productos:</b> ${productosAgregadosAlPedido.length}<br>
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
						message: `El pedido se creó correctamente con ID ${nuevoPedido.id}, no es necesario que vuelva a crearlo, el error es que no se pudo notificar por correo electronico a la empresa, favor avisar de este error, error de notificacion de correo electronico: ${e}`,
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

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const { pedido, productosAgregadosAlPedido } = await request.json();

		console.log('pedido ====>', pedido);
		console.log('productosAgregadosAlPedido ====>', productosAgregadosAlPedido);

		const { id, clienteSedeCiudad, clienteSedeDireccion, finalidad, comentario } = pedido;

		if (!id) {
			return new Response(
				JSON.stringify({
					error: 'No se recibio la clave idPedido, es necesario para editar el pedido',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
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

		if (!finalidad) {
			return new Response(JSON.stringify({ error: 'No se recibio la clave finalidad' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		if (productosAgregadosAlPedido.length === 0) {
			return new Response(JSON.stringify({ error: 'No se recibieron productos' }), {
				status: 400,
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		//Se realizan las siguientes validaciones:
		//que el id del producto sea un valor valido
		//que a ningun producto le falte la cantidad
		//que si el producto es distinto de tipo externo tenga el tipoAceite
		//que el peso sea mayor a 0
		//que el nombre del producto sea un valor valido
		productosAgregadosAlPedido.forEach((p: detallePedidoCrear) => {
			if (!p.idProducto) {
				return new Response(JSON.stringify({ error: 'Uno de los productos no tiene el id' }), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}
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
			if (p.pesoProducto <= 0 || !p.pesoProducto) {
				return new Response(JSON.stringify({ error: 'Uno de los productos no tiene el peso' }), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}
			if (!p.nombreProducto) {
				return new Response(JSON.stringify({ error: 'Uno de los productos no tiene el nombre' }), {
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				});
			}
		});

		//se procede a editar el pedido y sus productos en una transacción
		const resultadoEdicion = await prisma.$transaction(async (tx) => {
			// 1. Actualizar el pedido
			const pedidoEditar = await tx.pedidos.update({
				where: {
					id: id,
				},
				data: {
					finalidad: finalidad,
					clienteSedeCiudad: clienteSedeCiudad,
					clienteSedeDireccion: clienteSedeDireccion,
					comentario: comentario,
					porcentajeIVA: finalidad === FinalidadesPedidoEnum.cotizacion ? null : PORCENTAJE_IVA,
				},
			});

			// 2. Eliminar todos los productos actuales del pedido
			await tx.detallePedido.deleteMany({
				where: {
					idPedido: id,
				},
			});

			// 3. Crear los nuevos productos del pedido
			const productosCreados = await tx.detallePedido.createMany({
				data: productosAgregadosAlPedido.map((p: detallePedidoCrear) => ({
					idPedido: id,
					idProducto: p.idProducto,
					tipo: p.tipo,
					tipoAceite: p.tipoAceite,
					nombreProducto: p.nombreProducto,
					pesoProducto: p.pesoProducto,
					cantidadEnvases: p.tipo === TiposProductos.externo ? null : p.cantidadEnvases,
					cantidad: p.cantidad,
					valor: p.valor,
				})),
			});

			return { pedidoEditar, productosCreados };
		});

		if (resultadoEdicion) {
			const pedidoEditado = await prisma.pedidos.findUnique({
				where: {
					id: id,
				},
				include: {
					vendedor: true,
				},
			});

			//se envia correo notificando de la edicion
			const cuerpoHtml = `<b>Se notifica edicion del pedido ID #${resultadoEdicion.pedidoEditar.id}</b><br>
			<br>
			<b>ID:</b> ${resultadoEdicion.pedidoEditar.id}<br>
			<b>Vendedor</b>: ${pedidoEditado?.vendedor ? pedidoEditado.vendedor.nombre : 'Vendedor no encontrado'}<br>
			<b>Comentario:</b> ${comentario ? comentario : 'Ninguno'}<br>
			<b>Cantidad de productos:</b> ${productosAgregadosAlPedido.length}<br>
			<br>`;
			try {
				await transporterSistemas.sendMail({
					from: 'sistemas@fagarcomercial.com',
					to: env.EMAIL_NOTIFICACION_PEDIDO,
					replyTo: 'sistemas@fagarcomercial.com',
					subject: `PEDIDOS - Edicion pedido ID #${resultadoEdicion.pedidoEditar.id}`,
					html: cuerpoHtml,
				});
			} catch (e) {
				return new Response(
					JSON.stringify({
						message: `El pedido se actualizó correctamente con ID ${resultadoEdicion.pedidoEditar.id}, no es necesario que vuelva a crearlo, el error es que no se pudo notificar por correo electronico a la empresa, favor avisar de este error, error de notificacion de correo electronico: ${e}`,
					}),
					{
						status: 201,
						headers: {
							'Content-Type': 'application/json',
						},
					},
				);
			}
			return new Response(
				JSON.stringify({
					message: `Pedido de ID ${resultadoEdicion.pedidoEditar.id} actualizado correctamente`,
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);
		} else {
			throw new Error('No se pudo editar el pedido');
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
