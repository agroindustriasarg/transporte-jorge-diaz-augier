import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      usuario: 'admin',
      email: 'admin@transporte.com',
      password: hashedPassword,
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: 'ADMIN',
    },
  });

  console.log('✅ Usuario admin creado:', user.usuario);
  await prisma.$disconnect();
}

createAdmin().catch(console.error);
