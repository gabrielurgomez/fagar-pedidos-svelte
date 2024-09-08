<script lang="ts">
	import { Dialog as ModalPrimitive } from 'bits-ui';
	import { cn } from '../../../utils';
	import { fade } from 'svelte/transition';

	let customClass = '';
	export { customClass as class };
</script>

<ModalPrimitive.Portal>
	<ModalPrimitive.Overlay
		transition={fade}
		transitionConfig={{ duration: 200 }}
		class="fixed inset-0 z-50 bg-black/50"
	/>
	<ModalPrimitive.Content
		class={cn(
			`rounded-lg
			fixed
			left-[50%]
			top-[50%]
			z-50
			translate-x-[-50%]
			translate-y-[-50%]
			bg-white
			py-4	
			sm:h-6/7
			w-screen
			sm:max-w-[490px]
			md:w-full`,
			customClass,
		)}
		{...$$restProps}
	>
		<slot />
	</ModalPrimitive.Content>
</ModalPrimitive.Portal>
