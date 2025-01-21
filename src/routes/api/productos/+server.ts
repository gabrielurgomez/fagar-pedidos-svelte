import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { pool } from './../../../mysql.config';
import type { ProductoConsultado } from '$lib/types';


export const GET: RequestHandler = async () => {
    try {
        const [rows] = await pool.query('SELECT id, nombre, cantidadEnvases, tipoAceite, peso FROM `Productos`');
        let productos = rows as ProductoConsultado[];
        //console.log('productos', productos);
        //se le agrega la clave tipo: 'principal' para que el front lo pueda identificar
        productos = productos.map(producto => {
            return {
                ...producto,
                tipo: 'principal'
            }
        });
        //console.log('productos', productos);
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
};