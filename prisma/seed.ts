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
      name: 'BITS Project',
      description: 'Aplikasi Startup untuk mengelola proyek dan tim.',
      logo: '/uploads/placeholder.png',
    },
  })

  // --- QUEUE ---
  const desainer = await prisma.queue.upsert({
    where: { code: 'DESAINER' },
    update: {},
    create: { code: 'DESAINER', name: 'Layanan Desainer', ticketPrefix: 'RZD' },
  })

  const kasir = await prisma.queue.upsert({
    where: { code: 'KASIR' },
    update: {},
    create: { code: 'KASIR', name: 'Layanan Kasir', ticketPrefix: 'RZK' },
  })

  const pengambilan = await prisma.queue.upsert({
    where: { code: 'PENGAMBILAN' },
    update: {},
    create: { code: 'PENGAMBILAN', name: 'Layanan Pengambilan', ticketPrefix: 'RZS' },
  })

  // --- USERS / LOKET ---
  const hashedUserPassword = await bcrypt.hash('user123', 10)

  // Loket Desainer D-01 … D-06
  for (let i = 1; i <= 6; i++) {
    const code = `D-${i.toString().padStart(2, '0')}`
    const email = `d${i.toString().padStart(2, '0')}@rizaputra.com`
    await prisma.user.upsert({
      where: { email }, // ✅ pakai email karena unique
      update: {},
      create: {
        name: `Loket ${code}`,
        code,
        email,
        password: hashedUserPassword,
        role: 'user',
        queueId: desainer.id,
      },
    })
  }

  // Loket Kasir K-01 … K-03
  for (let i = 1; i <= 3; i++) {
    const code = `K-${i.toString().padStart(2, '0')}`
    const email = `k${i.toString().padStart(2, '0')}@rizaputra.com`
    await prisma.user.upsert({
      where: { email }, // ✅
      update: {},
      create: {
        name: `Loket ${code}`,
        code,
        email,
        password: hashedUserPassword,
        role: 'user',
        queueId: kasir.id,
      },
    })
  }

  // Loket Pengambilan S-01 … S-02
  for (let i = 1; i <= 2; i++) {
    const code = `S-${i.toString().padStart(2, '0')}`
    const email = `s${i.toString().padStart(2, '0')}@rizaputra.com`
    await prisma.user.upsert({
      where: { email }, // ✅
      update: {},
      create: {
        name: `Loket ${code}`,
        code,
        email,
        password: hashedUserPassword,
        role: 'user',
        queueId: pengambilan.id,
      },
    })
  }

  // --- DailySequence --- (untuk nomor tiket per hari)
  const today = new Date()
  await prisma.dailySequence.createMany({
    data: [
      { queueId: desainer.id, date: today, nextSeq: 1 },
      { queueId: kasir.id, date: today, nextSeq: 1 },
      { queueId: pengambilan.id, date: today, nextSeq: 1 },
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
