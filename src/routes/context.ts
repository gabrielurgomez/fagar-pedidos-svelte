import { writable, type Writable } from 'svelte/store';
import { getContext, setContext } from 'svelte';

type Usuario = {
	email: string;
	urlFotoPerfil: string;
};
type Context = Writable<{
	email: string;
	urlFotoPerfil: string;
}>;

export function setUsuarioLogueado() {
	const usuarioLogueado = writable<Usuario>({
		email: '',
		urlFotoPerfil: '',
	});
	setContext('usuarioLogueado', usuarioLogueado);
}

export function getUsuarioLogueado() {
	return getContext<Context>('usuarioLogueado');
}
