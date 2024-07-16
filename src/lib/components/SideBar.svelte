<script>
	import { logo } from '$lib/images/logo.js';
	import People from '$lib/icons/People.svelte';
	import Ciudades from '$lib/icons/Ciudades.svelte';
	import { signOut } from 'firebase/auth';
	import { auth } from '../../firebase';
	import FotoPerfilPerfecto from '$lib/icons/FotoPerfilDefecto.svelte';
	import { getUsuarioLogueado } from '../../routes/context';
	import IconoApagar from '$lib/icons/Apagar.svelte';
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

<div class="flex flex-col flex-grow pb-4">
	<div class="flex flex-col gap-2 px-4 mt-4 h-full">
		<div class="flex flex-col items-center">
			<img alt="logo" src={logo} class="w-48 h-20" />
		</div>
		<div class="flex flex-col items-start">
			<a href="/vendedores" class="sideBar-menu group">
				<People tamano={30} classes="sideBar-menu-icono" />
				<div class="sideBar-texto">Vendedores</div>
			</a>
			<a href="/ciudades" class="sideBar-menu group">
				<Ciudades tamano={30} classes="sideBar-menu-icono" />
				<div class="sideBar-texto">Ciudades</div>
			</a>
		</div>
	</div>

	<div class="flex flex-row px-4 justify-center">
		<a href="/cuenta" class="sideBar-menu group">
			{#if $usuarioLogueado.urlFotoPerfil != ''}
				<img
					class="w-8 h-8 rounded-full"
					src={$usuarioLogueado.urlFotoPerfil}
					alt="foto de perfil"
				/>
			{:else}
				<FotoPerfilPerfecto tamano={80} />
			{/if}
			<div class="sideBar-texto">Cuenta</div>
		</a>
		<button on:click={cerrarSesion}>
			<IconoApagar tamano={35} classes="text-red-600 hover:text-red-900 cursor-pointer"
			></IconoApagar>
		</button>
	</div>
</div>
