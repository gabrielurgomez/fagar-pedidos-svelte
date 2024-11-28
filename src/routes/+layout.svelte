<script lang="ts">
	import './styles/app.css';
	import { logo } from '../lib/images/logo';
	import Swal from 'sweetalert2';
	import type { ProductoConsultado, ProductoExternoConsultado } from '../lib/types';
	import { Modal, ModalHeader, ModalContent, ModalFooter } from '$lib/components/Modal';
	import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '$lib/components/Combobox';
	import { Tarjeta, TarjetaHeader, TarjetaBody } from '$lib/components/Tarjeta';
	import { Boton } from '$lib/components/Boton';
	import { Tabla, CeldaHeader, Celda, Fila } from '$lib/components/Tabla';
	import IconoGuardar from '$lib/icons/Guardar.svelte';
	import PuntosCargando from '$lib/components/PuntosCargando.svelte';
	import Eliminar from '$lib/icons/Eliminar.svelte';
	import dayjs from 'dayjs';
	import type {
		clientes,
		sedesClientes,
	} from '@prisma/client';
	import type {PedidoConDetalle, ProductoAgregadoAlPedido} from '$lib/types';


	let pedido = {
		idCliente: 0,
		clienteSedeCiudad: '',
		clienteSedeDireccion: '',
		fechaEntrega: '',
		comentario: '',
		idVendedor: 0,
		estado: 'creado',
		finalidad: '',
	};

	let estadoActual = {
		validandoUsuario: false,
		consultandoProductos: false,
		creandoPedido: false,
		consultandoClientes: false,
		consultandoProductosExternos: false,
		consultandoUltimosPedidos: false,
	};

	let usuario = { numeroCedula: '', fechaExpedicionDocumento: '' };

	let productos: ProductoConsultado[] = [];
	let productosExternos: ProductoExternoConsultado[] = [];
	let ultimosPedidos: PedidoConDetalle[] = [];

	let pedidoSeleccionado: PedidoConDetalle = {
		id: 0,
		idVendedor: 0,
		idCliente: 0,
		clienteSedeCiudad: '',
		clienteSedeDireccion: '',
		creado: new Date(),
		fechaEntrega: new Date(),
		comentario: '',
		detallePedido: [],
		estado: '',
		motivoRechazo: '',
		finalidad: '',
	};

	let tabActivo = 'crear pedido';

	let vendedorLogueado = { id: 0, nombre: '' };

	type ClienteConSedes = clientes & { sedesClientes: sedesClientes[] };
	let clientes: ClienteConSedes[] = [];

	const consultarClientes = async () => {
		estadoActual.consultandoClientes = true;
		try {
			//console.log('Consultar clientes');
			let rta = await fetch('/api/clientes', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			clientes = await rta.json();
			//console.log('clientes', clientes);
			estadoActual.consultandoClientes = false;
			return clientes;
			//productosFiltrados = productos;
		} catch (error) {
			console.error('Error al consultar clientes:', error);
		}
	};

	const consultarUltimosPedidos = async () => {
		estadoActual.consultandoUltimosPedidos = true;
		try {
			let rta = await fetch(
				`/api/pedidos?finalidad=recientes&buscarpor=id&limiteregistros=300&ordenadopor=id&condicionordenado=desc&idvendedor=${vendedorLogueado.id}`,
				{
					method: 'GET',
					cache: 'no-cache',
					headers: { 'Content-Type': 'application/json' },
				},
			);
			if (rta.status === 200) {
				ultimosPedidos = await rta.json();
				//console.log('ultimosPedidos', ultimosPedidos);
			}

			estadoActual.consultandoUltimosPedidos = false;
		} catch (error) {
			console.error('Error al consultar clientes:', error);
		}
	};

	let clienteSeleccionado = {
		id: 0,
		razonSocial: '',
		sedesClientes: [] as sedesClientes[],
	};
	let sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };

	const consultarProductos = async () => {
		estadoActual.consultandoProductos = true;
		try {
			console.log('Consultar productos');
			let rta = await fetch('/api/productos', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			productos = await rta.json();
			//console.log('productos', productos);
			estadoActual.consultandoProductos = false;
			//return productos;
			//productosFiltrados = productos;
		} catch (error) {
			console.error('Error al consultar vendedores:', error);
		}
	};

	const consultarProductosExternos = async () => {
		estadoActual.consultandoProductosExternos = true;
		try {
			//console.log('Consultar productos externos');
			let rta = await fetch('/api/productosExternos', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			productosExternos = await rta.json();
			//console.log('productosExternos', productosExternos);
			estadoActual.consultandoProductosExternos = false;
		} catch (error) {
			console.error('Error al consultar productos externos:', error);
		}
	};

	let productoSeleccionado: ProductoAgregadoAlPedido = {
		id: 0,
		nombre: '',
		cantidad: 0,
		cantidadEnvases: 0,
		valor: 0,
		tipo: '',
		tipoAceite: '',
		peso: 0
	};

	let productosAgregados: ProductoAgregadoAlPedido[] = [];

	const validarUsuario = async () => {
		console.log('se validará el usuario', usuario);
		if (usuario.numeroCedula === '') {
			Swal.fire({ icon: 'info', title: 'Valide datos', text: 'Debe digitar el número de cedula' });
			return;
		}
		if (usuario.fechaExpedicionDocumento === '') {
			Swal.fire({
				icon: 'info',
				title: 'Valide datos',
				text: 'Debe seleccionar la fecha de expedicion del documento',
			});
			return;
		}
		//console.log('se validará el usuario', usuario);
		estadoActual.validandoUsuario = true;

		const rtaJson = await fetch(
			`api/vendedor?cedula=${usuario.numeroCedula}&fechaExpedicionDocumento=${usuario.fechaExpedicionDocumento}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			},
		);
		if (rtaJson.status === 200) {
			const infoVendedor = await rtaJson.json();
			console.log('infoVendedor logueado', infoVendedor);
			vendedorLogueado.id = infoVendedor.id;
			pedido.idVendedor = infoVendedor.id;
			vendedorLogueado.nombre = infoVendedor.nombre;
			//como ya se validó el usuario, se envia a consultar productos pues de una vez queda lista la card para crear producto
			tabActivo = 'crear pedido';
			consultarProductos();
			consultarProductosExternos();
			consultarClientes();
		}

		if (rtaJson.status === 404) {
			Swal.fire({
				icon: 'info',
				title: 'Usuario no encontrado',
				text: 'El usuario no se encuentra registrado en la base de datos',
			});
		}
		estadoActual.validandoUsuario = false;
	};

	const crearPedido = async () => {
		console.clear();
		console.log('se creará el pedido', pedido);
		if (pedido.fechaEntrega === '') {
			Swal.fire({
				icon: 'info',
				title: 'Fecha de entrega',
				text: 'Debe seleccionar la fecha de entrega del pedido',
			});
			return;
		}

		if (clienteSeleccionado.id === 0) {
			Swal.fire({
				icon: 'info',
				title: 'Cliente no seleccionado',
				text: 'Debe seleccionar un cliente para el pedido',
			});
			return;
		}
		pedido.idCliente = clienteSeleccionado.id;

		if (sedeSeleccionada.id === 0) {
			Swal.fire({
				icon: 'info',
				title: 'Sede no seleccionada',
				text: 'Debe seleccionar una sede para el pedido',
			});
			return;
		}

		if (finalidadPedidoSeleccionado.id === 0) {
			Swal.fire({
				icon: 'info',
				title: 'Finalidad no seleccionada',
				text: 'Debe seleccionar una finalidad para el pedido',
			});
			return;
		}

		pedido.clienteSedeCiudad = sedeSeleccionada.ciudad;
		pedido.clienteSedeDireccion = sedeSeleccionada.direccion;
		pedido.finalidad = finalidadPedidoSeleccionado.nombre;

		if (productosAgregados.length === 0) {
			Swal.fire({
				icon: 'info',
				title: 'No hay productos',
				text: 'Debe agregar al menos un producto al pedido',
			});
			return;
		}
		console.log('Se creará el pedido', pedido);
		console.log('con los productos', productosAgregados);

		estadoActual.creandoPedido = true;

		const rtaPedidoJson = await fetch('/api/pedido', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				...pedido,
				productos: productosAgregados,
				nombreVendedor: vendedorLogueado.nombre,
			}),
		});
		console.log('rtaPedidoJson', rtaPedidoJson);
		if (rtaPedidoJson.status === 201) {
			let rta = await rtaPedidoJson.json();
			console.log('rta', rta);
			Swal.fire({
				icon: 'success',
				title: 'Creado',
				text: rta.message,
			});
			productosAgregados = [];
			pedido = {
				idCliente: 0,
				clienteSedeCiudad: '',
				clienteSedeDireccion: '',
				fechaEntrega: '',
				comentario: '',
				idVendedor: 0,
				estado: 'creado',
				finalidad: '',
			};
			sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };
			clienteSeleccionado = { id: 0, razonSocial: '', sedesClientes: [] };
		} else {
			let rtaError = await rtaPedidoJson.json();
			Swal.fire({
				icon: 'error',
				title: 'Error 500 en el servidor',
				text: rtaError,
			});
		}

		estadoActual.creandoPedido = false;
	};

	let nombreProductoBuscar = '';
	let nombreProductoExternoBuscar = '';
	/*
	SI FUERA COMBOBOX
	let touchedInputProductos = false;
	$: productosFiltrados =
		inputValue && touchedInput
			? productos.filter((producto) => producto.nombre.includes(nombreProductoBuscar.toLowerCase()))
			: productos;
	*/

	$: productosFiltrados = productos.filter((producto) => {
		return producto.nombre.toLowerCase().includes(nombreProductoBuscar.toLowerCase());
	});

	$: productosExternosFiltrados = productosExternos.filter((producto) => {
		return producto.nombre.toLowerCase().includes(nombreProductoExternoBuscar.toLowerCase());
	});

	let finalidadesPedido = [
		{ id: 1, nombre: 'factura' },
		{ id: 2, nombre: 'cotizacion' },
	];
	let finalidadPedidoSeleccionado = { id: 0, nombre: '' };

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
</script>

<div class={`contenedorPrincipal`}>
	<!--Modal para productos del tipo principal-->
	<Modal
		open={mostrarModalProductos}
		onOpenChange={() => {
			mostrarModalProductos = true;
		}}
	>
		<ModalContent>
			<ModalHeader>Seleccione Producto</ModalHeader>
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
						<div class="h-60 sm:h-96 overflow-y-auto mt-4">
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
												class={`${productoSeleccionado.id === producto.id ? 'bg-lime-300' : ''}  py-2 hover:cursor-pointer hover:rounded-lg hover:bg-neutral-200 text-slate-600`}
												on:click={() => {
													productoSeleccionado.id = producto.id;
													productoSeleccionado.nombre = producto.nombre;
													productoSeleccionado.cantidadEnvases = producto.cantidadEnvases;
													productoSeleccionado.tipo = 'principal';
													productoSeleccionado.tipoAceite = producto.tipoAceite;
													productoSeleccionado.peso = producto.peso;
													//mostrarModalProductos = false;
													console.log('productoSeleccionado', productoSeleccionado);
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
					<label for="cantidad" class="input-label mt-4">Cantidad cajas</label>
					<input class="input-texto" bind:value={productoSeleccionado.cantidad} type="number" />

					<label for="valor" class="input-label mt-4">Valor unit caja</label>
					<input class="input-texto" bind:value={productoSeleccionado.valor} type="number" />
					<Boton
						variante="link verdeFagar"
						on:click={() => {
							console.log('se agregará el producto', productoSeleccionado);

							const productoExiste = productosAgregados.some(
								(producto) =>
									producto.id === productoSeleccionado.id && producto.tipo === 'principal',
							);
							if (!productoExiste) {
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
								console.log('productosAgregados', productosAgregados);
								productoSeleccionado = {
									id: 0,
									nombre: '',
									cantidad: 0,
									cantidadEnvases: 0,
									valor: 0,
									tipo: '',
									tipoAceite: '',
									peso: 0
								};
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
			{/if}
			<ModalFooter>
				<Boton variante="link rojo" on:click={() => (mostrarModalProductos = false)}>
					Cancelar
				</Boton>
			</ModalFooter>
		</ModalContent>
	</Modal>

	<!--Modal para productos del tipo externo-->
	<Modal
		open={mostrarModalProductosExternos}
		onOpenChange={() => {
			mostrarModalProductosExternos = true;
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
						<div class="h-60 sm:h-96 overflow-y-auto mt-4">
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
												class={`${productoSeleccionado.id === producto.id ? 'bg-lime-300' : ''}  py-2 hover:cursor-pointer hover:rounded-lg hover:bg-neutral-200 text-slate-600`}
												on:click={() => {
													productoSeleccionado.id = producto.id;
													productoSeleccionado.nombre = producto.nombre;
													productoSeleccionado.cantidadEnvases = null; //los productos externos no llevan cantidad de envases
													productoSeleccionado.tipoAceite = '';
													productoSeleccionado.tipo = 'externo';
													productoSeleccionado.peso = 0;
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
					<label for="cantidad" class="input-label mt-4">Cantidad cajas</label>
					<input class="input-texto" bind:value={productoSeleccionado.cantidad} type="number" />

					<label for="valor" class="input-label mt-4">Valor unit caja</label>
					<input class="input-texto" bind:value={productoSeleccionado.valor} type="number" />
					<Boton
						variante="link verdeFagar"
						on:click={() => {
							console.log('se agregará el producto', productoSeleccionado);

							//tiene que validarse el id pero tambien el tipo por que puede que se agregue un producto "principal" y "externo" con el mismo id
							const productoExiste = productosAgregados.some(
								(producto) =>
									producto.id === productoSeleccionado.id && producto.tipo === 'externo',
							);
							if (!productoExiste) {
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
								console.log('productosAgregados', productosAgregados);
								productoSeleccionado = {
									id: 0,
									nombre: '',
									cantidad: 0,
									cantidadEnvases: 0,
									valor: 0,
									tipo: '',
									tipoAceite: '',
									peso: 0
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

	<div class="flex flex-col items-center">
		<img alt="logo" src={logo} class="w-40 h-25 sm:w-80 sm:h-45" />
	</div>
	{#if vendedorLogueado.id === 0}
		<Tarjeta>
			<TarjetaHeader titulo={'Validación de usuario'} />
			<TarjetaBody>
				<form class="flex flex-col" on:submit|preventDefault={validarUsuario}>
					<label for="usuario" class="input-label">Numero cedula</label>
					<input class="input-texto" bind:value={usuario.numeroCedula} type="text" />

					<label for="contrasena" class="input-label mt-4">Fecha expedición</label>
					<input class="input-texto" bind:value={usuario.fechaExpedicionDocumento} type="date" />
					<Boton
						class="mt-4"
						tipo="submit"
						cargando={estadoActual.validandoUsuario}
						variante={'principal'}
					>
						Validar
					</Boton>
				</form>
			</TarjetaBody>
		</Tarjeta>
	{:else}
		<div>
			<h1 class="text-2xl text-center">{vendedorLogueado.nombre}</h1>
		</div>

		<div class="fila-1columna mt-8">
			<div class="contenedorTabs">
				<div class={`tab ${tabActivo === 'crear pedido' ? 'tab-activo' : ''}`}>
					<IconoGuardar tamano={20} />
					<button
						on:click={() => {
							tabActivo = 'crear pedido';
							consultarProductos();
						}}
					>
						Crear
					</button>
				</div>

				<button
					on:click={() => {
						tabActivo = 'consultar ultimos pedidos';
						consultarUltimosPedidos();
					}}
					class={`tab ${tabActivo === 'consultar ultimos pedidos' ? 'tab-activo' : ''}`}
				>
					Ultimos Pedidos
				</button>
			</div>
		</div>

		{#if tabActivo === 'crear pedido'}
			<Tarjeta>
				<TarjetaHeader titulo={'Crear pedido'}></TarjetaHeader>
				<TarjetaBody>
					<form method="POST" on:submit|preventDefault={crearPedido}>
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
												sedesClientes: cliente.sedesClientes,
											};
											console.log('clienteSeleccionado', clienteSeleccionado);
										}}
									></ComboboxItem>
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
												console.log('sedeSeleccionada', sedeSeleccionada);
											}}
										></ComboboxItem>
									{:else}
										<span class="block px-5 py-2 text-sm text-muted-foreground">
											No results found
										</span>
									{/each}
								</ComboboxContent>
							</Combobox>
						{/if}
						<label for="Seleccione cliente" class="input-label">Seleccione finalidad pedido</label>
						<Combobox
							items={finalidadesPedido}
							selected={{
								value: finalidadPedidoSeleccionado.id,
								label: finalidadPedidoSeleccionado.nombre.toUpperCase(),
							}}
						>
							<ComboboxInput placeholder="Seleccione..." />
							<ComboboxContent>
								{#each finalidadesPedido as finalidadPedido (finalidadPedido.id)}
									<ComboboxItem
										value={finalidadPedido.nombre}
										label={finalidadPedido.nombre.toUpperCase()}
										on:click={() => {
											finalidadPedidoSeleccionado = finalidadPedido;
											console.log('finalidadPedidoSeleccionado', finalidadPedidoSeleccionado);
										}}
									/>
								{:else}
									<span class="block px-5 py-2 text-sm text-muted-foreground">
										No results found
									</span>
								{/each}
							</ComboboxContent>
						</Combobox>
						<div class="flex flex-col gap-2 items-start mt-4">
							<Boton
								variante="link verdeFagar"
								on:click={() => {
									console.log('se mostrará el modal para productos principales');
									consultarProductos();
									mostrarModalProductos = true;
								}}
							>
								Agregar producto tipo principal
							</Boton>
							<Boton
								variante="link verdeFagar"
								on:click={() => {
									console.log('se mostrará el modal para productos externos');
									consultarProductosExternos();
									mostrarModalProductosExternos = true;
								}}
							>
								Agregar producto tipo externo
							</Boton>
						</div>
						<!-- ESTO ES SI FUERA A IMPLEMENTAR LA LISTA DE PRODUCTOS A AGREGAR EN COMBOBOX Y NO EN MODAL
							<div class="border-t my-4"></div>
							<label for="Seleccione cliente">Agregue productos</label>
							
							{#if estadoActual.consultandoProductos}
								<PuntosCargando />
							{:else}
								<Combobox
									items={productosFiltrados}
									bind:nombreProductoBuscar
									bind:touchedInputProductos
								>
									<ComboboxInput placeholder="Seleccione..." />
									<ComboboxContent>
										{#each productosFiltrados as producto}
											<ComboboxItem
												value={producto.id}
												label={producto.nombre}
												on:click={() => {
													productoSeleccionado.id = producto.id;
													productoSeleccionado.nombre = producto.nombre;
													//mostrarModalProductos = false;
													console.log('productoSeleccionado', productoSeleccionado);
												}}
											>
												ID #{producto.id}-{producto.nombre}
											</ComboboxItem>
										{/each}
									</ComboboxContent>
								</Combobox>
							{/if}
					
						<label for="cantidad" class="input-label mt-4">Cantidad cajas</label>
						<input class="input-texto" bind:value={productoSeleccionado.cantidad} type="number" />

						<label for="valor" class="input-label mt-4">Valor unit caja</label>
						<input class="input-texto" bind:value={productoSeleccionado.valor} type="number" />
						<Boton
							variante="link verdeFagar"
							onClick={() => {
								console.log('se agregará el producto', productoSeleccionado);

								const productoExiste = productosAgregados.some(
									(producto) => producto.id === productoSeleccionado.id,
								);
								if (!productoExiste) {
									if (productoSeleccionado.cantidad <= 0) {
										Swal.fire({
											icon: 'info',
											title: 'Cantidad no válida',
											text: 'La cantidad del producto debe ser mayor a 0',
										});
										return;
									}
									productosAgregados = [...productosAgregados, productoSeleccionado];
									console.log('productosAgregados', productosAgregados);
									productoSeleccionado = { id: 0, nombre: '', cantidad: 0, valor: 0 };
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
						-->

						<br />
						<!--tabla que muestra los productos agregados-->
						{#if productosAgregados.length > 0}
							<div class="mb-4 rounded-lg pt-2">
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
										<Fila>
											<Celda class="px-2 sm:px-4 flex justify-center">{productoAgregado.id}</Celda>
											<Celda class="px-1 sm:px-4 text-sm sm:text-base">
												{productoAgregado.nombre}
											</Celda>
											<Celda class="px-1 sm:px-4 text-sm sm:text-base">
												{productoAgregado.tipo.charAt(0).toUpperCase() +
													productoAgregado.tipo.slice(1)}
											</Celda>
											<Celda class="px-1 sm:px-4 sm:text-center text-start">
												{productoAgregado.cantidad}
											</Celda>

											<Celda class="px-1 sm:px-4 sm:text-center text-start">
												{new Intl.NumberFormat('es-CO', {
													style: 'currency',
													currency: 'COP',
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												}).format(productoAgregado.valor)}
											</Celda>
											<Celda class="px-1 sm:px-4 sm:text-center text-start">
												{new Intl.NumberFormat('es-CO', {
													style: 'currency',
													currency: 'COP',
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												}).format(productoAgregado.cantidad * productoAgregado.valor)}
											</Celda>
											<Celda class="flex justify-center px-4 sm:px-0">
												<button
													type="button"
													on:click={() => {
														productosAgregados = productosAgregados.filter(
															(producto) =>
																producto.id !== productoAgregado.id &&
																producto.tipo !== productoAgregado.tipo,
														);
													}}
												>
													<Eliminar tamano={20}></Eliminar>
												</button>
											</Celda>
										</Fila>
									{/each}
								</Tabla>
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
						></textarea>

						<Boton
							variante="principal"
							tipo="submit"
							cargando={estadoActual.creandoPedido}
							class="mt-4"
						>
							Crear pedido
						</Boton>
					</form>
				</TarjetaBody>
			</Tarjeta>
		{/if}

		{#if tabActivo === 'consultar ultimos pedidos'}
			<Tarjeta class="sm:w-full">
				<TarjetaHeader titulo={'Mis ultimos 300 pedidos'}></TarjetaHeader>
				<TarjetaBody>
					{#if estadoActual.consultandoUltimosPedidos}
						<PuntosCargando />
					{:else if ultimosPedidos.length > 0}
						<Tabla>
							<Fila>
								<CeldaHeader>ID</CeldaHeader>
								<CeldaHeader>Estado</CeldaHeader>
								<CeldaHeader>Fecha creado</CeldaHeader>
								<CeldaHeader>Fecha entrega</CeldaHeader>
								<CeldaHeader>Comentario</CeldaHeader>
							</Fila>
							{#each ultimosPedidos as pedido}
								<Fila>
									<Celda>{pedido.id}</Celda>

									<Celda>
										{#if pedido.estado === 'creado'}
											<div class="font-bold">{pedido.estado.toUpperCase()}</div>
										{/if}
										{#if pedido.estado === 'aprobado'}
											<div class="text-green-600 font-bold">{pedido.estado.toUpperCase()}</div>
										{/if}
										{#if pedido.estado === 'rechazado'}
											<div class="text-red-500 font-bold">{pedido.estado.toUpperCase()}</div>
										{/if}
									</Celda>

									<Celda>{dayjs(pedido.creado).format('DD-MMM-YYYY')}</Celda>
									<Celda>{dayjs(pedido.fechaEntrega).format('DD-MMM-YYYY')}</Celda>
									<Celda>{pedido.comentario}</Celda>
									<Celda>
										<Boton
											variante="link verdeFagar"
											on:click={() => {
												pedidoSeleccionado = pedido;
												console.log('pedidoSeleccionado', pedidoSeleccionado);
											}}
										>
											Ver detalle
										</Boton>
									</Celda>
								</Fila>
							{/each}
						</Tabla>
					{:else}
						<div class="text-center">No hay pedidos</div>
					{/if}
				</TarjetaBody>
			</Tarjeta>
			{#if pedidoSeleccionado.id > 0}
				<Tarjeta class="sm:w-full">
					<TarjetaHeader titulo={`Detalles Pedido id ID ${pedidoSeleccionado?.id}`}></TarjetaHeader>
					<TarjetaBody>
						<div class="flex sm:flex-row flex-col justify-start w-full">
							<div class="flex flex-col sm:flex-row justify-between w-full gap-2">
								<div class="border p-4 rounded-lg flex flex-col">
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Fecha creado:</div>
										{dayjs(pedidoSeleccionado?.creado).format('DD-MMM-YYYY')}
									</div>
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Fecha entrega:</div>
										{dayjs(pedidoSeleccionado?.fechaEntrega).format('DD-MMM-YYYY')}
									</div>
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Finalidad:</div>
										{pedidoSeleccionado?.finalidad.charAt(0).toUpperCase() +
											pedidoSeleccionado?.finalidad.slice(1)}
									</div>
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Estado:</div>
										{#if pedidoSeleccionado.estado === 'creado'}
											<div class="font-bold">{pedidoSeleccionado?.estado.toUpperCase()}</div>
										{/if}
										{#if pedidoSeleccionado.estado === 'aprobado'}
											<div class="text-green-600 font-bold">
												{pedidoSeleccionado?.estado.toUpperCase()}
											</div>
										{/if}
										{#if pedidoSeleccionado.estado === 'rechazado'}
											<div class="text-red-500 font-bold">
												{pedidoSeleccionado?.estado.toUpperCase()}
											</div>
										{/if}
									</div>
								</div>
								<div class="border p-4 rounded-lg flex flex-col">
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Cliente:</div>
										{clientes.find((c) => c.id === pedidoSeleccionado?.idCliente)?.nombreComercial}
									</div>
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Sede:</div>
										{pedidoSeleccionado?.clienteSedeDireccion}
									</div>
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Ciudad:</div>
										{pedidoSeleccionado?.clienteSedeCiudad}
									</div>
									<div class="flex sm:flex-row flex-col">
										<div class="font-bold me-2">Celular:</div>
										{clientes.find((cliente) => cliente.id === pedidoSeleccionado?.idCliente)
											?.celular}
									</div>
								</div>
							</div>
						</div>
						<div class="border py-4 rounded-lg w-full">
							<Tabla>
								<thead>
									<Fila>
										<CeldaHeader>Producto</CeldaHeader>
										<CeldaHeader>Cantidad</CeldaHeader>
										<CeldaHeader>Total Unds</CeldaHeader>
										<CeldaHeader>Valor</CeldaHeader>
										<CeldaHeader>Total</CeldaHeader>
									</Fila>
								</thead>
								<tbody>
									{#each pedidoSeleccionado.detallePedido as detalle}
										<Fila>
											<Celda>{productos.find((p) => detalle.idProducto === p.id)?.nombre}</Celda>
											<Celda>{detalle.cantidad}</Celda>
											<Celda>
												{detalle.cantidadEnvases ? detalle.cantidad * detalle.cantidadEnvases : '-'}
											</Celda>
											<Celda>
												{new Intl.NumberFormat('es-CO', {
													style: 'currency',
													currency: 'COP',
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												}).format(detalle.valor)}
											</Celda>
											<Celda>
												{new Intl.NumberFormat('es-CO', {
													style: 'currency',
													currency: 'COP',
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												}).format(detalle.valor * detalle.cantidad)}
											</Celda>
										</Fila>
									{/each}
								</tbody>
							</Tabla>
						</div>
						<div class="flex mt-2 flex-col gap-2 me-2 p-4 border rounded-lg w-full">
							<div class="flex flex-col sm:flex-row sm:justify-between">
								<div class="flex sm:flex-row flex-col sm:items-center sm:gap-2">
									<div class="font-bold">Comentario:</div>
									{pedidoSeleccionado.comentario ? pedidoSeleccionado.comentario : 'Ninguno'}
								</div>
								<div
									class="w-full flex sm:flex-row flex-col sm:justify-end items-start mt-2 sm:mt-0"
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
							<div class="flex sm:gap-2 flex-col sm:flex-row">
								<div class="text-red-500 font-bold">Motivo Rechazo:</div>
								{pedidoSeleccionado.motivoRechazo ? pedidoSeleccionado.motivoRechazo : 'Ninguno'}
							</div>
						</div>
					</TarjetaBody>
				</Tarjeta>
			{/if}
		{/if}

		<Boton
			class="sm:w-1/4 w-1/2"
			variante="rojo"
			on:click={() => {
				vendedorLogueado = { id: 0, nombre: '' };
				productos = [];
				productosFiltrados = [];
				tabActivo = '';
			}}
		>
			Cerrar sesión
		</Boton>
	{/if}

	<!--slot no se esta usando, es para que no de advertencia-->
	<slot />
</div>

<style>
</style>
