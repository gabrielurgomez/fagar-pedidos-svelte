<script lang="ts">
	export let mostrarModal: Boolean;
	let dialog: HTMLDialogElement;

	$: if (dialog && mostrarModal) dialog.showModal();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<dialog
	bind:this={dialog}
	on:close={() => (mostrarModal = false)}
	on:click|self={() => dialog.close()}
	class="w-full sm:w-1/2 h-screen rounded-md border-none overflow-y-auto"
>
	<slot></slot>
	<div class="border-b"></div>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div on:click|stopPropagation class="p-4">
		<!-- svelte-ignore a11y-autofocus -->
		<button
			class="text-red-600 hover:text-red-400 mt-2 block font-bold"
			autofocus
			on:click={() => dialog.close()}
		>
			Cancelar
		</button>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.8);
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
