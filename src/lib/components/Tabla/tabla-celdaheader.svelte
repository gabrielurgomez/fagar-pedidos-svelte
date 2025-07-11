<script lang="ts">
	import { cn } from '$lib/utils/cn';

	let customClasses = '';
	export { customClasses as class };
</script>

<th class={cn('px-2 text-start align-middle', customClasses)}>
	<slot />
</th>
