

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";
import { NextRequest, NextResponse } from "next/server";

interface IParams {
  listingId?: string;
}

// GET - Récupérer un listing par ID
export async function GET(
  request: NextRequest,
  { params }: { params: IParams }
) {
  try {
    const { listingId } = params;

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { error: "ID listing invalide" }, 
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId
      },
      include: {
        user: true, // Inclure les infos utilisateur si nécessaire
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing introuvable" }, 
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Erreur lors de la récupération du listing:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du listing" },
      { status: 500 }
    );
  }
}

// PUT - Modifier un listing
export async function PUT(
  request: NextRequest,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = params;

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { error: "ID listing invalide" }, 
        { status: 400 }
      );
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
      listing_type,
      // Amenities
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

    // Vérifier que l'utilisateur est propriétaire du listing
    const existingListing = await prisma.listing.findUnique({
      where: {
        id: listingId
      }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing introuvable" }, 
        { status: 404 }
      );
    }

    if (existingListing.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId
      },
      data: {
        title,
        description,
        images,
        category,
        roomCount,
        bathroomCount,
        toilets,
        guestCount,
        locationValue: location?.value,
        price,
        price_per_month,
        rental_type,
        city,
        quater,
        listing_type,
        // Amenities
        has_wifi: has_wifi || false,
        has_kitchen: has_kitchen || false,
        has_parking: has_parking || false,
        has_pool: has_pool || false,
        has_balcony: has_balcony || false,
        has_garden: has_garden || false,
        has_terrace: has_terrace || false,
        has_living_room: has_living_room || false,
        is_furnished: is_furnished || false,
        has_tv: has_tv || false,
        has_air_conditioning: has_air_conditioning || false,
        has_washing_machin: has_washing_machin || false,
        has_dryer: has_dryer || false,
        has_iron: has_iron || false,
        has_hair_dryer: has_hair_dryer || false,
        has_fridge: has_fridge || false,
        has_dishwasher: has_dishwasher || false,
        has_oven: has_oven || false,
        has_fan: has_fan || false,
        has_elevator: has_elevator || false,
        has_camera_surveillance: has_camera_surveillance || false,
        has_security: has_security || false,
        has_gym: has_gym || false,
      }
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du listing:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du listing" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: IParams }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = params;

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { error: "ID listing invalide" }, 
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire du listing
    const existingListing = await prisma.listing.findUnique({
      where: {
        id: listingId
      }
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing introuvable" }, 
        { status: 404 }
      );
    }

    if (existingListing.userId !== currentUser.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.listing.delete({
      where: {
        id: listingId
      }
    });

    return NextResponse.json({ message: "Listing supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression du listing:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du listing" },
      { status: 500 }
    );
  }
}