<script lang="ts">
	import PuntosCargando from '$lib/components/PuntosCargando.svelte';
	import SpinnerCargando from '../../lib/components/SpinnerCargando.svelte';
	import Swal from 'sweetalert2';
	import IconoGuardar from '$lib/icons/Guardar.svelte';
	import IconoBuscar from '$lib/icons/Buscar.svelte';
	import type { vendedores } from '@prisma/client';
	import Modal from '../../lib/components/Modal.svelte';

	let tabActivo = 'crear';
	let vendedores: vendedores[] = [];

	let mostrarModal = false;

	let datosSwalFire = {
		title: '',
		text: '',
		icon: '',
	};

	let estadoActual = { consultandoVendedores: false, creando: false, editando: false };

	let vendedor: vendedores = {
		id: 0,
		nombre: '',
		cedula: '',
		email: '',
	};

	const setTabActivo = (tab: string) => {
		console.log('tab', tab);
		tabActivo = tab;
	};

	const consultarVendedores = async () => {
		estadoActual.consultandoVendedores = true;
		try {
			console.log('Consultar vendedores');
			let rta = await fetch('/api/vendedores', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			vendedores = await rta.json();

			console.log('vendedores', vendedores);
			estadoActual.consultandoVendedores = false;
		} catch (error) {
			console.error('Error al consultar vendedores:', error);
		}
	};

	const crearEditar = async (finalidad: string) => {
		console.log('se ejecutó la función consultarVendedores, finalidad', finalidad);

		if (vendedor.nombre === '') {
			Swal.fire({
				icon: 'info',
				title: 'Datos incorrectos',
				text: 'Debe digitar el nombre del vendedor',
			});
			return;
		}

		if (vendedor.cedula === '') {
			Swal.fire({
				icon: 'info',
				title: 'Datos incorrectos',
				text: 'Debe digitar la cedula del vendedor',
			});
			return;
		}

		if (vendedor.email === '') {
			Swal.fire({
				icon: 'info',
				title: 'Datos incorrectos',
				text: 'Debe digitar el email del vendedor',
			});
			return;
		}

		console.log('vendedor', vendedor);

		switch (finalidad) {
			case 'crear': {
				estadoActual.creando = true;

				const response = await fetch('/api/vendedor', {
					method: 'POST',
					body: JSON.stringify(vendedor),
					headers: { 'Content-Type': 'application/json' },
				});

				let rta = await response.json();
				console.log('rta', rta);

				switch (rta.status) {
					case 201: {
						Swal.fire({ title: 'Creado', icon: 'success', text: 'Vendedor creado con exito' });
						datosSwalFire = { title: 'Creado', icon: 'success', text: 'Vendedor creado con exito' };
						limpiarCampos();
						break;
					}
					case 500: {
						Swal.fire({ title: 'Error', icon: 'error', text: `Error 500=> ${rta.message}` });
						break;
					}
					case 400: {
						Swal.fire({
							title: 'Verificar datos',
							icon: 'info',
							text: `Error 400 => ${rta.message}`,
						});
						break;
					}
				}
				estadoActual.creando = false;
				break;
			}

			case 'editar': {
				estadoActual.editando = true;

				const response = await fetch(`/api/vendedor/${vendedor.id}`, {
					method: 'PUT',
					body: JSON.stringify(vendedor),
					headers: { 'Content-Type': 'application/json' },
				});

				let rta = await response.json();
				console.log('rta', rta);

				switch (rta.status) {
					case 200: {
						Swal.fire({ title: 'Editado', icon: 'success', text: 'Vendedor editado con exito' });
						datosSwalFire = {
							title: 'Editado',
							icon: 'success',
							text: 'Vendedor editado con exito',
						};
						limpiarCampos();
						break;
					}
					case 500: {
						Swal.fire({ title: 'Error', icon: 'error', text: `Error 500=> ${rta.message}` });
						break;
					}
					case 400: {
						Swal.fire({
							title: 'Verificar datos',
							icon: 'info',
							text: `Error 400 => ${rta.message}`,
						});
						break;
					}
				}

				estadoActual.editando = false;

				break;
			}
		}
	};

	const limpiarCampos = () => {
		vendedor.nombre = '';
		vendedor.cedula = '';
		vendedor.email = '';
		vendedores = [];
	};
</script>

<svelte:head>
	<title>Vendedores</title>
	<meta name="description" content="Vendedores" />
</svelte:head>

<div class="contenedorPrincipal">
	<div class="contenedorTabs">
		<div class={`tab ${tabActivo === 'crear' ? 'tab-activo' : ''}`}>
			<IconoGuardar tamano={20} />
			<button
				on:click={() => {
					limpiarCampos();
					setTabActivo('crear');
				}}
			>
				Crear
			</button>
		</div>
		<div class={`tab ${tabActivo === 'consultar' ? 'tab-activo' : ''}`}>
			<IconoBuscar tamano={20} />
			<button
				on:click={() => {
					limpiarCampos();
					setTabActivo('consultar');
					consultarVendedores();
				}}
			>
				Consultar
			</button>
		</div>
	</div>

	{#if tabActivo === 'crear'}
		<div class="fila-1columna">
			<div class="tarjeta sm:w-1/2 w-full">
				<div class="tarjeta-header">Crear vendedor</div>
				<form
					method="POST"
					on:submit|preventDefault={() => {
						crearEditar('crear');
					}}
				>
					<div class="tarjeta-body">
						<div class="w-full">
							<label for="nombre" class="input-label">Nombre</label>
							<input class="input-texto" bind:value={vendedor.nombre} type="text" />
						</div>
						<div class="w-full">
							<label for="cedula" class="input-label">Cedula</label>
							<input class="input-texto" bind:value={vendedor.cedula} type="text" />
						</div>
						<div class="w-full">
							<label for="email" class="input-label">Email</label>
							<input class="input-texto" bind:value={vendedor.email} type="text" />
						</div>
						<div class="flex flex-col items-center w-full">
							{#if estadoActual.creando}
								<SpinnerCargando />
							{:else}
								<button class="boton-principal fondoVerdeFagar" type="submit">
									Crear vendedor
								</button>
							{/if}
						</div>
					</div>
				</form>
			</div>
		</div>
	{/if}

	{#if tabActivo === 'consultar'}
		<div class="fila-1columna">
			<div class="tarjeta w-full">
				<div class="tarjeta-header">Vendedores creados</div>
				<div class="tarjeta-body">
					{#if estadoActual.consultandoVendedores}
						<PuntosCargando />
					{:else if vendedores.length > 0}
						<table class="tabla mt-2">
							<thead class="tabla-thead">
								<tr>
									<th class="tabla-th ps-4">Id</th>
									<th class="tabla-th">Cedula</th>
									<th class="tabla-th">Nombre</th>
									<th class="tabla-th">Email</th>
									<th class="tabla-th">Editar</th>
								</tr>
							</thead>
							<tbody>
								{#each vendedores as ven}
									<tr class="tabla-tr">
										<td class="tabla-td ps-4">{ven.id}</td>
										<td class="tabla-td">{ven.nombre}</td>
										<td class="tabla-td">{ven.cedula}</td>
										<td class="tabla-td">{ven.email}</td>
										<td class="tabla-td">
											<button
												class="cursor-pointer text-blue-600 hover:underline"
												on:click={() => {
													vendedor.id = ven.id;
													vendedor.nombre = ven.nombre;
													vendedor.cedula = ven.cedula;
													vendedor.email = ven.email;
													mostrarModal = true;
												}}
											>
												Editar
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div>No hay vendedores creados</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<Modal bind:mostrarModal>
		<h2 slot="header">Editar vendedor de ID: {vendedor.id}</h2>
		<div>
			<div class="flex flex-col w-full gap-2">
				<div class="w-full">
					<label for="nombre" class="input-label">Nombre</label>
					<input class="input-texto" bind:value={vendedor.nombre} type="text" />
				</div>

				<div class="w-full">
					<label for="cedula" class="input-label">Cedula</label>
					<input class="input-texto" bind:value={vendedor.cedula} type="text" />
				</div>
				<div class="w-full">
					<label for="email" class="input-label">Email</label>
					<input class="input-texto" bind:value={vendedor.email} type="text" />
				</div>
				<button class="boton-principal fondoVerdeFagar" on:click={() => crearEditar('editar')}>
					Guardar cambios
				</button>
			</div>
		</div>
	</Modal>
</div>
