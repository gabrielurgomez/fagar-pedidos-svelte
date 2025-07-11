<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import { Combobox } from 'bits-ui';
	import ChevronIcon from '../../icons/Chevron.svelte';

	let customClasses = '';
	export { customClasses as class };

	export let placeholder: string = '';
	export let disabled: boolean = false;
</script>

<Combobox.Input
	class={cn(
		`
		h-12
		w-full
		truncate
		rounded-lg
		border
		px-3
		text-sm
		transition-colors
		focus:border-2
		focus:border-[#00963d]
		focus:outline-none
		${disabled ? 'text-slate-300' : ''}`,
		customClasses,
	)}
	{...$$restProps}
	{placeholder}
/>
