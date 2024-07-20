<script lang="ts">
	import './styles/app.css';
	import IconoGuardar from '$lib/icons/Guardar.svelte';
	import { logo } from '../lib/images/logo';
	import SpinnerCargando from '$lib/components/SpinnerCargando.svelte';
	import Swal from 'sweetalert2';
	import type { ProductoConsultado } from '../lib/types';
	import { Modal, ModalHeader } from '$lib/components/Modal';
	import ModalBody from '$lib/components/Modal/ModalBody.svelte';

	let tabActivo = '';

	const setTabActivo = (tab: string) => {
		tabActivo = tab;
	};

	let estadoActual = { validandoUsuario: false, consultandoProductos: false, creandoPedido: false };
	let usuario = { numeroCedula: '1098685807', fechaExpedicionDocumento: '2008-04-24' };
	let productos: ProductoConsultado[] = [];
	let productosFiltrados: ProductoConsultado[] = [];
	let nombreProductoBuscar = '';
	let usuarioValidado = false;

	let pedido = { fechaEntrega: '' };

	let productoSeleccionado: ProductoConsultado = { id: 0, nombre: '' };

	const validarUsuario = async () => {
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

		console.log('se validará el usuario', usuario);

		estadoActual.validandoUsuario = true;

		const rtaJson = await fetch(
			`api/vendedor?cedula=${usuario.numeroCedula}&fechaExpedicionDocumento=${usuario.fechaExpedicionDocumento}`,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' },
			},
		);
		if (rtaJson.status === 200) {
			usuarioValidado = true;
			const infoVendedor = await rtaJson.json();
			console.log('infoVendedor', infoVendedor);
			//como ya se validó el usuario, se envia a consultar productos pues de una vez queda lista la card para crear producto
			tabActivo = 'crear pedido';
			consultarProductos();
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
			productosFiltrados = productos;

			console.log('productos', productos);
			estadoActual.consultandoProductos = false;
		} catch (error) {
			console.error('Error al consultar vendedores:', error);
		}
	};

	const crearPedido = async () => {
		console.log('Se creará el pedido');
	};

	$: productosFiltrados = productos.filter((producto) => {
		return producto.nombre.toLowerCase().includes(nombreProductoBuscar.toLowerCase());
	});
</script>

<div class="contenedorPrincipal">
	<div class="flex flex-col items-center">
		<img alt="logo" src={logo} class="w-80 h-45" />
		<h1 class="text-6xl">PEDIDOS</h1>
	</div>
	{#if !usuarioValidado}
		<div class="fila-1columna mt-8">
			<div class="tarjeta sm:w-1/2 w-full">
				<div class="tarjeta-header">Validación de usuario</div>
				<form method="POST" on:submit|preventDefault={validarUsuario}>
					<div class="tarjeta-body">
						<div>
							<label for="usuario" class="input-label">Numero cedula</label>
							<input class="input-texto" bind:value={usuario.numeroCedula} type="text" />
						</div>
						<div>
							<label for="contrasena" class="input-label">Fecha expedicion documento</label>
							<input
								class="input-texto"
								bind:value={usuario.fechaExpedicionDocumento}
								type="date"
							/>
						</div>
						<div class="flex flex-col items-center">
							{#if estadoActual.validandoUsuario}
								<SpinnerCargando />
							{:else}
								<button class="boton-principal fondoVerdeFagar" type="submit">Validar</button>
							{/if}
						</div>
					</div>
				</form>
			</div>
		</div>
	{:else}
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

			<button
				class="boton-principal fondoRojo"
				type="submit"
				on:click={() => {
					usuarioValidado = false;
					tabActivo = '';
				}}
			>
				Cerrar sesión
			</button>
		</div>
	{/if}

	{#if tabActivo === 'crear pedido'}
		<div class="fila-1columna">
			<div class="tarjeta sm:w-1/2 w-full">
				<div class="tarjeta-header">Crear pedido</div>
				<form method="POST" on:submit|preventDefault={crearPedido}>
					<div class="tarjeta-body">
						<label for="fecha de entrega" class="input-label">Fecha de entrega</label>
						<input bind:value={pedido.fechaEntrega} class="input-texto" type="date" />
						<label for="nombre" class="input-label">Agregue producto</label>
						<Modal mostrarModal={true}>
							<ModalHeader titulo={'Seleccione producto'}>Seleccione Producto</ModalHeader>
							<ModalBody>
								<div class="overflow-y-auto">
									<input
										class="input-texto"
										type="text"
										placeholder="Filtrar productos"
										bind:value={nombreProductoBuscar}
									/>
									<table>
										{#if estadoActual.consultandoProductos}
											<SpinnerCargando />
										{:else}
											{#each productosFiltrados as producto}
												<tr class="mt-2">
													<td>{producto.nombre}</td>
													<td class="px-4">
														<button
															class="hover:underline hover:font-bold text-green-600"
															on:click={() => {
																productoSeleccionado = producto;
															}}
														>
															Agregar
														</button>
													</td>
												</tr>
											{/each}
										{/if}
									</table>
								</div>
							</ModalBody>
						</Modal>
						<div class="flex flex-col items-center w-full">
							{#if estadoActual.creandoPedido}
								<SpinnerCargando />
							{:else}
								<button class="boton-principal fondoVerdeFagar" type="submit">Crear ciudad</button>
							{/if}
						</div>
					</div>
				</form>
			</div>
		</div>
	{/if}

	<slot />
</div>

<style>
</style>
