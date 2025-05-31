<script lang="ts">
	import { cn } from '$lib/utils/cn';
	let customClasses = '';
	export { customClasses as class };
</script>

<tr class={cn('border-b', customClasses)}>
	<slot />
</tr>
