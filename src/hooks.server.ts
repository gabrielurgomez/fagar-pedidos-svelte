import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Intercepta la solicitud de Chrome DevTools y responde silenciosamente
	//Lo hice para no ver en consola el error => SvelteKitError: Not found: /.well-known/appspecific/com.chrome.devtools.json
	//cada vez que corria el servidor de desarrollo
	if (event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(JSON.stringify({}), {
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	// Procesa normalmente todas las demás solicitudes
	return await resolve(event);
};
