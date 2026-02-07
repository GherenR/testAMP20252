import prisma from './prisma';
import { hashPassword } from './password';

async function seedAdmin() {
    const email = 'admin@example.com';
    const name = 'Admin';
    const password = '12345678';
    const hashed = await hashPassword(password);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashed,
                role: 'admin',
            },
        });
        console.log('Default admin user created.');
    } else {
        console.log('Admin user already exists.');
    }
    await prisma.$disconnect();
}

seedAdmin();
