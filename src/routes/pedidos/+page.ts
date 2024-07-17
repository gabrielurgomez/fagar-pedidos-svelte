import { pool } from '../../mysql.config';
import { error } from '@sveltejs/kit';

export async function load() {
    try {
        const [productos] = await pool.query('SELECT * FROM `productos`');
        console.log('productos', productos)
        /*if (productos.length > 0) {
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
        }*/
    } catch (e) {
        console.error(e);
        throw error(500, 'Internal Server Error');
    }

}


