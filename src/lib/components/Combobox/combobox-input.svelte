<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Combobox } from 'bits-ui';
	import ChevronIcon from '../../icons/Chevron.svelte';

	let customClasses = '';
	export { customClasses as class };

	export let placeholder: string = '';
</script>

<div class="relative">
	<Combobox.Input
		class={cn(
			`text-md
			mt-3
			h-12
			w-full
			truncate
			rounded-lg
			border
			px-3
			transition-colors
			focus:outline-none
			focus:ring-2
			focus:ring-[#00963d]
			focus:ring-offset-2`,
			customClasses,
		)}
		{...$$restProps}
		{placeholder}
	>
		<slot />
		<ChevronIcon />
	</Combobox.Input>
</div>
