<script lang="ts">
	import { Combobox } from 'bits-ui';
	export let items;
</script>

<Combobox.Root {items} {...$$restProps}>
	<slot />
</Combobox.Root>
