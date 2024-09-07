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
        items-center
       justify-between
        h-8
        w-full
        cursor-pointer
        hover:bg-gray-100
        hover:rounded
        select-none
        rounded-button
        py-3
        pl-3
        pr-1.5
        text-sm
        capitalize
        transition-all
        duration-75
        data-[highlighted]:bg-gray-100`,
		customClasses,
	)}
	on:click
>
	<slot />
	<Combobox.ItemIndicator asChild={false}><IconoCheckmark tamano={20} /></Combobox.ItemIndicator>
</Combobox.Item>
