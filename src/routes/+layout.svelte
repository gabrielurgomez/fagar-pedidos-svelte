<script lang="ts">
	import './styles/app.css';
	import { auth } from '../firebase';
	import { onAuthStateChanged } from 'firebase/auth';
	import SideBaR from '$lib/components/SideBar.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { obtenerURLArchivo } from '../lib/scripts/firebase/storage.obtenerURLArchivo';
	import { setUsuarioLogueado, getUsuarioLogueado } from './context';
	setUsuarioLogueado();
	let usuarioLogueado = getUsuarioLogueado();

	onMount(() => {
		onAuthStateChanged(auth, async (user) => {
			if (user) {
				let urlFotoPerfil = '';

				const rtaFotoPerfil = await obtenerURLArchivo(`usuarios/fotoPerfil/${user.email}.png`);
				if (rtaFotoPerfil !== 'archivo no existe') {
					urlFotoPerfil = rtaFotoPerfil;
				} else {
					urlFotoPerfil = '';
				}

				$usuarioLogueado = {
					email: user.email ? user.email : '',
					urlFotoPerfil,
				};

				await goto('/cuenta');
			} else {
				$usuarioLogueado = {
					email: '',
					urlFotoPerfil: '',
				};
				await goto('/iniciarSesion');
			}
		});
	});
</script>

<div>
	<div class="flex sm:flex-row flex-col">
		<div
			class={`${$usuarioLogueado.email != '' ? 'sm:w-1/5' : 'invisible'}w-full flex flex-col sm:h-screen sm:border-e `}
		>
			{#if $usuarioLogueado.email != ''}
				<SideBaR />
			{/if}
		</div>
		<div class={`${$usuarioLogueado.email != '' ? 'sm:w-4/5' : ''}  w-full`}>
			<slot />
		</div>
	</div>
</div>

<style>
</style>
