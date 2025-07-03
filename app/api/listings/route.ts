import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();

  const {
    title,
    description,
    images,
    category,
    roomCount,
    bathroomCount,
    guestCount,
    location,
    price,
    price_per_month,
    rental_type,
    city,
    quater,

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
      listing_type, // ← ICI !
    has_gym,
  } = body;

  if (
    !title || !description || !images || !category || !roomCount || !bathroomCount ||
    !guestCount || !location || !rental_type || !city || !quater
  ) {
    return NextResponse.error();
  }

  if (rental_type === "mensuel" && !price_per_month) {
    return NextResponse.error();
  }

  if (rental_type === "courte" && !price) {
    return NextResponse.error();
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      category,
      roomCount,
      bathroomCount,
      guestCount,
      locationValue: location.value,
      price: rental_type === "courte" ? parseInt(price, 10) : 0,
      price_per_month: rental_type === "mensuel" ? parseInt(price_per_month, 10) : 0,
      rental_type,
      userId: currentUser.id,
      city,
      quater,

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
       listing_type, // ← ICI !
      has_gym,

      images: {
        create: images.map((url: string) => ({
          url,
        })),
      },
    },
  });

  return NextResponse.json(listing);
}
