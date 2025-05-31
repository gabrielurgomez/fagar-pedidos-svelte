<script lang="ts">
	import './styles/app.css';
	import { logo } from '../lib/images/logo';
	import Swal from 'sweetalert2';
	import { Modal, ModalHeader, ModalContent, ModalFooter } from '$lib/components/Modal';
	import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '$lib/components/Combobox';
	import { Tarjeta, TarjetaHeader, TarjetaBody } from '$lib/components/Tarjeta';
	import { Boton } from '$lib/components/Boton';
	import { Tabla, CeldaHeader, Celda, Fila } from '$lib/components/Tabla';
	import IconoGuardar from '$lib/icons/Guardar.svelte';
	import PuntosCargando from '$lib/components/PuntosCargando.svelte';
	import Eliminar from '$lib/icons/Eliminar.svelte';
	import Lista from '$lib/icons/Lista.svelte';
	import type { ClienteSede, Cliente } from '$lib/types/cliente.type';
	import type {
		PedidoConDetalleFormulario,
		FinalidadesPedidoConSeleccione,
		Pedido,
	} from '$lib/types/pedido.type';
	import { TiposProductos } from '$lib/constants/pedido.constant';
	import type {
		ProductoAgregadoAlPedido,
		ProductoExternoConsultado,
		ProductoConsultado,
	} from '$lib/types/producto.type';
	import { EstadosPedido, LIMITEULTIMOSPEDIDOS } from '$lib/constants/pedido.constant';
	import { formatearFechaDDMMMYYYY } from '$lib/utils/fechas';
	import type { VendedorLogueado } from '$lib/types/vendedor.type';
	import { nombresCookies } from '$lib/constants/cookie.constant';

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
		crearPedido,
		consultarUltimosPedidos,
	}

	let estadoActual = {
		validandoUsuario: false,
		consultandoProductos: false,
		creandoPedido: false,
		consultandoClientes: false,
		consultandoProductosExternos: false,
		consultandoUltimosPedidos: false,
	};

	let productos: ProductoConsultado[] = [];
	let productosExternos: ProductoExternoConsultado[] = [];
	let pedido: PedidoConDetalleFormulario | null = null;
	let pedidoSeleccionado: Pedido | null = null;
	let ultimosPedidos: Pedido[] = [];

	let clienteSeleccionado = {
		id: 0,
		razonSocial: '',
		sedesClientes: [] as ClienteSede[],
	};

	let tabActivo: Tabs = Tabs.crearPedido;
	let vendedorLogueado: VendedorLogueado | null = null;
	let clientes: Cliente[] = [];

	const consultarClientesDelVendedor = async (idVendedor: number) => {
		estadoActual.consultandoClientes = true;
		try {
			let rta = await fetch(`/api/clientes/${idVendedor}`, {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			let clientesEncontrados = await rta.json();
			estadoActual.consultandoClientes = false;
			return clientesEncontrados;
		} catch (error) {
			console.error('Error al consultar clientes:', error);
		}
	};

	const consultarUltimosPedidos = async () => {
		estadoActual.consultandoUltimosPedidos = true;
		if (!vendedorLogueado) {
			return;
		}
		try {
			let rta = await fetch(
				`/api/pedidos?finalidad=recientes&buscarpor=id&limiteregistros=${LIMITEULTIMOSPEDIDOS}&ordenadopor=id&condicionordenado=desc&idvendedor=${vendedorLogueado.id}`,
				{
					method: 'GET',
					cache: 'no-cache',
					headers: { 'Content-Type': 'application/json' },
				},
			);
			if (rta.status === 200) {
				ultimosPedidos = await rta.json();
			}

			estadoActual.consultandoUltimosPedidos = false;
		} catch (error) {
			console.error('Error al consultar clientes:', error);
		}
	};

	let sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };

	const consultarProductos = async () => {
		estadoActual.consultandoProductos = true;
		try {
			let rta = await fetch('/api/productos', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			productos = await rta.json();
			estadoActual.consultandoProductos = false;
		} catch (error) {
			console.error('Error al consultar vendedores:', error);
		}
	};

	const consultarProductosExternos = async () => {
		estadoActual.consultandoProductosExternos = true;
		try {
			let rta = await fetch('/api/productosExternos', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			productosExternos = await rta.json();
			estadoActual.consultandoProductosExternos = false;
		} catch (error) {
			console.error('Error al consultar productos externos:', error);
		}
	};

	let productoSeleccionado: ProductoAgregadoAlPedido | null = null;
	let productosAgregados: ProductoAgregadoAlPedido[] = [];

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
		estadoActual.validandoUsuario = true;

		const rtaJson = await fetch(
			`api/vendedor/${usuario.numeroCedula}/${usuario.fechaExpedicionDocumento}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			},
		);
		console.log('rtaJson', rtaJson);
		switch (rtaJson.status) {
			case 200: {
				const rta = await rtaJson.json();
				let vendedor = rta.vendedor;

				let clientesEncontrados = await consultarClientesDelVendedor(vendedor.id);
				if (clientesEncontrados.length > 0) {
					clientes = clientesEncontrados;
					vendedorLogueado = {
						id: vendedor.id,
						nombre: vendedor.nombre,
					};
					pedido = {
						idVendedor: vendedor.id,
						idCliente: 0,
						fechaEntrega: null,
						fechaCreado: null,
						finalidad: 'SELECCIONE',
						comentario: '',
						clienteSedeCiudad: '',
						clienteSedeDireccion: '',
						estado: EstadosPedido.creado,
						detallePedido: [],
						porcentajeIVA: null,
					};
					//como ya se validó el usuario, se envia a consultar productos pues de una vez queda lista la card para crear producto
					tabActivo = Tabs.crearPedido;
					consultarProductos();
					consultarProductosExternos();
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
		estadoActual.validandoUsuario = false;
	};

	const crearPedido = async () => {
		//al validarse el usuario se asignó el idVendedor a pedido por lo cual pedido ya no es null en este momento
		if (!pedido || !pedido.idVendedor) {
			alert(
				'Favor avisar a sistemas, no se está capturando correctamente el idVendedor del usuario logueado para enviar al backend',
			);
			return;
		}

		if (!pedido.fechaEntrega) {
			Swal.fire({
				icon: 'info',
				title: 'Fecha de entrega',
				text: 'Debe seleccionar la fecha de entrega del pedido',
			});
			return;
		}

		pedido.idCliente = clienteSeleccionado.id;
		if (!pedido.idCliente) {
			Swal.fire({
				icon: 'info',
				title: 'Cliente no seleccionado',
				text: 'Debe seleccionar un cliente para el pedido',
			});
			return;
		}

		if (sedeSeleccionada.id === 0) {
			Swal.fire({
				icon: 'info',
				title: 'Sede no seleccionada',
				text: 'Debe seleccionar una sede para el pedido',
			});
			return;
		}

		if (finalidadPedidoSeleccionado === 'SELECCIONE') {
			Swal.fire({
				icon: 'info',
				title: 'Finalidad no seleccionada',
				text: 'Debe seleccionar una finalidad para el pedido',
			});
			return;
		}

		pedido.clienteSedeCiudad = sedeSeleccionada.ciudad;
		pedido.clienteSedeDireccion = sedeSeleccionada.direccion;
		pedido.finalidad = finalidadPedidoSeleccionado;

		if (productosAgregados.length === 0) {
			Swal.fire({
				icon: 'info',
				title: 'No hay productos',
				text: 'Debe agregar al menos un producto al pedido',
			});
			return;
		}
		estadoActual.creandoPedido = true;

		const rtaPedidoJson = await fetch('/api/pedido', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...pedido,
				productos: productosAgregados,
			}),
		});

		switch (rtaPedidoJson.status) {
			case 201: {
				let rta = await rtaPedidoJson.json();

				Swal.fire({
					icon: 'success',
					title: 'Creado',
					text: rta.message,
				});
				productosAgregados = [];

				pedido = {
					idVendedor: pedido.idVendedor,
					idCliente: 0,
					fechaEntrega: null,
					fechaCreado: null,
					finalidad: 'SELECCIONE',
					comentario: '',
					clienteSedeCiudad: '',
					clienteSedeDireccion: '',
					estado: EstadosPedido.creado,
					detallePedido: [],
					porcentajeIVA: null,
				};

				finalidadPedidoSeleccionado = 'SELECCIONE';
				sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };
				clienteSeleccionado = { id: 0, razonSocial: '', sedesClientes: [] };
				productoSeleccionado = null;

				break;
			}

			case 400: {
				let rtaError = await rtaPedidoJson.json();
				Swal.fire({
					icon: 'error',
					title: 'Error 400',
					text: rtaError.error,
				});
				break;
			}

			case 500: {
				let rtaError = await rtaPedidoJson.json();
				Swal.fire({
					icon: 'error',
					title: 'Error 500',
					text: rtaError.error,
				});
				break;
			}
		}
		estadoActual.creandoPedido = false;
	};

	let nombreProductoBuscar = '';
	let nombreProductoExternoBuscar = '';

	$: productosFiltrados = productos.filter((producto) => {
		return producto.nombre.toLowerCase().includes(nombreProductoBuscar.toLowerCase());
	});

	$: productosExternosFiltrados = productosExternos.filter((producto) => {
		return producto.nombre.toLowerCase().includes(nombreProductoExternoBuscar.toLowerCase());
	});

	let finalidadesPedido: FinalidadesPedidoConSeleccione[] = [
		'SELECCIONE',
		'COTIZACION',
		'PROFORMA',
	];
	let finalidadPedidoSeleccionado: FinalidadesPedidoConSeleccione = 'SELECCIONE';

	let clienteBuscar = '';
	let touchedInputCliente = false;
	$: clientesFiltrados =
		clienteBuscar && touchedInputCliente
			? clientes.filter((cliente) => cliente.razonSocial.includes(clienteBuscar.toLowerCase()))
			: clientes;

	let sedeBuscar = '';
	let touchedInputSedesCliente = false;
	$: sedesFiltrados =
		sedeBuscar && touchedInputSedesCliente
			? clienteSeleccionado.sedesClientes.filter((sede) =>
					sede.direccion.includes(sedeBuscar.toLowerCase()),
				)
			: clienteSeleccionado.sedesClientes;

	$: mostrarModalProductos = false;
	$: mostrarModalProductosExternos = false;

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
		}

		usuario = { numeroCedula: '', fechaExpedicionDocumento: '' };
		vendedorLogueado = null;
		pedido = null;
		pedidoSeleccionado = null;
		clientes = [];
		productos = [];
		productosFiltrados = [];
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
					<Boton tipo="submit" cargando={estadoActual.validandoUsuario} variante="principal">
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
			<div class={`tab ${tabActivo === Tabs.crearPedido ? 'tab-activo' : ''}`}>
				<IconoGuardar tamano={20} />
				<button
					on:click={() => {
						tabActivo = Tabs.crearPedido;
						consultarProductos();
					}}
				>
					Crear Pedido
				</button>
			</div>
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
					Ultimos Pedidos
				</button>
			</div>
		</div>
		<div class="w-full px-3 sm:px-20">
			<!-- Cuando se validó el vendedor, se asigna el idVendedor a pedido por lo cual pedido ya no es null -->
			{#if tabActivo === Tabs.crearPedido && pedido?.idVendedor}
				<Tarjeta>
					<TarjetaHeader titulo="Crear pedido" />
					<TarjetaBody>
						<form method="POST" class="w-full" on:submit|preventDefault={crearPedido}>
							<label for="fecha de entrega" class="input-label">Fecha de entrega</label>
							<input bind:value={pedido.fechaEntrega} class="input-texto" type="date" />
							<label for="Seleccione cliente" class="input-label">Seleccione cliente</label>
							<Combobox
								items={clientesFiltrados}
								selected={{ value: clienteSeleccionado.id, label: clienteSeleccionado.razonSocial }}
							>
								<ComboboxInput placeholder="Seleccione..." />
								<ComboboxContent>
									{#each clientesFiltrados as cliente (cliente.id)}
										<ComboboxItem
											value={cliente.id}
											label={cliente.razonSocial}
											on:click={() => {
												sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };
												clienteSeleccionado = {
													id: cliente.id,
													razonSocial: cliente.razonSocial,
													sedesClientes: cliente.sedes,
												};
											}}
										/>
									{:else}
										<span class="block px-5 py-2 text-sm text-muted-foreground">
											No results found
										</span>
									{/each}
								</ComboboxContent>
							</Combobox>
							{#if clienteSeleccionado.sedesClientes.length > 0}
								<label for="Seleccione sede del cliente" class="input-label">
									Seleccione sede del cliente
								</label>
								<Combobox
									items={sedesFiltrados}
									selected={{ value: sedeSeleccionada.id, label: sedeSeleccionada.direccion }}
								>
									<ComboboxInput placeholder="Seleccione..." />
									<ComboboxContent>
										{#each clienteSeleccionado.sedesClientes as sede}
											<ComboboxItem
												value={sede.id}
												label={`${sede.ciudad} - ${sede.direccion}`}
												on:click={() => {
													sedeSeleccionada = sede;
												}}
											/>
										{:else}
											<span class="block px-5 py-2 text-sm text-muted-foreground">
												No results found
											</span>
										{/each}
									</ComboboxContent>
								</Combobox>
							{/if}
							<label for="Seleccione cliente" class="input-label">
								Seleccione finalidad pedido
							</label>
							<Combobox
								items={finalidadesPedido}
								selected={{
									value: finalidadPedidoSeleccionado,
									label: finalidadPedidoSeleccionado,
								}}
							>
								<ComboboxInput placeholder="Seleccione..." />
								<ComboboxContent>
									{#each finalidadesPedido as finalidadPedido}
										<ComboboxItem
											value={finalidadPedido}
											label={finalidadPedido}
											on:click={() => {
												finalidadPedidoSeleccionado = finalidadPedido;
											}}
										/>
									{:else}
										<span class="block px-5 py-2 text-sm text-muted-foreground">
											No results found
										</span>
									{/each}
								</ComboboxContent>
							</Combobox>
							<div class="mt-4 flex flex-col items-start gap-2">
								<Boton
									variante="link verdeFagar"
									on:click={() => {
										productoSeleccionado = null;
										mostrarModalProductos = true;
										consultarProductos();
									}}
								>
									Agregar producto tipo principal
								</Boton>
								<Boton
									variante="link verdeFagar"
									on:click={() => {
										productoSeleccionado = null;
										mostrarModalProductosExternos = true;
										consultarProductosExternos();
									}}
								>
									Agregar producto tipo externo
								</Boton>
							</div>
							<br />
							<!--tabla que muestra los productos agregados-->
							{#if productosAgregados.length > 0}
								<div class="mb-4 overflow-y-auto rounded-lg pt-2">
									<Tabla>
										<Fila>
											<CeldaHeader>ID</CeldaHeader>
											<CeldaHeader>Producto</CeldaHeader>
											<CeldaHeader>Tipo</CeldaHeader>
											<CeldaHeader>Cant</CeldaHeader>
											<CeldaHeader>Valor</CeldaHeader>
											<CeldaHeader>Total</CeldaHeader>
											<CeldaHeader>Quitar</CeldaHeader>
										</Fila>

										{#each productosAgregados as productoAgregado}
											<Fila class="items-center">
												<Celda class="flex justify-center px-2 sm:px-4">
													{productoAgregado.id}
												</Celda>
												<Celda class="px-1 text-sm sm:px-4 sm:text-base">
													{productoAgregado.nombre}
												</Celda>
												<Celda class="px-1 text-sm sm:px-4 sm:text-base">
													{productoAgregado.tipo.charAt(0).toUpperCase() +
														productoAgregado.tipo.slice(1)}
												</Celda>
												<Celda class="px-1 text-start sm:px-4 sm:text-center">
													{productoAgregado.cantidad}
												</Celda>

												<Celda class="px-1 text-start sm:px-4 sm:text-center">
													{new Intl.NumberFormat('es-CO', {
														style: 'currency',
														currency: 'COP',
														minimumFractionDigits: 0,
														maximumFractionDigits: 0,
													}).format(productoAgregado.valor)}
												</Celda>
												<Celda class="px-1 text-start sm:px-4 sm:text-center">
													{new Intl.NumberFormat('es-CO', {
														style: 'currency',
														currency: 'COP',
														minimumFractionDigits: 0,
														maximumFractionDigits: 0,
													}).format(productoAgregado.cantidad * productoAgregado.valor)}
												</Celda>
												<Celda class="text-center">
													<button
														type="button"
														on:click={() => {
															productosAgregados = productosAgregados.filter(
																(producto) =>
																	!(
																		producto.id === productoAgregado.id &&
																		producto.tipo === productoAgregado.tipo
																	),
															);
														}}
													>
														<Eliminar tamano={20} />
													</button>
												</Celda>
											</Fila>
										{/each}
									</Tabla>
								</div>
								<div class="mt-3">
									<label for="w3review" class="mt-4">
										Total pedido:
										{new Intl.NumberFormat('es-CO', {
											style: 'currency',
											currency: 'COP',
											minimumFractionDigits: 0,
											maximumFractionDigits: 0,
										}).format(
											productosAgregados.reduce(
												(acc, producto) => acc + producto.cantidad * producto.valor,
												0,
											),
										)}
									</label>
								</div>
							{/if}
							<label for="w3review" class="mt-4">Comentarios generales:</label>
							<textarea
								bind:value={pedido.comentario}
								class="input-texto mt-2"
								id="w3review"
								name="w3review"
								rows="4"
								cols="50"
							/>
							<div class="mt-4">
								<Boton variante="principal" tipo="submit" cargando={estadoActual.creandoPedido}>
									Crear pedido
								</Boton>
							</div>
						</form>
					</TarjetaBody>
				</Tarjeta>
			{/if}

			{#if tabActivo === Tabs.consultarUltimosPedidos && pedido?.idVendedor}
				<Tarjeta class="max-h-[60vh] overflow-y-auto sm:w-full">
					<TarjetaHeader
						titulo={`Mis ultimos ${LIMITEULTIMOSPEDIDOS} pedidos`}
						class="sticky top-0"
					/>
					<TarjetaBody>
						{#if estadoActual.consultandoUltimosPedidos}
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
						<TarjetaHeader titulo={`Detalles Pedido id ID ${pedidoSeleccionado?.id}`}
						></TarjetaHeader>
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
											{clientes.find((c) => c.id === pedidoSeleccionado?.idCliente)?.razonSocial}
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
											{clientes.find((cliente) => cliente.id === pedidoSeleccionado?.idCliente)
												?.celular}
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
		</div>
	{/if}
</div>

<!--Modal para productos del tipo PRINCIPAL-->
<Modal
	open={mostrarModalProductos}
	onOpenChange={() => {
		mostrarModalProductos = !mostrarModalProductos;
	}}
>
	<ModalContent>
		<ModalHeader>Seleccione producto tipo principal</ModalHeader>
		{#if estadoActual.consultandoProductos}
			<PuntosCargando />
		{:else}
			<div class="w-full px-4">
				<div class="mt-4">
					<input
						class="input-texto mb-4 mt-4"
						type="text"
						placeholder="Filtrar productos"
						bind:value={nombreProductoBuscar}
					/>
					<div class="mt-4 h-60 overflow-y-auto sm:h-96">
						{#if productosFiltrados.length > 0}
							<table class="w-full">
								<thead class="sticky top-0 bg-white">
									<tr>
										<th class="px-4">ID</th>
										<th class="px-4">Producto</th>
									</tr>
								</thead>
								<tbody>
									{#each productosFiltrados as producto}
										<tr
											class={`${productoSeleccionado?.id === producto.id ? 'bg-lime-300 hover:bg-lime-300' : 'hover:bg-neutral-200'}  py-2 text-slate-600 hover:cursor-pointer hover:rounded-lg `}
											on:click={() => {
												productoSeleccionado = {
													id: producto.id,
													nombre: producto.nombre,
													cantidad: 0,
													cantidadEnvases: producto.cantidadEnvases,
													valor: 0,
													tipo: TiposProductos.principal,
													tipoAceite: producto.tipoAceite,
													peso: producto.peso,
												};
											}}
										>
											<td class="px-4">{producto.id}</td>
											<td class="px-4">{producto.nombre}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{:else}
							<div class="text-center">No hay coincidencias</div>
						{/if}
					</div>
				</div>
				{#if productoSeleccionado}
					<label for="cantidad" class="input-label mt-4">Cantidad</label>
					<input class="input-texto" bind:value={productoSeleccionado.cantidad} type="number" />

					<label for="valor" class="input-label mt-4">Valor unit (caja o bidon)</label>
					<input class="input-texto" bind:value={productoSeleccionado.valor} type="number" />
				{/if}
				<div class="mt-4">
					<Boton
						variante="link verdeFagar"
						on:click={() => {
							const productoYaAgregado = productosAgregados.some(
								(producto) =>
									producto.id === productoSeleccionado?.id &&
									producto.tipo === TiposProductos.principal,
							);
							if (!productoYaAgregado && productoSeleccionado) {
								if (productoSeleccionado.cantidad <= 0) {
									Swal.fire({
										icon: 'info',
										title: 'Cantidad no válida',
										text: 'La cantidad del producto debe ser mayor a 0',
									});
									return;
								}
								if (productoSeleccionado.valor <= 0) {
									Swal.fire({
										icon: 'info',
										title: 'Valor no válido',
										text: 'El valor del producto debe ser mayor a 0',
									});
									return;
								}

								if (!productoSeleccionado.cantidadEnvases) {
									Swal.fire({
										icon: 'info',
										title: 'Cantidad de envases no válida',
										text: 'El producto seleccionado no tiene parametrizado la cantidad de envases',
									});
									return;
								}
								productosAgregados = [...productosAgregados, productoSeleccionado];
								productoSeleccionado = null;
								mostrarModalProductos = false;
							} else {
								Swal.fire({
									icon: 'info',
									title: 'Producto ya agregado',
									text: 'El producto seleccionado ya fue agregado al pedido',
								});
							}
						}}
					>
						Agregar al pedido
					</Boton>
				</div>
			</div>
		{/if}
		<ModalFooter>
			<Boton variante="link rojo" on:click={() => (mostrarModalProductos = false)}>Cancelar</Boton>
		</ModalFooter>
	</ModalContent>
</Modal>

<!--Modal para productos del tipo externo-->
<Modal
	open={mostrarModalProductosExternos}
	onOpenChange={() => {
		mostrarModalProductosExternos = !mostrarModalProductosExternos;
	}}
>
	<ModalContent>
		<ModalHeader>Seleccione Producto Externo</ModalHeader>
		{#if estadoActual.consultandoProductosExternos}
			<PuntosCargando />
		{:else}
			<div class="w-full px-4">
				<div class="mt-4">
					<input
						class="input-texto mb-4 mt-4"
						type="text"
						placeholder="Filtrar productos"
						bind:value={nombreProductoExternoBuscar}
					/>
					<div class="mt-4 h-60 overflow-y-auto sm:h-96">
						{#if productosExternosFiltrados.length > 0}
							<table class="w-full">
								<thead class="sticky top-0 bg-white">
									<tr>
										<th class="px-4">ID</th>
										<th class="px-4">Producto</th>
										<th class="px-4">Existencias</th>
									</tr>
								</thead>
								<tbody>
									{#each productosExternosFiltrados as producto}
										<tr
											class={`${productoSeleccionado?.id === producto.id ? 'bg-lime-300 hover:bg-lime-300' : 'hover:bg-neutral-200'}  py-2 text-slate-600 hover:cursor-pointer hover:rounded-lg `}
											on:click={() => {
												productoSeleccionado = {
													id: producto.id,
													nombre: producto.nombre,
													cantidad: 0,
													cantidadEnvases: null, //los productos externos no llevan cantidad de envases
													valor: 0,
													tipo: TiposProductos.externo,
													tipoAceite: null,
													peso: producto.peso,
												};
												console.log('productoSeleccionado', productoSeleccionado);
											}}
										>
											<td class="px-4">{producto.id}</td>
											<td class="px-4">{producto.nombre}</td>
											<td class="px-4 text-center">{producto.existencias}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						{:else}
							<div class="text-center">No hay coincidencias</div>
						{/if}
					</div>
				</div>
				{#if productoSeleccionado}
					<label for="cantidad" class="input-label mt-4">Cantidad cajas</label>
					<input class="input-texto" bind:value={productoSeleccionado.cantidad} type="number" />

					<label for="valor" class="input-label mt-4">Valor unit caja</label>
					<input class="input-texto" bind:value={productoSeleccionado.valor} type="number" />
				{/if}
				<Boton
					variante="link verdeFagar"
					on:click={() => {
						//tiene que validarse el id pero tambien el tipo por que puede que se agregue un producto "PRINCIPAL" y "EXTERNO" con el mismo id
						const productoExiste = productosAgregados.some(
							(producto) =>
								producto.id === productoSeleccionado?.id &&
								producto.tipo === TiposProductos.externo,
						);
						if (!productoExiste && productoSeleccionado) {
							if (productoSeleccionado.cantidad <= 0) {
								Swal.fire({
									icon: 'info',
									title: 'Cantidad no válida',
									text: 'La cantidad del producto debe ser mayor a 0',
								});
								return;
							}
							if (productoSeleccionado.valor <= 0) {
								Swal.fire({
									icon: 'info',
									title: 'Valor no válido',
									text: 'El valor del producto debe ser mayor a 0',
								});
								return;
							}
							productosAgregados = [...productosAgregados, productoSeleccionado];
							productoSeleccionado = {
								id: 0,
								nombre: '',
								cantidad: 0,
								cantidadEnvases: 0,
								valor: 0,
								tipo: '',
								tipoAceite: '',
								peso: 0,
							};
							mostrarModalProductosExternos = false;
						} else {
							Swal.fire({
								icon: 'info',
								title: 'Producto ya agregado',
								text: 'El producto seleccionado ya fue agregado al pedido',
							});
						}
					}}
				>
					Agregar al pedido
				</Boton>
			</div>
		{/if}
		<ModalFooter>
			<Boton variante="link rojo" on:click={() => (mostrarModalProductosExternos = false)}>
				Cancelar
			</Boton>
		</ModalFooter>
	</ModalContent>
</Modal>

<style>
</style>
