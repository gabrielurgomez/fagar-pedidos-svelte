<script lang="ts">
	import { Dialog } from 'bits-ui';
	export let open: boolean = false;
</script>

<Dialog.Root
	preventScroll={true}
	onOutsideClick={(e) => e.preventDefault()}
	{open}
	{...$$restProps}
>
	<slot />
</Dialog.Root>
