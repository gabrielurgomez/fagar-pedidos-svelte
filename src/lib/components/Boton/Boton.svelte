<script lang="ts">
	import IconoEliminar from '$lib/icons/Eliminar.svelte';
	import SpinnerCargando from './../SpinnerCargando.svelte';
	import { cn } from '../../../utils';

	type Variantes = 'principal' | 'rojo' | 'link verdeFagar' | 'link rojo' | 'icono';
	type nombresIconos = 'eliminar' | undefined;
	type tiposBotones = 'button' | 'submit' | 'reset';

	export let variante: Variantes = 'principal';
	export let cargando: boolean = false;
	export let tipo: tiposBotones = 'button';
	export let tamanoIcono: number = 20;
	export let tamanoSpinner: number = 30;
	export let nombreIcono: nombresIconos = undefined;

	let clases: string = '';
	let spinnerClasses: string = '';

	let customClass = '';
	export { customClass as class };

	$: if (variante === 'principal') {
		clases = 'font-bold py-2 px-4 rounded text-white w-full bg-[#00963d] hover:bg-[#00732f]';
		spinnerClasses = 'fill-green-700';
	}

	$: if (variante === 'rojo') {
		clases = 'font-bold py-2 px-4 rounded text-white w-full bg-red-600 hover:bg-red-900';
		spinnerClasses = 'fill-red-600';
	}

	$: if (variante === 'link verdeFagar') {
		clases = 'hover:underline rounded text-[#00732f]';
		spinnerClasses = 'fill-green-700';
	}

	$: if (variante === 'link rojo') {
		clases = 'hover:font-bold rounded text-red-500 hover:text-red-600';
		spinnerClasses = 'fill-green-700';
	}
</script>

{#if variante === 'icono'}
	{#if nombreIcono === 'eliminar'}
		{#if !cargando}
			<button on:click>
				<IconoEliminar tamano={tamanoIcono} />
			</button>
		{:else}
			<SpinnerCargando classes="fill-red-600" tamano={tamanoIcono} />
		{/if}
	{/if}
{/if}

{#if variante !== 'icono'}
	{#if !cargando}
		<button class={cn(clases, customClass)} type={tipo} {...$$restProps} on:click>
			<slot />
		</button>
	{:else}
		<div class="flex items-center justify-center">
			<SpinnerCargando classes={spinnerClasses} tamano={tamanoSpinner} />
		</div>
	{/if}
{/if}
