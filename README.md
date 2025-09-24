# Riza Antrian - Sistem Manajemen Antrian Digital

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0+-FF3E00?logo=svelte)
![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3B82F6?logo=sqlite&logoColor=fff)

Sistem manajemen antrian digital lengkap berbasis web, dirancang untuk membantu organisasi mengelola proses antrian secara efisien dan profesional dengan antarmuka publik dan admin.

## ✨ Fitur Utama

- ✅ **Sistem Antrian Digital** - Pemanggilan nomor antrian secara real-time
- ✅ **Antarmuka Multi-Peran** - Admin, operator (loket), dan pengunjung
- ✅ **Real-time Updates** - WebSocket untuk sinkronisasi data instan
- ✅ **Tampilan Display** - Layar antrian untuk publik dengan animasi dan suara
- ✅ **Pengambilan Tiket** - Antarmuka publik untuk pengambilan nomor antrian
- ✅ **Manajemen Operator** - Multi-loket dengan status real-time
- ✅ **Sistem Audio** - Pengumuman suara otomatis untuk panggilan antrian
- ✅ **Autentikasi JWT** - Login aman dengan cookie untuk session
- ✅ **Manajemen Layanan** - Pembuatan dan pengaturan layanan/antrian
- ✅ **Panggilan Tiket** - Operator dapat memanggil, melayani, melewati, dan menyelesaikan tiket
- ✅ **Statistik Real-time** - Data antrian secara live termasuk total, menunggu, selesai, dilewat
- ✅ **API Tokens** - Akses eksternal melalui API keys
- ✅ **Pengaturan Aplikasi** - Konfigurasi nama, deskripsi, dan logo aplikasi
- ✅ **Responsive Design** - Mendukung perangkat mobile dan desktop

## 🚀 Quick Start

### Prerequisites

Pastikan Anda telah menginstall:

- **Node.js** 18.0 atau lebih baru
- **pnpm** 8.0 atau lebih baru
- **SQLite** atau PostgreSQL database (projek menggunakan SQLite sebagai default)

### Installation

1. **Clone repository ini:**

```bash
git clone <your-repository-url> riza-antrian
cd riza-antrian
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Setup environment variables:**

```bash
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Database Configuration (Default SQLite)
DATABASE_URL="file:./dev.db"

# JWT Secret Key (Ganti dengan secret yang kuat)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional: App Configuration
APP_NAME="Riza Antrian"
APP_URL="http://localhost:5173"
```

4. **Setup database dan jalankan aplikasi:**

```bash
# Setup database, jalankan migrations, dan seed data
pnpm bits

# Jalankan development server
pnpm dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser Anda untuk melihat aplikasi.

## 📁 Struktur Project

```
riza-antrian/
├── src/
│   ├── lib/
│   │   ├── components/       # Komponen Svelte yang bisa digunakan kembali
│   │   ├── layouts/          # Layout aplikasi
│   │   ├── server/           # Fungsi-fungsi server side
│   │   │   ├── prisma.ts     # Klien Prisma
│   │   │   ├── websocket.ts  # Server WebSocket
│   │   │   └── prismaMiddleware.ts  # Middleware Prisma untuk WebSocket
│   │   ├── client/           # Fungsi-fungsi client side
│   │   │   ├── services/     # Layanan client
│   │   │   └── stores/       # Store Svelte
│   │   ├── types/            # Definisi TypeScript
│   │   └── utils/            # Fungsi utilitas
│   ├── routes/
│   │   ├── (app)/            # Halaman aplikasi (admin/operator)
│   │   │   ├── dashboard/    # Dashboard admin
│   │   │   ├── calls/        # Halaman operator
│   │   │   ├── queues/       # Manajemen layanan
│   │   │   ├── tickets/      # Manajemen tiket
│   │   │   ├── users/        # Manajemen pengguna
│   │   │   ├── token/        # API tokens
│   │   │   └── settings/     # Pengaturan aplikasi
│   │   ├── (auth)/           # Halaman otentikasi
│   │   │   ├── login/
│   │   │   └── logout/
│   │   ├── (public)/         # Halaman publik
│   │   │   ├── antrian/      # Ambil nomor antrian
│   │   │   └── display/      # Tampilan layar antrian
│   │   ├── api/              # Endpoint API
│   │   │   ├── auth/         # Otentikasi
│   │   │   ├── queues/       # Layanan
│   │   │   ├── tickets/      # Tiket
│   │   │   ├── users/        # Pengguna
│   │   │   ├── settings/     # Pengaturan
│   │   │   ├── websocket/    # WebSocket (placeholder)
│   │   │   └── reset/        # Reset antrian
│   │   ├── +layout.svelte    # Layout utama
│   │   └── +page.svelte      # Halaman login
│   ├── app.html             # Template HTML
│   ├── app.css              # Gaya global
│   └── hooks.server.ts      # Server hooks (termasuk WebSocket)
├── prisma/
│   ├── schema.prisma        # Schema database
│   └── seed.ts              # Data seed awal
├── static/                  # Aset statis
└── package.json             # Dependencies dan skrip
```

## 🛠️ Available Scripts

### Development Scripts

| Command        | Description                           |
| -------------- | ------------------------------------- |
| `pnpm dev`     | Menjalankan development server        |
| `pnpm build`   | Build aplikasi untuk production       |
| `pnpm preview` | Preview production build secara lokal |
| `pnpm lint`    | Menjalankan ESLint untuk code linting |
| `pnpm format`  | Format code dengan Prettier           |
| `pnpm check`   | Menjalankan type checking             |

### Database Scripts

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `pnpm bits`          | Full setup: install + database migration + seed |
| `pnpm bits:reset`    | Reset database + fresh setup                    |
| `pnpm bits:prod`     | Production deployment setup                     |
| `pnpm db:reset`      | Reset database saja                             |
| `pnpm seed`          | Menjalankan seed data                           |
| `pnpm prisma studio` | Membuka Prisma Studio GUI                       |

## 🗄️ Database Schema

### Model User

- `id`: Int @id @default(autoincrement())
- `code`: String? @unique (kode operator untuk loket)
- `name`: String
- `email`: String? @unique
- `password`: String
- `role`: Role (@default(user) - user/operator atau admin)
- `photo`: String @default("/uploads/placeholder.png")
- `queueId`: Int? (layanan yang ditangani)
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime @updatedAt

### Model Queue (Layanan/Antrian)

- `id`: Int @id @default(autoincrement())
- `code`: String @unique (mis: "DESAINER", "KASIR", "PENGAMBILAN")
- `name`: String
- `ticketPrefix`: String (mis. "RZD", "RZK", "RZS")
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime @updatedAt

### Model Ticket (Tiket/Antrian)

- `id`: Int @id @default(autoincrement())
- `queueId`: Int
- `seqNumber`: Int (nomor urut per queue per hari)
- `fullNumber`: String (mis. RZD-001)
- `status`: TicketStatus @default(PENDING) (PENDING, CALLED, SERVING, SKIPPED, COMPLETED, CANCELLED)
- `date`: DateTime (tanggal pembuatan)
- `createdAt`: DateTime @default(now())
- `updatedAt`: DateTime @updatedAt
- `servedByUserId`: Int? (operator yang menangani)

### Model DailySequence (Pengaturan Harian)

- `id`: Int @id @default(autoincrement())
- `queueId`: Int
- `date`: DateTime
- `nextSeq`: Int @default(1) (urutan berikutnya)
- `updatedAt`: DateTime @updatedAt

### Model Setting (Pengaturan Sistem)

- `id`: Int @id @default(1)
- `name`: String
- `description`: String
- `logo`: String?

### Model ApiToken (Token API)

- `id`: Int @id @default(autoincrement())
- `name`: String
- `token`: String @unique
- `createdAt`: DateTime @default(now())
- `revoked`: Boolean @default(false)
- `createdBy`: Int (user yang membuat)

## 🔐 Sistem Otentikasi

Aplikasi memiliki sistem otentikasi berbasis JWT:

- Role: `admin` dan `user` (operator)
- Protected route dengan middleware
- Session management dengan cookies
- API auth dengan Bearer tokens

## 🎫 Sistem Antrian

### Pengambilan Tiket

- Antarmuka publik untuk pengambilan nomor antrian
- Nomor unik harian per layanan
- Cetak otomatis tiket
- Tampilan animasi tiket

### Manajemen Operator

- Dashboard operator untuk memanggil antrian
- Status real-time: PENDING, CALLED, SERVING, COMPLETED, SKIPPED
- Tampilan display publik dengan animasi dan audio

### Fungsi Tiket

- `call`: Panggil tiket berikutnya
- `serve`: Mulai melayani tiket
- `skip`: Lewati tiket saat ini
- `complete`: Selesaikan tiket
- `recall`: Panggil ulang tiket

## 🔊 Sistem Audio

- Pengumuman suara otomatis untuk panggilan antrian
- Support angka 0-999 (dalam bahasa Indonesia)
- Support lokasi (loket) dalam pengumuman
- File audio disimpan di `/static/uploads/audio/`

## 📡 Real-time Updates

- WebSocket server berjalan di port 4000
- Sinkronisasi real-time antara tampilan, operator, dan admin
- Middleware Prisma untuk otomatis kirim update saat data berubah

## 📊 Statistik Antrian

- Tampilan real-time jumlah total antrian
- Jumlah antrian yang sedang ditangani
- Jumlah antrian yang menunggu
- Jumlah antrian yang selesai
- Jumlah antrian yang dilewat

## 🧪 Testing

Aplikasi ini telah dirancang untuk mendukung testing, meskipun file test belum disediakan. Struktur aplikasi siap untuk unit testing dan integration testing menggunakan Vitest.

## 📦 Deployment

### Deployment ke Vercel

1. **Push code ke Git repository**
2. **Connect ke Vercel:**
   - Login ke [Vercel](https://vercel.com)
   - Import project dari Git repository
   - Configure environment variables di Vercel dashboard
3. **Environment variables untuk Vercel:**

```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
```

### Self-hosted Deployment

1. **Build aplikasi:**

```bash
pnpm build
```

2. **Jalankan production server:**

```bash
pnpm preview
```

## 🤝 Contributing

Kontribusi sangat dipersilakan! Berikut cara untuk berkontribusi:

1. **Fork project ini**
2. **Buat feature branch:**

```bash
git checkout -b feature/amazing-feature
```

3. **Commit changes Anda:**

```bash
git commit -m 'Add some amazing feature'
```

4. **Push ke branch:**

```bash
git push origin feature/amazing-feature
```

5. **Buka Pull Request**

### Development Guidelines

- Ikuti coding style yang sudah ada
- Tambahkan tests untuk fitur baru
- Update documentation sesuai kebutuhan
- Gunakan conventional commit messages

## 📝 License

Distributed under the MIT License. See `LICENSE` file untuk detail lengkap.

## 🆓 Support

Jika Anda mengalami masalah atau memiliki pertanyaan:

- 🐛 **Report Bugs**: [Create Issue](https://github.com/bitscoid/queue.git/issues)
- 💡 **Request Features**: [Feature Requests](https://github.com/bitscoid/queue.git/issues)
- 💬 **Discussion**: [Join Discussion](https://github.com/bitscoid/queue.git/discussions)

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - The web framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [DaisyUI](https://daisyui.com/) - UI components
- [Lucide Icons](https://lucide.dev/) - Beautiful icons
- [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) - Real-time communication

---

**Dikembangkan dengan ❤️ oleh Banten IT Solutions**

**Website**: [https://bits.co.id](https://bits.co.id)

**Email**: admin@bits.co.id

**GitLab**: [https://gitlab.com/rizaputra/riza-antrian](https://gitlab.com/rizaputra/riza-antrian)

---

**⭐ Jika project ini membantu Anda, jangan lupa untuk memberikan star di repository!**
