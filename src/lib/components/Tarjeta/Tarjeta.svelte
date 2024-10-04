<script lang="ts">
	import { cn } from '../../../utils';
	let defaultClasses = 'bg-white border border-gray-200 rounded-lg shadow-lg mt-2 w-full sm:w-1/2';

	let customClasses: string = '';
	export { customClasses as class };
</script>

<div class={cn(defaultClasses, customClasses)}>
	<slot></slot>
</div>
