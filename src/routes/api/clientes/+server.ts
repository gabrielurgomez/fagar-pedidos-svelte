import { error } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from '@sveltejs/kit';

const prisma = new PrismaClient();

export const GET: RequestHandler = async () => {
    try {
        const clientes = await prisma.clientes.findMany(
            {
                include: {
                    sedesClientes: true
                }
            }
        );
        await prisma.$disconnect();
        if (clientes.length > 0) {
            return new Response(JSON.stringify(clientes), {
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