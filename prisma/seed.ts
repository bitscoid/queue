// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

export default async function seed() {
  // --- Admin ---
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@rizaputra.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@rizaputra.com',
      password: hashedAdminPassword,
      role: 'admin',
    },
  })

  // --- Setting ---
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Riza Putra',
      description: 'Aplikasi Antrian Percetakan Riza Putra.',
      logo: '/uploads/1758527902638-7bdf387a-a924-48be-8154-23a247167de5.png',
    },
  })

  // --- QUEUE ---
  const desainer = await prisma.queue.upsert({
    where: { code: 'DESAINER' },
    update: {},
    create: { code: 'DESAINER', name: 'Layanan Desainer', ticketPrefix: 'D' },
  })

  // --- USERS / LOKET ---
  const hashedUserPassword = await bcrypt.hash('user123', 10)

  // Loket Desainer PC-1 … PC-6
  for (let i = 1; i <= 6; i++) {
    const code = `PC-${i.toString()}`
    const email = `pc${i.toString()}@rizaputra.com`
    await prisma.user.upsert({
      where: { email }, // ✅ pakai email karena unique
      update: {},
      create: {
        name: `${code}`,
        code,
        email,
        password: hashedUserPassword,
        role: 'user',
        queueId: desainer.id,
      },
    })
  }

  // --- DailySequence --- (untuk nomor tiket per hari)
  const today = new Date()
  await prisma.dailySequence.createMany({
    data: [
      { queueId: desainer.id, date: today, nextSeq: 1 },
    ],
  })

  console.log('✅ Seed selesai')
}

// Cek apakah file ini dijalankan langsung (bukan di-import)
const isMain = process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  seed()
    .then(async () => {
      await prisma.$disconnect()
    })
    .catch(async (e) => {
      console.error('❌ Gagal seed:', e)
      await prisma.$disconnect()
      process.exit(1)
    })
}
