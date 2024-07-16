<script lang="ts">
	import SpinnerCargando from '$lib/components/SpinnerCargando.svelte';
	import Swal from 'sweetalert2';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { auth } from '../../firebase';
	import { logo } from '../../lib/images/logo';

	let estadoActual = { iniciandoSesion: false };
	let usuario = { correo: '', contrasena: '' };

	const iniciarSesionConContrasena = async () => {
		console.clear();
		console.log('se iniciará sesion con los datos', usuario);

		if (usuario.correo === '') {
			Swal.fire({ icon: 'info', title: 'Valide datos', text: 'Debe digitar el correo' });
			return;
		}
		if (usuario.contrasena === '') {
			Swal.fire({ icon: 'info', title: 'Valide datos', text: 'Debe digitar la contraseña' });
			return;
		}

		estadoActual.iniciandoSesion = true;

		signInWithEmailAndPassword(auth, usuario.correo, usuario.contrasena)
			.then((userCredential) => {
				console.log('usuario autenticado', auth);
				estadoActual.iniciandoSesion = false;
				const user = userCredential.user;
			})
			.catch((error) => {
				estadoActual.iniciandoSesion = false;
				const errorCode = error.code;
				const errorMessage = error.message;
				switch (errorCode) {
					case 'auth/user-not-found':
						Swal.fire({
							icon: 'error',
							title: 'Error al iniciar sesión',
							text: 'Usuario no encontrado',
						});
						break;
					case 'auth/wrong-password':
						Swal.fire({
							icon: 'error',
							title: 'Error al iniciar sesión',
							text: 'Contraseña incorrecta',
						});
						break;
				}
			});
	};
</script>

<svelte:head>
	<title>Iniciar Sesión</title>
	<meta name="description" content="Iniciar sesión" />
</svelte:head>

<div class="contenedorPrincipal">
	<div class="flex flex-col items-center">
		<img alt="logo" src={logo} class="w-80 h-45" />
	</div>
	<div class="fila-1columna mt-8">
		<div class="tarjeta sm:w-1/2 w-full">
			<div class="tarjeta-header">Iniciar Sesión</div>
			<form method="POST" on:submit|preventDefault={iniciarSesionConContrasena}>
				<div class="tarjeta-body">
					<div>
						<label for="usuario" class="input-label">Usuario</label>
						<input class="input-texto" bind:value={usuario.correo} type="text" />
					</div>
					<div>
						<label for="contrasena" class="input-label">Contrasena</label>
						<input class="input-texto" bind:value={usuario.contrasena} type="password" />
					</div>
					<div class="flex flex-col items-center">
						{#if estadoActual.iniciandoSesion}
							<SpinnerCargando />
						{:else}
							<button class="boton-principal fondoVerdeFagar" type="submit">Iniciar Sesión</button>
						{/if}
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
