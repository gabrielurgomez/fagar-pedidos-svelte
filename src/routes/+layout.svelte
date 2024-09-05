<script lang="ts">
	import './styles/app.css';
	//import IconoGuardar from '$lib/icons/Guardar.svelte';
	import { logo } from '../lib/images/logo';
	import Swal from 'sweetalert2';
	import type { ProductoConsultado } from '../lib/types';
	import { Modal, ModalHeader, ModalBody, ModalFooter } from '$lib/components/Modal';
	import { Tarjeta, TarjetaHeader, TarjetaBody } from '$lib/components/Tarjeta';
	import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '$lib/components/Combobox';
	import { Boton } from '$lib/components/Boton';
	import PuntosCargando from '$lib/components/PuntosCargando.svelte';
	import Eliminar from '$lib/icons/Eliminar.svelte';
	import type { clientes, sedesClientes } from '@prisma/client';

	/*const setTabActivo = (tab: string) => {
		tabActivo = tab;
	};*/

	type ProductoAgregado = { id: number; nombre: string; cantidad: number; valor: number };

	let estadoActual = {
		validandoUsuario: false,
		consultandoProductos: false,
		creandoPedido: false,
		consultandoClientes: false,
	};
	let usuario = { numeroCedula: '13177972', fechaExpedicionDocumento: '2003-05-14' };
	let productos: ProductoConsultado[] = [];
	let nombreProductoBuscar = '';

	let tabActivo = 'crear pedido';
	let mostrarModalProductos = false;

	let vendedorLogueado = { id: 0, nombre: '' };

	let clientes: clientes[] = [];
	const consultarClientes = async () => {
		estadoActual.consultandoClientes = true;
		try {
			console.log('Consultar clientes');
			let rta = await fetch('/api/clientes', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			clientes = await rta.json();
			console.log('clientes', clientes);
			estadoActual.consultandoClientes = false;
			return clientes;
			//productosFiltrados = productos;
		} catch (error) {
			console.error('Error al consultar clientes:', error);
		}
	};

	let clienteSeleccionado = { id: 0, razonSocial: '' };

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

	let pedido = { fechaEntrega: '', comentario: '', idVendedor: 0 };

	let productoSeleccionado: ProductoAgregado = { id: 0, nombre: '', cantidad: 0, valor: 0 };
	let productosAgregados: ProductoAgregado[] = [];

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
		if (pedido.fechaEntrega === '') {
			Swal.fire({
				icon: 'info',
				title: 'Fecha de entrega',
				text: 'Debe seleccionar la fecha de entrega del pedido',
			});
			return;
		}
		if (productosAgregados.length === 0) {
			Swal.fire({
				icon: 'info',
				title: 'No hay productos',
				text: 'Debe agregar al menos un producto al pedido',
			});
			return;
		}
		//console.log('Se creará el pedido', pedido);
		//console.log('con los productos', productosAgregados);

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

		//console.log('rtaPedidoJson', rtaPedidoJson);

		if (rtaPedidoJson.status === 201) {
			let rta = await rtaPedidoJson.json();
			Swal.fire({
				icon: 'success',
				title: 'Pedido creado',
				text: rta.message,
			});
			productosAgregados = [];
			pedido = { fechaEntrega: '', comentario: '', idVendedor: 0 };
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

	$: productosFiltrados = productos.filter((producto) => {
		return producto.nombre.toLowerCase().includes(nombreProductoBuscar.toLowerCase());
	});

	let inputValue = '';
	let touchedInput = false;
	$: clientesFiltrados =
		inputValue && touchedInput
			? clientes.filter((cliente) => cliente.razonSocial.includes(inputValue.toLowerCase()))
			: clientes;
</script>

<div class={`contenedorPrincipal`}>
	{#if mostrarModalProductos}
		<Modal>
			<ModalHeader titulo={'Seleccione producto'}>Seleccione Producto</ModalHeader>
			<ModalBody>
				<input
					class="input-texto mb-4"
					type="text"
					placeholder="Filtrar productos"
					bind:value={nombreProductoBuscar}
				/>

				{#if estadoActual.consultandoProductos}
					<PuntosCargando />
				{:else}
					<div class="overflow-y-auto mt-4 w-full flex h-1/2 border rounded-lg">
						{#if productosFiltrados.length > 0}
							<table>
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
							<div>No hay coincidencias</div>
						{/if}
					</div>

					<div class="w-1/2 mt-2 flex-col">
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
					</div>
				{/if}
			</ModalBody>
			<ModalFooter>
				<Boton variante="link rojo" onClick={() => (mostrarModalProductos = false)}>Cancelar</Boton>
			</ModalFooter>
		</Modal>
	{/if}

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
						onClick={() => console.log('')}
						tipo={'submit'}
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
		<!--
		POR AHORA NO HABRÁ CONTENEDOR DE TABS YA QUE SOLO NECESITAMOS QUE EL VENDEDOR CREE EL PEDIDO
			<div class="fila-1columna mt-8">
				<div class="contenedorTabs">
					<div class={`tab ${tabActivo === 'crear pedido' ? 'tab-activo' : ''}`}>
						<IconoGuardar tamano={20} />
						<button
							on:click={() => {
								setTabActivo('crear pedido');
								consultarProductos();
							}}
						>
							Crear
						</button>
					</div>

					<button
						on:click={() => {
							setTabActivo('consultar pedidos');
							//consultarCiudades();
						}}
						class={`tab ${tabActivo === 'consultar' ? 'tab-activo' : ''}`}
					>
						Consultar
					</button>
				</div>
			</div>
		-->
		{#if tabActivo === 'crear pedido'}
			<Tarjeta>
				<TarjetaHeader titulo={'Crear pedido'}></TarjetaHeader>
				<TarjetaBody>
					<form method="POST" on:submit|preventDefault={crearPedido}>
						<label for="fecha de entrega" class="input-label">Fecha de entrega</label>
						<input bind:value={pedido.fechaEntrega} class="input-texto" type="date" />
						<label for="Seleccione cliente">Cliente</label>
						<Combobox items={clientesFiltrados} bind:inputValue bind:touchedInput>
							<ComboboxInput placeholder="Seleccione..." />
							<ComboboxContent>
								{#each clientesFiltrados as cliente (cliente.id)}
									<ComboboxItem
										value={cliente.id}
										label={cliente.razonSocial}
										on:click={() => {
											clienteSeleccionado = cliente;
											console.log('clienteSeleccionado', clienteSeleccionado);
										}}
									>
										{cliente.razonSocial}
									</ComboboxItem>
								{:else}
									<span class="block px-5 py-2 text-sm text-muted-foreground">
										No results found
									</span>
								{/each}
							</ComboboxContent>
						</Combobox>
						<Boton
							variante="link verdeFagar"
							onClick={() => {
								console.log('se mostrará el modal');
								consultarProductos();
								mostrarModalProductos = true;
							}}
						>
							Agregar producto
						</Boton>
						<br />
						<!--tabla que muestra los productos agregados-->
						{#if productosAgregados.length > 0}
							<div class="mb-4 border rounded-lg pt-2">
								<table class="mb-4">
									<tr>
										<th class="px-2 sm:px-4">ID</th>
										<th class="px-1 sm:px-4 sm:text-center text-start">Producto</th>
										<th class="px-4 hidden sm:flex">Cantidad</th>
										<th class="px-1 sm:hidden">Cant</th>
										<th class="px-2 sm:px-4">Valor</th>
										<th class="px-1 sm:px-4 hidden sm:table-cell">Quitar</th>
									</tr>

									{#each productosAgregados as productoAgregado}
										<tr>
											<td class="px-2 sm:px-4 flex justify-center">{productoAgregado.id}</td>
											<td class="px-1 sm:px-4 text-sm sm:text-base">{productoAgregado.nombre}</td>
											<td class="px-1 sm:px-4 sm:text-center text-start">
												{productoAgregado.cantidad}
											</td>
											<td class="px-1 sm:px-4 sm:text-center text-start">
												{new Intl.NumberFormat('es-CO', {
													style: 'currency',
													currency: 'COP',
													minimumFractionDigits: 0,
													maximumFractionDigits: 0,
												}).format(productoAgregado.valor)}
											</td>
											<td class="flex justify-center px-4 sm:px-0">
												<button
													on:click={() => {
														productosAgregados = productosAgregados.filter(
															(producto) => producto.id !== productoAgregado.id,
														);
													}}
												>
													<Eliminar tamano={20}></Eliminar>
												</button>
											</td>
										</tr>
									{/each}
								</table>
							</div>
						{/if}
						<label for="w3review" class="mt-4">Comentarios generales:</label>
						<textarea
							bind:value={pedido.comentario}
							class="input-texto"
							id="w3review"
							name="w3review"
							rows="4"
							cols="50"
						></textarea>

						<Boton
							variante="principal"
							tipo="submit"
							cargando={estadoActual.creandoPedido}
							onClick={() => {
								console.log('se creará el pedido');
							}}
						>
							Crear pedido
						</Boton>
					</form>
				</TarjetaBody>
			</Tarjeta>
		{/if}

		<Boton
			variante={'rojo'}
			onClick={() => {
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
