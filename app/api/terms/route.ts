// /app/api/terms/route.ts
import { NextResponse } from 'next/server';
import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();
  const { accepted } = body;

  try {
    await prisma.userTermsAcceptance.upsert({
      where: { userId: currentUser.id },
      update: { accepted },
      create: { userId: currentUser.id, accepted },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 });
  }
}
