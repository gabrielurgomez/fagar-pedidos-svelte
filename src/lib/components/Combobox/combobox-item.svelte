<script lang="ts">
	import { Combobox } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
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
		`rounded-button
        flex
        cursor-pointer
        items-center        
        justify-between
        gap-2
        overflow-hidden
        truncate
        text-ellipsis
		p-3
        text-sm
        hover:rounded-lg
        hover:bg-gray-100
        data-[highlighted]:bg-gray-100`,
		customClasses,
	)}
	on:click
>
	<div class="w-5/6 overflow-hidden text-ellipsis whitespace-nowrap">{label}</div>
	<Combobox.ItemIndicator asChild={false}><IconoCheckmark tamano={20} /></Combobox.ItemIndicator>
</Combobox.Item>
