import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    title,
    description,
    images,
    category,
    roomCount,
    bathroomCount,
      toilets,
    guestCount,
    location,
    price,
    price_per_month,
    rental_type,
    city,
    quater,
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
    listing_type,
    has_gym,
  } = body;

  if (
    !title || !description || !images || !category || !roomCount || !bathroomCount ||!toilets||
    !guestCount || !location || !rental_type || !city || !quater
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (rental_type === "mensuel" && !price_per_month) {
    return NextResponse.json({ error: "Monthly price is required" }, { status: 400 });
  }

  if (rental_type === "courte" && !price) {
    return NextResponse.json({ error: "Price per night is required" }, { status: 400 });
  }

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        category,
        roomCount,
        bathroomCount,
        toilets, // Ajout de la propriété toiletCount
        guestCount,
        locationValue: location.value,
        price: rental_type === "courte" ? parseInt(price, 10) : 0,
        price_per_month: rental_type === "mensuel" ? parseInt(price_per_month, 10) : 0,
        rental_type,
        userId: currentUser.id,
        city,
        quater,
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
        listing_type,
        has_gym,
        images: {
          create: images.map((url: string) => ({ url })),
        },
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
