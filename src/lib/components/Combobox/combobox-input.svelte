<script lang="ts">
	import { cn } from '../../utils';
	import { Combobox } from 'bits-ui';
	import ChevronIcon from '../../icons/Chevron.svelte';

	let customClasses = '';
	export { customClasses as class };

	export let placeholder: string = '';
</script>

<div class="relative">
	<Combobox.Input
		class={cn(
			`w-full mt-3 px-3 truncate rounded-lg border text-md transition-colors
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
