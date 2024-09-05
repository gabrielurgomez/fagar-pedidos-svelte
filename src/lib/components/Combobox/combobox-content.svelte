<script lang="ts">
	import { Combobox } from 'bits-ui';
	import { cn } from '../../utils';

	let customClasses = '';
	export { customClasses as class };
</script>

<Combobox.Content
	class={cn(
		`w-full bg-white rounded-xl border border-muted px-1 py-3 shadow-popover outline-none`,
		customClasses,
	)}
	sideOffset={8}
>
	<slot />
</Combobox.Content>
