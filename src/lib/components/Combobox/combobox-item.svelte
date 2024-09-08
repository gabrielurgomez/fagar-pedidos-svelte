<script lang="ts">
	import { Combobox } from 'bits-ui';
	import { cn } from '../../utils';
	import IconoCheckmark from '../../icons/Checkmark.svelte';

	export let value: string | number = '';
	export let label: string = '';

	let customClasses = '';
	export { customClasses as class };
</script>

<Combobox.Item
	{value}
	{label}
	class={cn(
		`flex
        gap-2
        items-center
        justify-between        
        cursor-pointer
        hover:bg-gray-100
        hover:rounded-lg
        rounded-button
        px-3
        py-1
        text-sm
        data-[highlighted]:bg-gray-100
        overflow-hidden
        truncate
        text-ellipsis`,
		customClasses,
	)}
	on:click
>
	<div class="w-5/6 overflow-hidden text-ellipsis whitespace-nowrap">{label}</div>
	<Combobox.ItemIndicator asChild={false}><IconoCheckmark tamano={20} /></Combobox.ItemIndicator>
</Combobox.Item>
