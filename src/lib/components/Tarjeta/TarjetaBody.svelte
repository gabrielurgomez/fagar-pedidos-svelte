<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let defaultClasses = 'flex flex-col items-center justify-center py-4 px-4 sm:px-8 gap-4 w-full';

	let customClasses: string = '';
	export { customClasses as class };
</script>

<div class={cn(defaultClasses, customClasses)}>
	<slot />
</div>
