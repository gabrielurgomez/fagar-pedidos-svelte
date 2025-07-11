<script lang="ts">
	import { Combobox } from 'bits-ui';
	export let items;
	export let disabled: boolean = false;
</script>

<Combobox.Root {items} {disabled} {...$$restProps}>
	<slot />
</Combobox.Root>
