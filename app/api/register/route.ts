// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/libs/prismadb";
import { Prisma } from "@prisma/client";

// --- helpers ---
const normalizeEmail = (email?: string) =>
  email ? email.trim().toLowerCase() : undefined;

const normalizePhone = (num?: string) => {
  if (!num) return undefined;
  // garde + et chiffres
  const cleaned = num.trim().replace(/[^\d+]/g, "");
  return cleaned || undefined;
};

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function json(status: number, message: string, extra: Record<string, any> = {}) {
  return NextResponse.json({ message, ...extra }, { status });
}

export async function POST(request: Request) {
  const requestId = Math.random().toString(36).slice(2, 9); // id court de debug
  const startedAt = Date.now();
  try {
    const body = await request.json();
    let { email, numberPhone, name, password } = body ?? {};

    console.log(`[register#${requestId}] body:`, {
      name,
      email,
      numberPhone,
      passwordLen: password?.length ?? 0,
    });

    // validations de base
    if (!name || typeof name !== "string" || !name.trim()) {
      console.warn(`[register#${requestId}] 400: name missing`);
      return json(400, "Nom requis");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      console.warn(`[register#${requestId}] 400: password too short`);
      return json(400, "Mot de passe trop court (8 caractères min.)");
    }

    // normaliser
    email = normalizeEmail(email);
    numberPhone = normalizePhone(numberPhone);
    console.log(`[register#${requestId}] normalized:`, { email, numberPhone });

    // au moins l’un des deux
    if (!email && !numberPhone) {
      console.warn(
        `[register#${requestId}] 400: both email & phone missing after normalization`
      );
      return json(400, "Email ou numéro de téléphone requis");
    }

    if (email && !isValidEmail(email)) {
      console.warn(`[register#${requestId}] 400: invalid email`);
      return json(400, "Email invalide");
    }

    // existence explicite (évite 500 Prisma)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existingEmail) {
        console.warn(`[register#${requestId}] 409: email already used`);
        return json(409, "Cet email est déjà utilisé");
      }
    }

    if (numberPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { numberPhone },
        select: { id: true },
      });
      if (existingPhone) {
        console.warn(`[register#${requestId}] 409: phone already used`);
        return json(409, "Ce numéro est déjà utilisé");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // IMPORTANT: ne pas mettre `null` pour les uniques — on omet le champ
    const data: any = {
      name: name.trim(),
      hashedPassword,
    };
    if (email) data.email = email;
    if (numberPhone) data.numberPhone = numberPhone;

    console.log(`[register#${requestId}] creating user...`);
    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        numberPhone: true,
        createdAt: true,
      },
    });

    const elapsed = Date.now() - startedAt;
    console.log(`[register#${requestId}] 201 OK in ${elapsed}ms ->`, user);
    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    const elapsed = Date.now() - startedAt;
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        const target = Array.isArray((err as any).meta?.target)
          ? (err as any).meta.target.join(", ")
          : "identifiant";
        console.warn(
          `[register#${requestId}] 409 P2002 (${target}) in ${elapsed}ms`
        );
        return json(409, `Conflit: ${target} déjà utilisé.`);
      }
    }
    console.error(
      `[register#${requestId}] 500 in ${elapsed}ms – unexpected error:`,
      err
    );
    return json(500, "Erreur serveur");
  }
}
