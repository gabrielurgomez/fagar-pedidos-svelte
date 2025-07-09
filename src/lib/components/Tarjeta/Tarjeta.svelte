<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let customClasses: string = '';
	export { customClasses as class };
</script>

<div
	class={cn(
		'mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800',
		customClasses,
	)}
>
	<slot />
</div>
