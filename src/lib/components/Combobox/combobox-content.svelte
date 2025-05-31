<script lang="ts">
	import { Combobox } from 'bits-ui';
	import { cn } from '$lib/utils/cn';

	let customClasses = '';
	export { customClasses as class };
</script>

<Combobox.Content
	class={cn(
		`border-muted flex max-h-36 w-full flex-col overflow-y-auto rounded-xl border bg-white px-1 py-3 md:max-h-60 lg:max-h-96`,
		customClasses,
	)}
	sideOffset={8}
>
	<slot />
</Combobox.Content>
