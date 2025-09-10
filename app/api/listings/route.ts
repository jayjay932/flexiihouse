import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// ✅ POST - Créer un nouveau listing
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const {
      title,
      description,
      images,
      location,
      roomCount,
      bathroomCount,
      toilets,
      guestCount,
      price,
      price_per_month,
      rental_type,
      city,
      quater,
      category,
      listing_type,
      // équipements
      has_wifi,
      has_kitchen,
      has_parking,
      has_pool,
      has_balcony,
      has_garden,
      has_terrace,
      has_living_room,
      is_furnished,
      has_tv,
      has_air_conditioning,
      has_washing_machin,
      has_dryer,
      has_iron,
      has_hair_dryer,
      has_fridge,
      has_dishwasher,
      has_oven,
      has_fan,
      has_elevator,
      has_camera_surveillance,
      has_security,
      has_gym,
    } = body;

    // ✅ validation minimale
    if (!title || !description || !category || !listing_type || !city || !quater) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
    }

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "Au moins une image est requise" }, { status: 400 });
    }

    // ✅ création du listing
    const newListing = await prisma.listing.create({
      data: {
        title,
        description,
        locationValue: location?.value || null,
        roomCount: Number(roomCount) || 0,
        bathroomCount: Number(bathroomCount) || 0,
        toilets: Number(toilets) || 0,
        guestCount: Number(guestCount) || 1,
        price: Number(price) || 0,
        price_per_month: Number(price_per_month) || 0,
        rental_type,
        city,
        quater,
        category,
        listing_type,
        userId: currentUser.id,

        // équipements
        has_wifi: Boolean(has_wifi),
        has_kitchen: Boolean(has_kitchen),
        has_parking: Boolean(has_parking),
        has_pool: Boolean(has_pool),
        has_balcony: Boolean(has_balcony),
        has_garden: Boolean(has_garden),
        has_terrace: Boolean(has_terrace),
        has_living_room: Boolean(has_living_room),
        is_furnished: Boolean(is_furnished),
        has_tv: Boolean(has_tv),
        has_air_conditioning: Boolean(has_air_conditioning),
        has_washing_machin: Boolean(has_washing_machin),
        has_dryer: Boolean(has_dryer),
        has_iron: Boolean(has_iron),
        has_hair_dryer: Boolean(has_hair_dryer),
        has_fridge: Boolean(has_fridge),
        has_dishwasher: Boolean(has_dishwasher),
        has_oven: Boolean(has_oven),
        has_fan: Boolean(has_fan),
        has_elevator: Boolean(has_elevator),
        has_camera_surveillance: Boolean(has_camera_surveillance),
        has_security: Boolean(has_security),
        has_gym: Boolean(has_gym),

        // relation images
        images: {
          create: images
            .filter((url: string) => url && typeof url === "string")
            .map((url: string) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json(newListing);
  } catch (error) {
    console.error("Erreur lors de la création du listing:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
