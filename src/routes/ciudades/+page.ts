/*import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function load() {
    try {
        const ciudades = await prisma.ciudades.findMany();
        console.log('ciudades', ciudades);
        await prisma.$disconnect();
        if (ciudades.length > 0) {
            return ciudades
        } else {
            return []
        }
    } catch (e) {
        console.log('error', e);
        return []
    }

}*/