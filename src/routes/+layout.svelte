<script lang="ts">
	import './styles/app.css';
	import { onMount } from 'svelte';
	import { obtenerURLArchivo } from '../lib/scripts/firebase/storage.obtenerURLArchivo';
	import { setUsuarioLogueado, getUsuarioLogueado } from './context';
	import { logo } from '../lib/images/logo';
	import SpinnerCargando from '$lib/components/SpinnerCargando.svelte';
	import Swal from 'sweetalert2';
	//setUsuarioLogueado();
	//let usuarioLogueado = getUsuarioLogueado();

	let estadoActual = { validandoUsuario: false };
	let usuario = { numeroCedula: '1098685807', fechaExpedicionDocumento: '2008-04-24' };
	let usuarioValidado = false;

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
			<div>Usuario validado</div>
		</div>
	{/if}
</div>

<style>
</style>
