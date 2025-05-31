<script lang="ts">
	import { cn } from '$lib/utils/cn';
	export let titulo: string = '';

	let customClasses: string = '';
	export { customClasses as class };
</script>

{#if titulo}
	<div
		class={cn(
			'sticky flex flex-row items-center justify-center border-b-2 border-neutral-100 bg-white py-4 text-lg',
			customClasses,
		)}
	>
		{titulo}
	</div>
{/if}
