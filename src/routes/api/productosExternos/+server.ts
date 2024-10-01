import { error } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { pool } from './../../../mysql.config';
import type { ProductoExternoConsultado } from './../../../lib/types';


//Productos externos son los que no son empacados en caja o bidones, por ejemplo las margarinas
//En la base de datos de admon se encuentran en la tabla ProductosExternos
export const GET: RequestHandler = async () => {
    try {
        const [rows] = await pool.query('SELECT id, nombre FROM `ProductosExternos`');
        let productosExternos = rows as ProductoExternoConsultado[];
        //se le agrega la clave tipo: 'externo' para que el front lo pueda identificar
        productosExternos = productosExternos.map(producto => {
            return {
                ...producto,
                tipo: 'externo'
            }
        });
        //console.log('productos externos', productosExternos.length);
        if (productosExternos.length > 0) {
            return new Response(JSON.stringify(productosExternos), {
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