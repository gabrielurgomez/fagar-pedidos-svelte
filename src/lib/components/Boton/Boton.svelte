<script lang="ts">
	import SpinnerCargando from './../SpinnerCargando.svelte';
	type Variantes = 'principal' | 'rojo' | 'link verdeFagar' | 'link rojo';
	type tiposBotones = 'button' | 'submit' | 'reset';

	export let variante: Variantes = 'principal'; // por defecto será principal
	export let cargando: boolean = false;
	export let tipo: tiposBotones = 'button';
	export let onClick: () => void;

	let clases: string = '';

	$: if (variante === 'principal') {
		clases = 'font-bold py-2 px-4 rounded text-white w-full bg-[#00963d] hover:bg-[#00732f]';
	}

	$: if (variante === 'rojo') {
		clases = 'font-bold py-2 px-4 rounded text-white w-full bg-red-600 hover:bg-red-900';
	}

	$: if (variante === 'link verdeFagar') {
		clases = 'hover:underline hover:underline-offset-2 rounded text-[#00732f]';
	}

	$: if (variante === 'link rojo') {
		clases = 'hover:font-bold rounded text-red-500 hover:text-red-600';
	}
</script>

<div class="mt-4">
	{#if !cargando}
		<button class={clases} type={tipo} on:click={onClick}>
			<slot />
		</button>
	{:else}
		<div class="flex justify-center">
			<SpinnerCargando />
		</div>
	{/if}
</div>
