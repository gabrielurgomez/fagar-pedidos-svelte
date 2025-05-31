<script lang="ts">
	import { Dialog as ModalPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
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
			`sm:h-6/7
			fixed
			left-[50%]
			top-[50%]
			z-50
			w-screen
			translate-x-[-50%]
			translate-y-[-50%]
			rounded-lg	
			bg-white
			py-4
			sm:max-w-[490px]
			md:w-full`,
			customClass,
		)}
		{...$$restProps}
	>
		<slot />
	</ModalPrimitive.Content>
</ModalPrimitive.Portal>
