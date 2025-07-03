import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; // Utilisation sécurisée pour Next.js

import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, numberPhone, name, password } = body;

    // Vérifie que le nom et mot de passe sont présents
    if (!name || !password) {
      return new NextResponse("Nom ou mot de passe manquant", { status: 400 });
    }

    // L’utilisateur doit fournir soit un email, soit un numéro
    if (!email && !numberPhone) {
      return new NextResponse("Email ou numéro requis", { status: 400 });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        numberPhone: numberPhone || null,
        hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de l'inscription :", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
