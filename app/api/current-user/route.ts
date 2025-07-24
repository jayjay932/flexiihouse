// app/api/current-user/route.ts
import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    return NextResponse.json(currentUser);
  } catch (error) {
    console.error("Erreur API current-user:", error);
    return NextResponse.json(null, { status: 401 });
  }
}