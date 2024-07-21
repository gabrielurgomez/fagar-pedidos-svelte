<script>
	export let tamano = 0;
	let isHovered = false;
</script>

<div
	role="button"
	tabindex="0"
	on:mouseover={() => (isHovered = true)}
	on:mouseout={() => (isHovered = false)}
	on:focus={() => (isHovered = true)}
	on:blur={() => (isHovered = false)}
>
	<!-- Caneca cerrada -->
	<svg
		class:hidden={isHovered}
		fill="#fca5a5"
		version="1.1"
		id="Capa_1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		width={tamano}
		height={tamano}
		viewBox="0 0 490.646 490.646"
		xml:space="preserve"
	>
		<g>
			<g>
				<path
					d="M399.179,67.285l-74.794,0.033L324.356,0L166.214,0.066l0.029,67.318l-74.802,0.033l0.025,62.914h307.739L399.179,67.285z
				M198.28,32.11l94.03-0.041l0.017,35.262l-94.03,0.041L198.28,32.11z"
				/>
				<path
					d="M91.465,490.646h307.739V146.359H91.465V490.646z M317.461,193.372h16.028v250.259h-16.028V193.372L317.461,193.372z
				M237.321,193.372h16.028v250.259h-16.028V193.372L237.321,193.372z M157.18,193.372h16.028v250.259H157.18V193.372z"
				/>
			</g>
		</g>
	</svg>

	<!-- Caneca abierta -->
	<svg
		class:hidden={!isHovered}
		fill="#ef4444"
		version="1.1"
		id="Capa_1"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		width={tamano}
		height={tamano}
		viewBox="0 0 489.74 489.74"
		xml:space="preserve"
	>
		<g>
			<g>
				<path
					d="M361.051,199.929H102.01V489.74h259.041V199.929L361.051,199.929z M170.818,450.163h-13.492V239.505h13.492V450.163z
				M238.276,450.163h-13.492V239.505h13.492V450.163z M305.734,450.163h-13.492V239.505h13.492V450.163z"
				/>
				<path
					d="M387.73,145.959l-52.74-30.672l28.129-48.365L248.047,0l-28.127,48.362l-56.113-32.634l-26.678,45.875l223.922,130.231
				L387.73,145.959z M257.808,36.891l68.421,39.792l-14.564,25.038L243.241,61.93L257.808,36.891z"
				/>
			</g>
		</g>
	</svg>
</div>

<style>
	.hidden {
		display: none;
	}
</style>
