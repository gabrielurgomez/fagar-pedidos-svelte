<script lang="ts">
	import PuntosCargando from '$lib/components/PuntosCargando.svelte';
	import SpinnerCargando from '$lib/components/SpinnerCargando.svelte';
	import Swal from 'sweetalert2';
	import IconoGuardar from '$lib/icons/Guardar.svelte';
	import type { ciudades } from '@prisma/client';

	let tabActivo = 'crear';
	let ciudades: ciudades[] = [];

	let estadoActual = { consultando: false, creando: false };

	let ciudad = { nombre: '' };

	const setTabActivo = (tab: string) => {
		tabActivo = tab;
	};

	const consultarCiudades = async () => {
		estadoActual.consultando = true;
		try {
			console.log('Consultar ciudades');
			let rta = await fetch('/api/ciudades', {
				method: 'GET',
				cache: 'no-cache',
				headers: { 'Content-Type': 'application/json' },
			});
			ciudades = await rta.json();
			estadoActual.consultando = false;
		} catch (error) {
			console.error('Error al consultar vendedores:', error);
		}
	};

	async function crearCiudad() {
		if (ciudad.nombre === '') {
			Swal.fire({
				icon: 'info',
				title: 'Datos incorrectos',
				text: 'Debe digitar el nombre del vendedor',
			});
			return;
		}

		console.log('ciudad', ciudad);

		estadoActual.creando = true;

		const response = await fetch('/api/ciudad', {
			method: 'POST',
			body: JSON.stringify(ciudad),
			headers: { 'Content-Type': 'application/json' },
		});

		let rta = await response.json();
		console.log('rta', rta);
		switch (rta.status) {
			case 201: {
				Swal.fire({ title: 'Creado', icon: 'success', text: 'Ciudad creada con exito' });
				ciudad.nombre = '';
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
	}
</script>

<svelte:head>
	<title>Ciudades</title>
	<meta name="description" content="Vendedores" />
</svelte:head>

<div class="contenedorPrincipal">
	<div class="contenedorTabs">
		<div class={`tab ${tabActivo === 'crear' ? 'tab-activo' : ''}`}>
			<IconoGuardar tamano={20} />
			<button on:click={() => setTabActivo('crear')}>Crear</button>
		</div>

		<button
			on:click={() => {
				setTabActivo('consultar');
				consultarCiudades();
			}}
			class={`tab ${tabActivo === 'consultar' ? 'tab-activo' : ''}`}
		>
			Consultar
		</button>
	</div>

	{#if tabActivo === 'crear'}
		<div class="fila-1columna">
			<div class="tarjeta sm:w-1/2 w-full">
				<div class="tarjeta-header">Crear Ciudad</div>
				<form method="POST" on:submit|preventDefault={crearCiudad}>
					<div class="tarjeta-body">
						<div class="w-full">
							<label for="nombre" class="input-label">Nombre</label>
							<input class="input-texto" bind:value={ciudad.nombre} type="text" />
						</div>
						<div class="flex flex-col items-center w-full">
							{#if estadoActual.creando}
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

	{#if tabActivo === 'consultar'}
		<div class="fila-1columna">
			<div class="tarjeta w-full">
				<div class="tarjeta-header">Ciudades creadas</div>
				<div class="tarjeta-body">
					{#if estadoActual.consultando}
						<PuntosCargando />
					{:else if ciudades.length > 0}
						<table class="tabla">
							<thead class="tabla-header">
								<tr>
									<th>Id</th>
									<th>Nombre</th>
								</tr>
							</thead>
							<tbody>
								{#each ciudades as ciudad}
									<tr class="tabla-tr">
										<td>{ciudad.id}</td>
										<td>{ciudad.nombre}</td>
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
</div>
