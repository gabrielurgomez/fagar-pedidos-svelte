import { PrismaClient, Prisma } from '@prisma/client';
import { json } from '@sveltejs/kit';

const prisma = new PrismaClient();

export async function POST({ request }) {
    try {
        const vendedor = await request.json();

        if (!vendedor.cedula || vendedor.cedula === "") { return json({ status: 400, message: 'Cedula no recibida en el servidor' }, { status: 400 }); }
        if (!vendedor.nombre || vendedor.nombre === "") { return json({ status: 400, message: 'Nombre no recibido en el servidor' }, { status: 400 }); }
        if (!vendedor.email || vendedor.email === "") { return json({ status: 400, message: 'Email no recibido en el servidor' }, { status: 400 }); }

        const rtaPrisma = await prisma.vendedores.create({
            data: {
                cedula: vendedor.cedula,
                nombre: vendedor.nombre,
                email: vendedor.email
            },
        });
        console.log('rtaPrisma', rtaPrisma);
        return json({ status: 201, message: `Vendedor creado con id ${rtaPrisma.id}` });
    }
    catch (e) {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return json({ status: 400, message: e.meta?.target === 'cedula' ? 'Cedula ya registrada' : 'Email ya registrado' }, { status: 400 });
            }
        }
        return json({ status: 500, message: 'Internal Server Error' })

    }

}

export async function PUT({ request }) {
    try {
        const vendedor = await request.json();

        if (!vendedor.id || vendedor.id === "") { return json({ status: 400, message: 'Id no recibido en el servidor' }, { status: 400 }); }
        if (!vendedor.cedula || vendedor.cedula === "") { return json({ status: 400, message: 'Cedula no recibida en el servidor' }, { status: 400 }); }
        if (!vendedor.nombre || vendedor.nombre === "") { return json({ status: 400, message: 'Nombre no recibido en el servidor' }, { status: 400 }); }

        const rtaPrisma = await prisma.vendedores.update({
            where: {
                id: vendedor.id
            },
            data: {
                cedula: vendedor.cedula,
                nombre: vendedor.nombre,
            },
        });
        console.log('rtaPrisma', rtaPrisma);
        return json({ status: 200, message: `Vendedor actualizado con id ${rtaPrisma.id}` });
    }
    catch (e) {
        console.error(e);
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2002') {
                return json({ status: 400, message: e.meta?.target === 'cedula' ? 'Cedula ya registrada' : 'Email ya registrado' }, { status: 400 });
            }
        }
        return json({ status: 500, message: 'Internal Server Error' })

    }

}
