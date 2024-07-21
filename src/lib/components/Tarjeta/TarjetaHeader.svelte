<script lang="ts">
	export let titulo: string = '';
</script>

{#if titulo}
	<div class="border-b-2 text-lg border-neutral-100 py-4 flex flex-row justify-center items-center">
		{titulo}
	</div>
{/if}
