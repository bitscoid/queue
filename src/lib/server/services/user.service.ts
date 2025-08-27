import bcrypt from "bcryptjs";
import prisma from "$lib/server/prisma";

const userSelect = {
  id: true,
  code: true,
  name: true,
  email: true,
  role: true,
  photo: true,
  queueId: true,
  createdAt: true,
  updatedAt: true,
  queue: {
    select: {
      id: true,
      name: true,
      code: true,
      ticketPrefix: true,
    },
  },
};

/**
 * Ambil semua user
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Ambil user by ID
 */
export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

/**
 * Ambil user by email
 */
export async function getUserByEmail(email: string) {
  if (!email) return null; // karena nullable
  return prisma.user.findUnique({
    where: { email },
    // butuh password untuk login, jadi jangan pakai userSelect
    select: {
      id: true,
      code: true,
      name: true,
      email: true,
      password: true,
      role: true,
      photo: true,
      queueId: true,
    },
  });
}

/**
 * Buat user baru
 */
export async function createUser({
  code,
  name,
  email,
  password,
  photo,
  role,
  queueId,
}: {
  code?: string;
  name: string;
  email?: string;
  password: string;
  photo?: string;
  role?: "admin" | "user";
  queueId?: number | null;
}) {
  if (email) {
    const existing = await getUserByEmail(email);
    if (existing) {
      throw new Error("Email sudah terdaftar");
    }
  }

  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      code,
      name,
      email,
      password: hashed,
      photo: photo ?? undefined,
      role: role ?? "user",
      queueId: queueId ?? null,
    },
    select: userSelect,
  });
}

/**
 * Update user
 */
export async function updateUser(
  id: number,
  {
    code,
    name,
    email,
    password,
    photo,
    role,
    queueId,
  }: {
    code?: string;
    name?: string;
    email?: string;
    password?: string;
    photo?: string;
    role?: "admin" | "user";
    queueId?: number | null;
  },
) {
  const data: Partial<{
    code: string;
    name: string;
    email: string;
    password: string;
    photo: string;
    role: "admin" | "user";
    queueId: number | null;
  }> = {};

  if (code) data.code = code;
  if (name) data.name = name;
  if (email !== undefined) {
    if (email) {
      const existing = await getUserByEmail(email);
      if (existing && existing.id !== id) {
        throw new Error("Email sudah digunakan oleh user lain");
      }
    }
    data.email = email;
  }
  if (photo !== undefined) data.photo = photo;
  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }
  if (role) data.role = role;
  if (queueId !== undefined) data.queueId = queueId;

  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

/**
 * Hapus user
 */
export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: { id },
    select: { id: true, name: true, email: true },
  });
}

/**
 * Validasi password user
 */
export async function validatePassword(email: string, plainPassword: string) {
  if (!email) return null; // karena email bisa null
  const user = await getUserByEmail(email);
  if (!user) return null;

  const match = await bcrypt.compare(plainPassword, user.password);
  if (!match) return null;

  return {
    id: user.id,
    code: user.code,
    name: user.name,
    email: user.email,
    photo: user.photo,
    role: user.role,
    queueId: user.queueId,
  };
}
