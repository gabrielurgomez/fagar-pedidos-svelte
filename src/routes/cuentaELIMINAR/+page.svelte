<script lang="ts">
	import { signOut } from 'firebase/auth';
	import { auth } from '../../firebase';
	import Swal from 'sweetalert2';
	import FotoPerfilPerfecto from '$lib/icons/FotoPerfilDefecto.svelte';
	import { getUsuarioLogueado } from '../context';
	const usuarioLogueado = getUsuarioLogueado();

	const cerrarSesion = async () => {
		signOut(auth)
			.then(() => {
				console.log('Sesión cerrada exitosamente');
			})
			.catch((error) => {
				Swal.fire({
					icon: 'error',
					title: 'Error al cerrar sesión',
					text: error.message,
				});
			});
	};
</script>

<svelte:head>
	<title>Iniciar Sesión</title>
	<meta name="description" content="Iniciar sesión" />
</svelte:head>

<div class="contenedorPrincipal">
	<div class="fila-1columna">
		<div class="tarjeta sm:w-1/2 w-full">
			<div class="tarjeta-header">CUENTA</div>
			<div class="tarjeta-body">
				<div>{$usuarioLogueado.email}</div>
				{#if $usuarioLogueado.urlFotoPerfil != ''}
					<img
						class="w-36 h-36 rounded-full"
						src={$usuarioLogueado.urlFotoPerfil}
						alt="foto de perfil"
					/>
				{:else}
					<FotoPerfilPerfecto tamano={80} />
				{/if}

				<button class="boton-principal fondoRojo" on:click={() => cerrarSesion()}>
					Cerrar sesión
				</button>
			</div>
		</div>
	</div>
</div>
