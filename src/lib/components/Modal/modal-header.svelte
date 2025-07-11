<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Dialog as ModalPrimitive } from 'bits-ui';
	import IconoCerrar from '../../icons/Cerrar.svelte';

	let customClasses = '';
	export { customClasses as class };
</script>

<div
	class={cn(
		'flex items-center justify-between rounded-t-md border-b bg-white px-5 py-5 text-center',
		customClasses,
	)}
	{...$$restProps}
>
	<ModalPrimitive.Title class="text-lg font-semibold">
		<slot />
	</ModalPrimitive.Title>

	<ModalPrimitive.Close on:click on:keydown>
		<IconoCerrar tamano={15} />
	</ModalPrimitive.Close>
</div>
