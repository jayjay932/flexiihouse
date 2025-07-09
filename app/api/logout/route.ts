import { NextResponse } from 'next/server';
import { signOut } from 'next-auth/react';

export async function POST() {
  try {
    // ⚠️ En app directory, signOut côté serveur n'est pas supporté directement
    // Donc on retourne juste un statut pour dire que le logout doit être fait côté client
    return NextResponse.json({ message: 'Logout initiated' });
  } catch (error) {
    console.error("Erreur logout", error);
    return NextResponse.json({ error: 'Erreur lors de la déconnexion' }, { status: 500 });
  }
}
