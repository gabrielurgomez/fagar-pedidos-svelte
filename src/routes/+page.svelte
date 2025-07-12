<script lang="ts">
	import './styles/app.css';
	import { logo } from '../lib/images/logo';
	import Swal from 'sweetalert2';
	import { Tarjeta, TarjetaHeader, TarjetaBody } from '$lib/components/Tarjeta';
	import { Boton } from '$lib/components/Boton';
	import { Tabla, CeldaHeader, Celda, Fila } from '$lib/components/Tabla';
	import IconoGuardar from '$lib/icons/Guardar.svelte';
	import PuntosCargando from '$lib/components/PuntosCargando.svelte';
	import Lista from '$lib/icons/Lista.svelte';
	import type { Cliente } from '$lib/types/cliente.type';
	import type { PedidoCrear, Pedido } from '$lib/types/pedido.type';
	import type { ProductoConsultado } from '$lib/types/producto.type';
	import { EstadosPedido, LIMITEULTIMOSPEDIDOS } from '$lib/constants/pedido.constant';
	import { formatearFechaDDMMMYYYY } from '$lib/utils/fechas';
	import type { VendedorLogueado } from '$lib/types/vendedor.type';
	import { nombresCookies } from '$lib/constants/cookie.constant';
	import CrearEditarPedido from '$lib/components/shared/CrearEditarPedido.svelte';

	let usuario = { numeroCedula: '', fechaExpedicionDocumento: '' };

	export let data;

	if (data.numeroCedulaVendedor && data.fechaExpedicionDocumentoVendedor) {
		usuario = {
			numeroCedula: data.numeroCedulaVendedor,
			fechaExpedicionDocumento: data.fechaExpedicionDocumentoVendedor,
		};
	}

	enum Tabs {
		ninguno,
		crearEditarPedido,
		consultarUltimosPedidos,
	}
	enum Finalidades {
		CREAR,
		EDITAR,
	}
	let finalidadActual: Finalidades = Finalidades.CREAR;

	enum EstadoActual {
		ninguno,
		consultandoClientes,
		consultandoUltimosPedidos,
		validandoUsuario,
	}
	let estadoActual: EstadoActual = EstadoActual.ninguno;

	let productos: ProductoConsultado[] = [];
	let pedido: Pedido | null = null;
	let pedidoSeleccionado: Pedido | null = null;
	let ultimosPedidos: Pedido[] = [];

	let tabActivo: Tabs = Tabs.crearEditarPedido;
	let vendedorLogueado: VendedorLogueado | null = null;
	let clientesDelVendedor: Cliente[] = [];

	const consultarUltimosPedidos = async () => {
		if (!vendedorLogueado) {
			return;
		}
		try {
			estadoActual = EstadoActual.consultandoUltimosPedidos;
			let rta = await fetch(
				`/api/pedidos?finalidad=recientes&buscarpor=id&limiteregistros=${LIMITEULTIMOSPEDIDOS}&ordenadopor=id&condicionordenado=desc&idvendedor=${vendedorLogueado.id}`,
				{
					method: 'GET',
					cache: 'no-cache',
					headers: { 'Content-Type': 'application/json' },
				},
			);
			estadoActual = EstadoActual.ninguno;
			// console.log('consultarUltimosPedidos, rta.status ===>', rta.status);
			if (rta.status === 200) {
				ultimosPedidos = await rta.json();
			}
		} catch (error) {
			console.error('Error al consultar clientes:', error);
		}
	};

	const consultarClientesDelVendedor = async (idVendedor: number) => {
		estadoActual = EstadoActual.consultandoClientes;
		try {
			let rta = await fetch(`/api/clientes/${idVendedor}`, {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			let clientesEncontrados = await rta.json();
			console.log('clientesEncontrados ====>', clientesEncontrados);
			estadoActual = EstadoActual.ninguno;
			return clientesEncontrados;
		} catch (error) {
			console.error('Error al consultar clientes:', error);
		}
	};

	const validarUsuario = async () => {
		//por si habia un pedido hecho y se reintenta iniciar sesion
		pedido = null;

		if (!usuario.numeroCedula) {
			Swal.fire({ icon: 'info', title: 'Valide datos', text: 'Debe digitar el número de cedula' });
			return;
		}
		if (!usuario.fechaExpedicionDocumento) {
			Swal.fire({
				icon: 'info',
				title: 'Valide datos',
				text: 'Debe seleccionar la fecha de expedicion del documento',
			});
			return;
		}
		estadoActual = EstadoActual.validandoUsuario;
		const rtaJson = await fetch(
			`api/vendedor/${usuario.numeroCedula}/${usuario.fechaExpedicionDocumento}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			},
		);

		switch (rtaJson.status) {
			case 200: {
				const rta = await rtaJson.json();
				let vendedor = rta.vendedor;

				let clientesEncontrados = await consultarClientesDelVendedor(vendedor.id);
				if (clientesEncontrados.length > 0) {
					clientesDelVendedor = clientesEncontrados;
					vendedorLogueado = {
						id: vendedor.id,
						nombre: vendedor.nombre,
					};
					console.log('vendedorLogueado ====>', vendedorLogueado);
					tabActivo = Tabs.crearEditarPedido;
					estadoActual = EstadoActual.ninguno;
				} else {
					Swal.fire({
						icon: 'info',
						title: 'Clientes no encontrados',
						text: `Los datos de inicio de sesión son válidos, pero el usuario de cedula ${usuario.numeroCedula} que acaba de digitar no tiene clientes asignados, favor solicite que le asignen clientes`,
					});
				}
				break;
			}
			case 400: {
				let rtaError = await rtaJson.json();
				Swal.fire({
					icon: 'error',
					title: 'Error 400',
					text: rtaError.message,
				});
				break;
			}
			case 404: {
				const rtaError404 = await rtaJson.json();
				Swal.fire({
					icon: 'info',
					title: 'Usuario no encontrado',
					text: rtaError404.message,
				});
				break;
			}
			case 500: {
				let rtaError = await rtaJson.json();
				Swal.fire({
					icon: 'error',
					title: 'Error 500',
					text: rtaError.error,
				});
				break;
			}
		}
	};

	const cerrarSesion = async () => {
		//se envia a eliminar la cookie que recuerda el numero de cedula y la fecha de expedicion del documento
		const rtaJson = await fetch(`/api/cookie/${nombresCookies.datosUsuarioLogueado}`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		});
		if (rtaJson.status !== 200) {
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'No se pudo cerrar la sesión',
			});
			return;
		}
		usuario = { numeroCedula: '', fechaExpedicionDocumento: '' };
		vendedorLogueado = null;
		pedido = null;
		pedidoSeleccionado = null;
		clientesDelVendedor = [];
		productos = [];
		tabActivo = Tabs.ninguno;
	};
</script>

<svelte:head>
	<title>Pedidos</title>
	<meta name="description" content="Pedidos FAGAR" />
</svelte:head>

<div class="contenedorPrincipal">
	{#if !vendedorLogueado}
		<img alt="logo" src={logo} class="h-25 sm:h-45 w-40 sm:w-80" />
		<h1 class="text-3xl font-bold text-green-700">Pedidos</h1>
		<Tarjeta class="lg:w-1/3">
			<TarjetaHeader titulo="Validación de usuario" />
			<TarjetaBody>
				<form class="flex w-full flex-col" on:submit|preventDefault={validarUsuario}>
					<label for="usuario" class="input-label">Numero cedula</label>
					<input class="input-texto" bind:value={usuario.numeroCedula} type="text" />

					<label for="contrasena" class="input-label mt-4">Fecha expedición</label>
					<input
						class="input-texto mb-4"
						bind:value={usuario.fechaExpedicionDocumento}
						type="date"
					/>
					<Boton
						tipo="submit"
						cargando={estadoActual === EstadoActual.validandoUsuario}
						variante="principal"
					>
						Validar
					</Boton>
				</form>
			</TarjetaBody>
		</Tarjeta>
	{:else}
		<div class="flex w-full items-center justify-between border-b px-3 sm:gap-4 sm:px-20 xl:gap-8">
			<img alt="logo" src={logo} class="sm:w-50 w-40" />
			<div class="flex flex-col items-center">
				<div class="font-bold text-green-700 sm:text-2xl">{vendedorLogueado.nombre}</div>
				<Boton variante="link rojo" on:click={cerrarSesion}>Cerrar sesión</Boton>
			</div>
		</div>
		<div>
			<div class={`tab ${tabActivo === Tabs.consultarUltimosPedidos ? 'tab-activo' : ''}`}>
				<Lista tamano={20} />
				<button
					on:click={() => {
						tabActivo = Tabs.consultarUltimosPedidos;
						//por si vengo de otro tab
						pedidoSeleccionado = null;
						consultarUltimosPedidos();
					}}
				>
					<span class="hidden sm:block">Pedidos recientes</span>
					<span class="sm:hidden">Recientes</span>
				</button>
			</div>
			<div class={`tab ${tabActivo === Tabs.crearEditarPedido ? 'tab-activo' : ''}`}>
				<IconoGuardar tamano={20} />
				<button on:click={() => (tabActivo = Tabs.crearEditarPedido)}>Crear o Editar</button>
			</div>
		</div>
		<div class="w-full justify-center px-3 sm:px-20">
			{#if tabActivo === Tabs.consultarUltimosPedidos}
				<Tarjeta class="max-h-[60vh] overflow-y-auto sm:w-full">
					<TarjetaHeader
						titulo={`Mis ultimos ${LIMITEULTIMOSPEDIDOS} pedidos`}
						class="sticky top-0"
					/>
					<TarjetaBody>
						{#if estadoActual === EstadoActual.consultandoUltimosPedidos}
							<PuntosCargando />
						{:else if ultimosPedidos.length > 0}
							<Tabla>
								<thead class="sticky top-[62px] bg-white">
									<Fila>
										<CeldaHeader><div class="text-xs font-bold sm:text-base">ID</div></CeldaHeader>
										<CeldaHeader>
											<div class="text-xs font-bold sm:text-base">Estado</div>
										</CeldaHeader>
										<CeldaHeader>
											<div class="text-xs font-bold sm:text-base">Fecha creado</div>
										</CeldaHeader>
										<CeldaHeader>
											<div class="text-xs font-bold sm:text-base">Fecha entrega</div>
										</CeldaHeader>
										<div class="hidden sm:block">
											<CeldaHeader>
												<div class="text-xs font-bold sm:text-base">Comentario</div>
											</CeldaHeader>
										</div>
										<CeldaHeader>
											<div class="hidden text-base font-bold sm:block">Ver detalle</div>
											<div class="text-xs sm:hidden">Ver</div>
										</CeldaHeader>
									</Fila>
								</thead>
								<tbody>
									{#each ultimosPedidos as pedido}
										<Fila>
											<Celda>{pedido.id}</Celda>
											<Celda>
												{#if pedido.estado === EstadosPedido.creado || pedido.estado === EstadosPedido.pendiente}
													<div class="text-xs font-bold sm:text-base">{EstadosPedido.creado}</div>
												{/if}
												{#if pedido.estado === EstadosPedido.aprobado}
													<div class="text-xs font-bold text-green-600 sm:text-base">
														{EstadosPedido.aprobado}
													</div>
												{/if}
												{#if pedido.estado === EstadosPedido.rechazado}
													<div class="text-xs font-bold text-red-500 sm:text-base">
														{EstadosPedido.rechazado}
													</div>
												{/if}
											</Celda>

											<Celda>
												<div class="text-xs sm:text-base">
													{formatearFechaDDMMMYYYY(pedido.fechaCreado)}
												</div>
											</Celda>
											<Celda>
												<div class="text-xs sm:text-base">
													{formatearFechaDDMMMYYYY(pedido.fechaEntrega)}
												</div>
											</Celda>
											<div class="hidden sm:block">
												<Celda>
													<div class="text-xs sm:text-base">{pedido.comentario}</div>
												</Celda>
											</div>
											<Celda>
												<Boton
													variante="link verdeFagar"
													on:click={() => (pedidoSeleccionado = pedido)}
												>
													<div class="hidden text-base sm:block">Ver detalle</div>
													<div class="text-xs sm:hidden">Ver</div>
												</Boton>
											</Celda>
										</Fila>
									{/each}
								</tbody>
							</Tabla>
						{:else}
							<div class="text-center">No hay pedidos</div>
						{/if}
					</TarjetaBody>
				</Tarjeta>
				{#if pedidoSeleccionado}
					<Tarjeta class="sm:w-full">
						<TarjetaHeader titulo={`Detalles Pedido id ID ${pedidoSeleccionado?.id}`} />
						<TarjetaBody>
							<div class="flex w-full flex-col justify-start sm:flex-row">
								<div class="flex w-full flex-col justify-between gap-2 sm:flex-row">
									<div class="flex flex-col rounded-lg border p-4">
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Fecha creado:</div>
											{formatearFechaDDMMMYYYY(pedidoSeleccionado?.fechaCreado)}
										</div>
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Fecha entrega:</div>
											{formatearFechaDDMMMYYYY(pedidoSeleccionado?.fechaEntrega)}
										</div>
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Finalidad:</div>
											{pedidoSeleccionado?.finalidad.charAt(0).toUpperCase() +
												pedidoSeleccionado?.finalidad.slice(1)}
										</div>
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Estado:</div>
											{#if pedidoSeleccionado.estado === EstadosPedido.creado || pedidoSeleccionado.estado === EstadosPedido.pendiente}
												<div class="font-bold">{EstadosPedido.creado}</div>
											{/if}
											{#if pedidoSeleccionado.estado === EstadosPedido.aprobado}
												<div class="font-bold text-green-600">
													{EstadosPedido.aprobado}
												</div>
											{/if}
											{#if pedidoSeleccionado.estado === EstadosPedido.rechazado}
												<div class="font-bold text-red-500">
													{EstadosPedido.rechazado}
												</div>
											{/if}
										</div>
									</div>
									<div class="flex flex-col rounded-lg border p-4">
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Cliente:</div>
											{clientesDelVendedor.find((c) => c.id === pedidoSeleccionado?.idCliente)
												?.razonSocial}
										</div>
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Sede:</div>
											{pedidoSeleccionado?.clienteSedeDireccion}
										</div>
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Ciudad:</div>
											{pedidoSeleccionado?.clienteSedeCiudad}
										</div>
										<div class="flex flex-col sm:flex-row">
											<div class="me-2 font-bold">Celular:</div>
											{clientesDelVendedor.find(
												(cliente) => cliente.id === pedidoSeleccionado?.idCliente,
											)?.celular}
										</div>
									</div>
								</div>
							</div>
							<div class="w-full rounded-lg border py-4">
								<div class="mb-4 overflow-y-auto rounded-lg pt-2">
									<Tabla>
										<thead>
											<Fila>
												<CeldaHeader><div class="text-base font-bold">Tipo</div></CeldaHeader>
												<CeldaHeader>
													<div class="text-base font-bold">Producto</div>
												</CeldaHeader>
												<CeldaHeader>
													<div class="hidden text-base font-bold sm:block">Cantidad</div>
													<div class="text-xs sm:hidden">Cant</div>
												</CeldaHeader>
												<CeldaHeader>
													<div class="text-xs font-bold sm:text-base">Total Unds</div>
												</CeldaHeader>
												<CeldaHeader>
													<div class="text-xs font-bold sm:text-base">Valor</div>
												</CeldaHeader>
												<CeldaHeader>
													<div class="text-xs font-bold sm:text-base">Total</div>
												</CeldaHeader>
											</Fila>
										</thead>
										<tbody>
											{#each pedidoSeleccionado.detallePedido as detalle}
												<Fila>
													<Celda>
														<div class="hidden text-base font-bold sm:block">{detalle.tipo}</div>
														<div class="text-xs sm:hidden">{detalle.tipo.substring(0, 3)}</div>
													</Celda>
													<Celda>
														<div class="hidden text-base sm:block">
															{productos.find((p) => detalle.idProducto === p.id)?.nombre}
														</div>
														<div class="text-xs sm:hidden">
															{productos.find((p) => detalle.idProducto === p.id)?.nombre}
														</div>
													</Celda>
													<Celda><div class="text-xs sm:text-base">{detalle.cantidad}</div></Celda>
													<Celda>
														<div class="text-xs sm:text-base">
															{detalle.cantidadEnvases
																? detalle.cantidad * detalle.cantidadEnvases
																: '-'}
														</div>
													</Celda>
													<Celda>
														<div class="text-xs sm:text-base">
															{new Intl.NumberFormat('es-CO', {
																style: 'currency',
																currency: 'COP',
																minimumFractionDigits: 0,
																maximumFractionDigits: 0,
															}).format(detalle.valor)}
														</div>
													</Celda>
													<Celda>
														<div class="text-xs sm:text-base">
															{new Intl.NumberFormat('es-CO', {
																style: 'currency',
																currency: 'COP',
																minimumFractionDigits: 0,
																maximumFractionDigits: 0,
															}).format(detalle.valor * detalle.cantidad)}
														</div>
													</Celda>
												</Fila>
											{/each}
										</tbody>
									</Tabla>
								</div>
							</div>
							<div class="me-2 mt-2 flex w-full flex-col gap-2 rounded-lg border p-4">
								<div class="flex flex-col sm:flex-row sm:justify-between">
									<div class="flex flex-col sm:flex-row sm:items-center sm:gap-2">
										<div class="font-bold">Comentario:</div>
										{pedidoSeleccionado.comentario ? pedidoSeleccionado.comentario : 'Ninguno'}
									</div>
									<div
										class="mt-2 flex w-full flex-col items-start sm:mt-0 sm:flex-row sm:justify-end"
									>
										<div class="font-bold">Total pedido:</div>
										{new Intl.NumberFormat('es-CO', {
											style: 'currency',
											currency: 'COP',
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
										}).format(
											pedidoSeleccionado.detallePedido.reduce(
												(acc, d) => acc + d.valor * d.cantidad,
												0,
											),
										)}
									</div>
								</div>
								<div class="flex flex-col sm:flex-row sm:gap-2">
									<div class="font-bold text-red-500">Motivo Rechazo:</div>
									{pedidoSeleccionado.motivoRechazo ? pedidoSeleccionado.motivoRechazo : 'Ninguno'}
								</div>
							</div>
						</TarjetaBody>
					</Tarjeta>
				{/if}
			{/if}
			{#if tabActivo === Tabs.crearEditarPedido}
				<div class="flex justify-center">
					<button
						class={`flex justify-center rounded-lg px-4 py-2 ${finalidadActual === Finalidades.CREAR ? 'bg-green-500' : ''}	`}
						on:click={() => (finalidadActual = Finalidades.CREAR)}
					>
						<span class={`${finalidadActual === Finalidades.CREAR ? 'text-slate-100' : ''}`}>
							Crear
						</span>
					</button>
					<button
						class={`flex justify-center rounded-lg px-4 py-2 ${finalidadActual === Finalidades.EDITAR ? 'bg-green-500' : ''}	`}
						on:click={() => {
							finalidadActual = Finalidades.EDITAR;
							//por si vengo de otro tab
							pedidoSeleccionado = null;
							consultarUltimosPedidos();
						}}
					>
						<span class={`${finalidadActual === Finalidades.EDITAR ? 'text-slate-100' : ''}`}>
							Editar
						</span>
					</button>
				</div>
				{#if finalidadActual === Finalidades.CREAR}
					<CrearEditarPedido
						pedido={null}
						{clientesDelVendedor}
						{vendedorLogueado}
						productosAgregadosAlPedido={[]}
					/>
				{/if}
				{#if finalidadActual === Finalidades.EDITAR}
					{#if !pedidoSeleccionado}
						<Tarjeta class="max-h-[60vh] overflow-y-auto sm:w-full">
							<TarjetaHeader
								titulo={`Seleccione el pedido a editar, se listan los ultimos ${LIMITEULTIMOSPEDIDOS} pedidos creados`}
								class="sticky top-0"
							/>
							<TarjetaBody>
								{#if estadoActual === EstadoActual.consultandoUltimosPedidos}
									<PuntosCargando />
								{:else if ultimosPedidos.length > 0}
									<Tabla>
										<thead class="sticky top-[62px] bg-white">
											<Fila>
												<CeldaHeader>
													<div class="text-xs font-bold sm:text-base">ID</div>
												</CeldaHeader>
												<CeldaHeader>
													<div class="text-xs font-bold sm:text-base">Estado</div>
												</CeldaHeader>
												<CeldaHeader>
													<div class="text-xs font-bold sm:text-base">Fecha creado</div>
												</CeldaHeader>
												<CeldaHeader>
													<div class="text-xs font-bold sm:text-base">Fecha entrega</div>
												</CeldaHeader>
												<div class="hidden sm:block">
													<CeldaHeader>
														<div class="text-xs font-bold sm:text-base">Comentario</div>
													</CeldaHeader>
												</div>
												<CeldaHeader>
													<div class="hidden text-base font-bold sm:block">Editar</div>
													<div class="text-xs sm:hidden">Ver</div>
												</CeldaHeader>
											</Fila>
										</thead>
										<tbody>
											{#each ultimosPedidos as pedido}
												<Fila>
													<Celda><div class="dark:text-slate-300">{pedido.id}</div></Celda>
													<Celda>
														{#if pedido.estado === EstadosPedido.creado || pedido.estado === EstadosPedido.pendiente}
															<div class="text-xs font-bold sm:text-base dark:text-slate-300">
																{EstadosPedido.creado}
															</div>
														{/if}
														{#if pedido.estado === EstadosPedido.aprobado}
															<div class="text-xs font-bold text-green-600 sm:text-base">
																{EstadosPedido.aprobado}
															</div>
														{/if}
														{#if pedido.estado === EstadosPedido.rechazado}
															<div class="text-xs font-bold text-red-500 sm:text-base">
																{EstadosPedido.rechazado}
															</div>
														{/if}
													</Celda>

													<Celda>
														<div class="text-xs sm:text-base dark:text-slate-300">
															{formatearFechaDDMMMYYYY(pedido.fechaCreado)}
														</div>
													</Celda>
													<Celda>
														<div class="text-xs sm:text-base dark:text-slate-300">
															{formatearFechaDDMMMYYYY(pedido.fechaEntrega)}
														</div>
													</Celda>
													<div class="hidden sm:block">
														<Celda>
															<div class="text-xs sm:text-base dark:text-slate-300">
																{pedido.comentario ? pedido.comentario : 'Ninguno'}
															</div>
														</Celda>
													</div>
													<!--Solo se puede editar si el pedido está en estado creado-->
													{#if pedido.estado === EstadosPedido.creado}
														<Celda>
															<Boton
																variante="link verdeFagar"
																on:click={() => (pedidoSeleccionado = pedido)}
															>
																Editar
															</Boton>
														</Celda>
													{/if}
												</Fila>
											{/each}
										</tbody>
									</Tabla>
								{:else}
									<div class="text-center">No hay pedidos</div>
								{/if}
							</TarjetaBody>
						</Tarjeta>
					{/if}
					{#if pedidoSeleccionado}
						<CrearEditarPedido
							onPedidoEditado={() => {
								pedidoSeleccionado = null;
								consultarUltimosPedidos();
							}}
							pedido={pedidoSeleccionado}
							{clientesDelVendedor}
							{vendedorLogueado}
							productosAgregadosAlPedido={pedidoSeleccionado.detallePedido}
						/>
					{/if}
				{/if}
			{/if}
		</div>
	{/if}
</div>
