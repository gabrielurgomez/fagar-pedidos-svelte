/*import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { pool } from './../../../mysql.config';


export const GET: RequestHandler = async () => {
    try {
        const [productos] = await pool.query('SELECT * FROM `productos`');
        if (productos.length > 0) {
            return new Response(JSON.stringify(productos), {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            return new Response('[]', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch (e) {
        console.error(e);
        throw error(500, 'Internal Server Error');
    }
};*/