/*import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function consVendedores() {
    try {
        const vendedores = await prisma.vendedores.findMany();
        console.log('vendedores', vendedores);
        await prisma.$disconnect();
        return vendedores.length > 0 ? vendedores : [];
    } catch (e) {
        console.log('error', e);
        return [];
    }
}*/