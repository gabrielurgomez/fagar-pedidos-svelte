<script lang="ts">
	import { cn } from '../../../utils';
	let customClasses: string = '';
	export { customClasses as class };
</script>

<div
	class={cn(
		'mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg sm:w-1/2',
		customClasses,
	)}
>
	<slot></slot>
</div>
