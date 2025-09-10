import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  listingId?: string;
}

// ✅ GET - Récupérer un listing par ID
export async function GET(
  req: NextRequest,
  { params }: { params: IParams }
) {
  try {
    const { listingId } = params;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "ID listing invalide" }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        user: true,
        images: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("Erreur GET listing:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ✅ PUT - Modifier un listing
export async function PUT(
  req: NextRequest,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = params;
    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "ID listing invalide" }, { status: 400 });
    }

    const body = await req.json();

    // Vérifier que l'utilisateur est bien propriétaire
    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });
    }
    if (existingListing.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ⚡ Préparer les données de mise à jour
    const updateData: any = {};

    // Champs simples
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.city) updateData.city = body.city;
    if (body.quater) updateData.quater = body.quater;
    if (body.category) updateData.category = body.category;
    if (body.listing_type) updateData.listing_type = body.listing_type;
    if (body.rental_type) updateData.rental_type = body.rental_type;
    if (body.location) updateData.locationValue = body.location.value;

    // Nombres
    if (body.price) updateData.price = Number(body.price);
    if (body.price_per_month) updateData.price_per_month = Number(body.price_per_month);
    if (body.guestCount) updateData.guestCount = Number(body.guestCount);
    if (body.roomCount) updateData.roomCount = Number(body.roomCount);
    if (body.bathroomCount) updateData.bathroomCount = Number(body.bathroomCount);
    if (body.toilets) updateData.toilets = Number(body.toilets);

    // Images (remplacer toutes les anciennes)
    if (Array.isArray(body.images)) {
      updateData.images = {
        deleteMany: {}, // supprime toutes les anciennes
        create: body.images
          .filter((url: string) => url && typeof url === "string")
          .map((url: string) => ({ url })),
      };
    }

    // Equipements (booléens)
    const amenities = [
      "has_wifi",
      "has_kitchen",
      "has_parking",
      "has_pool",
      "has_balcony",
      "has_garden",
      "has_terrace",
      "has_living_room",
      "is_furnished",
      "has_tv",
      "has_air_conditioning",
      "has_washing_machin",
      "has_dryer",
      "has_iron",
      "has_hair_dryer",
      "has_fridge",
      "has_dishwasher",
      "has_oven",
      "has_fan",
      "has_elevator",
      "has_camera_surveillance",
      "has_security",
      "has_gym",
    ];

    amenities.forEach((field) => {
      if (field in body) updateData[field] = Boolean(body[field]);
    });

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error("Erreur PUT listing:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ✅ DELETE - Supprimer un listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = params;
    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json({ error: "ID listing invalide" }, { status: 400 });
    }

    const existingListing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!existingListing) {
      return NextResponse.json({ error: "Listing introuvable" }, { status: 404 });
    }
    if (existingListing.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.listing.delete({ where: { id: listingId } });

    return NextResponse.json({ message: "Listing supprimé avec succès" });
  } catch (error) {
    console.error("Erreur DELETE listing:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
