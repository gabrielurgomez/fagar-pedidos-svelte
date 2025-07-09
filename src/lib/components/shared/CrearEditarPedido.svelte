<script lang="ts">
	import { Tarjeta, TarjetaHeader, TarjetaBody } from '$lib/components/Tarjeta';
	import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem } from '$lib/components/Combobox';
	import { Boton } from '$lib/components/Boton';
	import { Tabla, Fila, Celda, CeldaHeader } from '$lib/components/Tabla';
	import Eliminar from '$lib/icons/Eliminar.svelte';
	import type { ProductoConsultado } from '$lib/types/producto.type';
	import { Modal, ModalHeader, ModalContent, ModalFooter } from '$lib/components/Modal';
	import type { Cliente } from '$lib/types/cliente.type';
	import type {
		PedidoCrear,
		FinalidadesPedidoConSeleccione,
		detallePedidoCrear,
	} from '$lib/types/pedido.type';
	import type { ProductoExternoConsultado } from '$lib/types/producto.type';
	import Swal from 'sweetalert2';
	import {
		TiposProductos,
		EstadosPedido,
		arrayFinalidadesPedidoConSeleccione,
	} from '$lib/constants/pedido.constant';
	import PuntosCargando from '../PuntosCargando.svelte';
	import type { VendedorLogueado } from '$lib/types/vendedor.type';

	export let vendedorLogueado: VendedorLogueado | null = null;

	let isSaving: boolean = false;

	enum EstadoActual {
		ninguno,
		consultandoProductos,
		consultandoClientes,
		consultandoProductosExternos,
		consultandoUltimosPedidos,
	}
	let estadoActual: EstadoActual = EstadoActual.ninguno;

	export let pedido: PedidoCrear | null = null;
	export let clientes: Cliente[];

	let productos: ProductoConsultado[] = [];
	let productosExternos: ProductoExternoConsultado[] = [];

	let sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };
	let clienteSeleccionado: Cliente | null = null;

	let fechaEntrega: string = '';
	let finalidadPedidoSeleccionado: FinalidadesPedidoConSeleccione = 'SELECCIONE';
	let comentario: string = '';

	let productoSeleccionado: ProductoConsultado | null = null;
	let productosAgregadosAlPedido: detallePedidoCrear[] = [];
	// let productosAgregados: ProductoAgregadoAlPedido[] = [];

	let inicializado: boolean = false;
	$: if (pedido && !inicializado) {
		fechaEntrega = pedido.fechaEntrega ? pedido.fechaEntrega.toISOString().split('T')[0] : '';
		clienteSeleccionado = clientes.find((cliente) => cliente.id === pedido!.idCliente) ?? null;
		finalidadPedidoSeleccionado = pedido.finalidad as FinalidadesPedidoConSeleccione;
		comentario = pedido.comentario;
		productosAgregadosAlPedido = pedido.detallePedido.map((producto: detallePedidoCrear) => ({
			idProducto: producto.idProducto,
			tipo: producto.tipo,
			tipoAceite: producto.tipoAceite,
			nombreProducto: producto.nombreProducto,
			pesoProducto: producto.pesoProducto,
			cantidadEnvases: producto.tipo === TiposProductos.externo ? null : producto.cantidadEnvases,
			cantidad: producto.cantidad,
			valor: producto.valor,
		}));
		inicializado = true;
	}

	const crearEditarPedido = async () => {
		//al validarse el usuario se asignó el idVendedor a pedido por lo cual pedido ya no es null en este momento
		if (!vendedorLogueado) {
			alert(
				'Favor avisar a sistemas, no se está capturando correctamente el vendedor logueado para enviar al backend',
			);
			return;
		}
		if (!fechaEntrega) {
			Swal.fire({
				icon: 'info',
				title: 'Fecha de entrega',
				text: 'Debe seleccionar la fecha de entrega del pedido',
			});
			return;
		}
		if (!clienteSeleccionado || !clienteSeleccionado.id) {
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

		if (productosAgregadosAlPedido.length === 0) {
			Swal.fire({
				icon: 'info',
				title: 'No hay productos',
				text: 'Debe agregar al menos un producto al pedido',
			});
			return;
		}

		//Si pedido es null, se crea un nuevo pedido
		if (!pedido) {
			const pedidoCrear: PedidoCrear = {
				idVendedor: vendedorLogueado!.id,
				idCliente: clienteSeleccionado.id,
				fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
				finalidad: finalidadPedidoSeleccionado,
				clienteSedeCiudad: sedeSeleccionada.ciudad,
				clienteSedeDireccion: sedeSeleccionada.direccion,
				comentario: comentario,
				estado: EstadosPedido.creado,
				porcentajeDescuento: clienteSeleccionado.porcentajeDescuento ?? 0,
				detalleAbonosId: null,
			};
			isSaving = true;
			const rtaPedidoJson = await fetch('/api/pedido', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pedido: pedidoCrear,
					productosAgregadosAlPedido,
				}),
			});
			isSaving = false;
			switch (rtaPedidoJson.status) {
				case 201: {
					let rta = await rtaPedidoJson.json();
					Swal.fire({
						icon: 'success',
						title: 'Creado',
						text: rta.message,
					});
					productosAgregadosAlPedido = [];
					pedido = null;
					finalidadPedidoSeleccionado = 'SELECCIONE';
					sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };
					clienteSeleccionado = null;
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
		}
	};

	const consultarProductos = async () => {
		estadoActual = EstadoActual.consultandoProductos;
		try {
			let rta = await fetch('/api/productos', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			productos = await rta.json();
			estadoActual = EstadoActual.ninguno;
		} catch (error) {
			console.error('Error al consultar vendedores:', error);
		}
	};

	const consultarProductosExternos = async () => {
		estadoActual = EstadoActual.consultandoProductosExternos;
		try {
			let rta = await fetch('/api/productosExternos', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			productosExternos = await rta.json();
			estadoActual = EstadoActual.ninguno;
		} catch (error) {
			console.error('Error al consultar productos externos:', error);
		}
	};

	let nombreProductoBuscar = '';
	let nombreProductoExternoBuscar = '';

	$: productosExternosFiltrados = productosExternos.filter((p) => {
		return p.nombre.toLowerCase().includes(nombreProductoExternoBuscar.toLowerCase());
	});

	$: productosFiltrados = productos.filter((producto) => {
		return producto.nombre.toLowerCase().includes(nombreProductoBuscar.toLowerCase());
	});

	$: mostrarModalProductos = false;
	$: mostrarModalProductosExternos = false;

	let clienteBuscar = '';
	let touchedInputCliente = false;
	$: clientesFiltrados =
		clienteBuscar && touchedInputCliente
			? clientes.filter((cliente) => cliente.razonSocial.includes(clienteBuscar.toLowerCase()))
			: clientes;

	let sedeBuscar = '';
	let touchedInputSedesCliente = false;
	$: sedesFiltrados =
		sedeBuscar && touchedInputSedesCliente && clienteSeleccionado
			? clienteSeleccionado.sedes.filter((sede) =>
					sede.direccion.includes(sedeBuscar.toLowerCase()),
				)
			: (clienteSeleccionado?.sedes ?? []);

	let cantidadProductoSeleccionado = 0;
	let valorProductoSeleccionado = 0;
</script>

<Tarjeta>
	<TarjetaHeader titulo="Datos del pedido" />
	<TarjetaBody>
		<form method="POST" class="w-full" on:submit|preventDefault={crearEditarPedido}>
			<label for="fecha de entrega" class="input-label">Fecha de entrega</label>
			<input bind:value={fechaEntrega} class="input-texto" type="date" />
			<label for="Seleccione cliente" class="input-label">Seleccione cliente</label>
			<Combobox
				items={clientesFiltrados}
				selected={{
					value: clienteSeleccionado?.id ?? 0,
					label: clienteSeleccionado?.razonSocial ?? '',
				}}
			>
				<ComboboxInput placeholder="Seleccione..." />
				<ComboboxContent>
					{#each clientesFiltrados as cliente (cliente.id)}
						<ComboboxItem
							value={cliente.id}
							label={cliente.razonSocial}
							on:click={() => {
								sedeSeleccionada = { id: 0, ciudad: '', direccion: '' };
								clienteSeleccionado = cliente;
							}}
						/>
					{:else}
						<span class="block px-5 py-2 text-sm text-muted-foreground">No results found</span>
					{/each}
				</ComboboxContent>
			</Combobox>
			{#if clienteSeleccionado?.sedes && clienteSeleccionado.sedes.length > 0}
				<label for="Seleccione sede del cliente" class="input-label">
					Seleccione sede del cliente
				</label>
				<Combobox
					items={sedesFiltrados}
					selected={{ value: sedeSeleccionada.id, label: sedeSeleccionada.direccion }}
				>
					<ComboboxInput placeholder="Seleccione..." />
					<ComboboxContent>
						{#each clienteSeleccionado.sedes as sede}
							<ComboboxItem
								value={sede.id}
								label={`${sede.ciudad} - ${sede.direccion}`}
								on:click={() => {
									sedeSeleccionada = sede;
								}}
							/>
						{:else}
							<span class="block px-5 py-2 text-sm text-muted-foreground">No results found</span>
						{/each}
					</ComboboxContent>
				</Combobox>
			{/if}
			<label for="Seleccione finalidad pedido" class="input-label">
				Seleccione finalidad pedido
			</label>
			<Combobox
				items={arrayFinalidadesPedidoConSeleccione}
				selected={{
					value: finalidadPedidoSeleccionado,
					label: finalidadPedidoSeleccionado,
				}}
			>
				<ComboboxInput placeholder="Seleccione..." />
				<ComboboxContent>
					{#each arrayFinalidadesPedidoConSeleccione as finalidadPedido}
						<ComboboxItem
							value={finalidadPedido}
							label={finalidadPedido}
							on:click={() => {
								finalidadPedidoSeleccionado = finalidadPedido;
							}}
						/>
					{:else}
						<span class="block px-5 py-2 text-sm text-muted-foreground">No results found</span>
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
			{#if productosAgregadosAlPedido.length > 0}
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

						{#each productosAgregadosAlPedido as productoAgregado}
							<Fila class="items-center">
								<Celda class="flex justify-center px-2 sm:px-4">
									{productoAgregado.idProducto}
								</Celda>
								<Celda class="px-1 text-sm sm:px-4 sm:text-base">
									{productoAgregado.nombreProducto}
								</Celda>
								<Celda class="px-1 text-sm sm:px-4 sm:text-base">
									{productoAgregado.tipo.charAt(0).toUpperCase() + productoAgregado.tipo.slice(1)}
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
											productosAgregadosAlPedido = productosAgregadosAlPedido.filter(
												(producto) =>
													!(
														producto.idProducto === productoAgregado.idProducto &&
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
							productosAgregadosAlPedido.reduce(
								(acc, producto) => acc + producto.cantidad * producto.valor,
								0,
							),
						)}
					</label>
				</div>
			{/if}
			<label for="comentario" class="input-label mt-4">Comentarios generales:</label>
			<textarea
				bind:value={comentario}
				class="input-texto mt-2"
				id="w3review"
				name="w3review"
				rows="4"
				cols="50"
			/>
			<div class="mt-4">
				<Boton variante="principal" tipo="submit" cargando={isSaving}>
					{pedido ? 'Editar pedido' : 'Crear pedido'}
				</Boton>
			</div>
		</form>
	</TarjetaBody>
</Tarjeta>

<!--Modal para productos del tipo PRINCIPAL-->
<Modal
	open={mostrarModalProductos}
	onOpenChange={() => {
		mostrarModalProductos = !mostrarModalProductos;
	}}
>
	<ModalContent>
		<ModalHeader>Seleccione producto tipo principal</ModalHeader>
		{#if estadoActual === EstadoActual.consultandoProductos}
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
													cantidadEnvases: producto.cantidadEnvases,
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
					<input class="input-texto" bind:value={cantidadProductoSeleccionado} type="number" />

					<label for="valor" class="input-label mt-4">Valor unit (caja o bidon)</label>
					<input class="input-texto" bind:value={valorProductoSeleccionado} type="number" />
				{/if}
				<div class="mt-4">
					<Boton
						variante="link verdeFagar"
						on:click={() => {
							// console.log('productoSeleccionado ====>', productoSeleccionado);
							// console.log('cantidadProductoSeleccionado ====>', cantidadProductoSeleccionado);
							// console.log('valorProductoSeleccionado ====>', valorProductoSeleccionado);
							if (!productoSeleccionado) {
								Swal.fire({
									icon: 'info',
									title: 'Producto no seleccionado',
									text: 'Debe seleccionar un producto para agregarlo al pedido',
								});
								return;
							}
							const productoYaAgregado = productosAgregadosAlPedido.some(
								(producto) =>
									producto.idProducto === productoSeleccionado?.id &&
									producto.tipo === TiposProductos.principal,
							);

							if (productoYaAgregado) {
								Swal.fire({
									icon: 'info',
									title: 'Producto ya agregado',
									text: 'El producto seleccionado ya fue agregado al pedido',
								});
							}

							if (cantidadProductoSeleccionado <= 0) {
								Swal.fire({
									icon: 'info',
									title: 'Cantidad no válida',
									text: 'La cantidad del producto debe ser mayor a 0',
								});
								return;
							}
							if (valorProductoSeleccionado <= 0) {
								Swal.fire({
									icon: 'info',
									title: 'Valor no válido',
									text: 'El valor del producto debe ser mayor a 0',
								});
								return;
							}

							productosAgregadosAlPedido = [
								...productosAgregadosAlPedido,
								{
									idProducto: productoSeleccionado.id,
									tipo: TiposProductos.principal,
									tipoAceite: productoSeleccionado.tipoAceite,
									nombreProducto: productoSeleccionado.nombre,
									pesoProducto: productoSeleccionado.peso,
									cantidadEnvases:
										productoSeleccionado.cantidadEnvases > 0
											? productoSeleccionado.cantidadEnvases
											: null,
									cantidad: cantidadProductoSeleccionado,
									valor: valorProductoSeleccionado,
								},
							];
							productoSeleccionado = null;
							mostrarModalProductos = false;
							cantidadProductoSeleccionado = 0;
							valorProductoSeleccionado = 0;
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
		{#if estadoActual === EstadoActual.consultandoProductosExternos}
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
													cantidadEnvases: 0, //los productos externos no llevan cantidad de envases
													tipoAceite: null,
													peso: producto.peso,
												};
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
					<input class="input-texto" bind:value={cantidadProductoSeleccionado} type="number" />

					<label for="valor" class="input-label mt-4">Valor unit caja</label>
					<input class="input-texto" bind:value={valorProductoSeleccionado} type="number" />
				{/if}
				<Boton
					variante="link verdeFagar"
					on:click={() => {
						if (!productoSeleccionado) {
							Swal.fire({
								icon: 'info',
								title: 'Producto no seleccionado',
								text: 'Debe seleccionar un producto para agregarlo al pedido',
							});
							return;
						}
						//tiene que validarse el id pero tambien el tipo por que puede que se agregue un producto "PRINCIPAL" y "EXTERNO" con el mismo id
						const productoYaAgregado = productosAgregadosAlPedido.some(
							(producto) =>
								producto.idProducto === productoSeleccionado?.id &&
								producto.tipo === TiposProductos.externo,
						);
						if (productoYaAgregado) {
							Swal.fire({
								icon: 'info',
								title: 'Producto ya agregado',
								text: 'El producto seleccionado ya fue agregado al pedido',
							});
							return;
						}

						if (cantidadProductoSeleccionado <= 0) {
							Swal.fire({
								icon: 'info',
								title: 'Cantidad no válida',
								text: 'La cantidad del producto debe ser mayor a 0',
							});
							return;
						}
						if (valorProductoSeleccionado <= 0) {
							Swal.fire({
								icon: 'info',
								title: 'Valor no válido',
								text: 'El valor del producto debe ser mayor a 0',
							});
							return;
						}
						productosAgregadosAlPedido = [
							...productosAgregadosAlPedido,
							{
								idProducto: productoSeleccionado.id,
								tipo: TiposProductos.externo,
								tipoAceite: productoSeleccionado.tipoAceite,
								nombreProducto: productoSeleccionado.nombre,
								pesoProducto: productoSeleccionado.peso,
								cantidadEnvases: productoSeleccionado.cantidadEnvases,
								cantidad: cantidadProductoSeleccionado,
								valor: valorProductoSeleccionado,
							},
						];
						productoSeleccionado = null;
						cantidadProductoSeleccionado = 0;
						valorProductoSeleccionado = 0;
						mostrarModalProductosExternos = false;
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
