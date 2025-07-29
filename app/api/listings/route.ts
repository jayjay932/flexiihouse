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
        user: true,
        images: true, // Inclure les images de la relation
      }
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing introuvable" }, 
        { status: 404 }
      );
    }

    // Debug pour voir les images récupérées
    console.log("=== DEBUG API GET ===");
    console.log("Listing ID:", listing.id);
    console.log("Titre:", listing.title);
    console.log("Images récupérées:", listing.images);
    console.log("Nombre d'images:", listing.images?.length || 0);
    if (listing.images && listing.images.length > 0) {
      console.log("Première image:", listing.images[0]);
    }
    console.log("=== FIN DEBUG ===");

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
    console.log('Corps de la requête reçu:', body); // Debug
    
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
      // Autres champs optionnels
      category,
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

    // Préparer les données pour la mise à jour - TOUS LES CHAMPS SONT OPTIONNELS
    const updateData: any = {};

    // Champs texte (optionnels)
    if (title !== undefined && title !== null) updateData.title = title;
    if (description !== undefined && description !== null) updateData.description = description;
    
    // Gestion sécurisée des images (relation vers ListingImage)
    if (images !== undefined && Array.isArray(images)) {
      if (images.length > 0) {
        // Valider que chaque image est une URL valide
        const validImages = images.filter((url: string) => 
          typeof url === 'string' && url.trim() !== ''
        );
        
        if (validImages.length > 0) {
          updateData.images = {
            deleteMany: {}, // Supprimer toutes les images existantes
            create: validImages.map((imageUrl: string) => ({
              url: imageUrl.trim()
            }))
          };
          console.log("Images mises à jour:", validImages.length, "images valides");
        }
      } else {
        // Si array vide explicitement fourni, supprimer toutes les images
        updateData.images = {
          deleteMany: {}
        };
        console.log("Toutes les images supprimées (array vide fourni)");
      }
    }
    
    // Gestion sécurisée de la location (optionnel)
    if (location !== undefined) {
      updateData.locationValue = location?.value || null;
    }
    
    // Champs numériques avec validation (optionnels)
    if (roomCount !== undefined && roomCount !== null) {
      updateData.roomCount = Math.max(0, parseInt(roomCount) || 0);
    }
    if (bathroomCount !== undefined && bathroomCount !== null) {
      updateData.bathroomCount = Math.max(0, parseInt(bathroomCount) || 0);
    }
    if (toilets !== undefined && toilets !== null) {
      updateData.toilets = Math.max(0, parseInt(toilets) || 0);
    }
    if (guestCount !== undefined && guestCount !== null) {
      updateData.guestCount = Math.max(1, parseInt(guestCount) || 1);
    }
    
    // Prix avec validation (optionnels)
    if (price !== undefined && price !== null) {
      updateData.price = Math.max(0, parseInt(price) || 0);
    }
    if (price_per_month !== undefined && price_per_month !== null) {
      updateData.price_per_month = Math.max(0, parseInt(price_per_month) || 0);
    }
    
    // Champs texte (optionnels)
    if (rental_type !== undefined && rental_type !== null) updateData.rental_type = rental_type;
    if (city !== undefined && city !== null) updateData.city = city;
    if (quater !== undefined && quater !== null) updateData.quater = quater;
    if (category !== undefined && category !== null) updateData.category = category;
    if (listing_type !== undefined && listing_type !== null) updateData.listing_type = listing_type;

    // Amenities (tous optionnels - ne met à jour que si définis explicitement)
    if (has_wifi !== undefined && has_wifi !== null) updateData.has_wifi = Boolean(has_wifi);
    if (has_kitchen !== undefined && has_kitchen !== null) updateData.has_kitchen = Boolean(has_kitchen);
    if (has_parking !== undefined && has_parking !== null) updateData.has_parking = Boolean(has_parking);
    if (has_pool !== undefined && has_pool !== null) updateData.has_pool = Boolean(has_pool);
    if (has_balcony !== undefined && has_balcony !== null) updateData.has_balcony = Boolean(has_balcony);
    if (has_garden !== undefined && has_garden !== null) updateData.has_garden = Boolean(has_garden);
    if (has_terrace !== undefined && has_terrace !== null) updateData.has_terrace = Boolean(has_terrace);
    if (has_living_room !== undefined && has_living_room !== null) updateData.has_living_room = Boolean(has_living_room);
    if (is_furnished !== undefined && is_furnished !== null) updateData.is_furnished = Boolean(is_furnished);
    if (has_tv !== undefined && has_tv !== null) updateData.has_tv = Boolean(has_tv);
    if (has_air_conditioning !== undefined && has_air_conditioning !== null) updateData.has_air_conditioning = Boolean(has_air_conditioning);
    if (has_washing_machin !== undefined && has_washing_machin !== null) updateData.has_washing_machin = Boolean(has_washing_machin);
    if (has_dryer !== undefined && has_dryer !== null) updateData.has_dryer = Boolean(has_dryer);
    if (has_iron !== undefined && has_iron !== null) updateData.has_iron = Boolean(has_iron);
    if (has_hair_dryer !== undefined && has_hair_dryer !== null) updateData.has_hair_dryer = Boolean(has_hair_dryer);
    if (has_fridge !== undefined && has_fridge !== null) updateData.has_fridge = Boolean(has_fridge);
    if (has_dishwasher !== undefined && has_dishwasher !== null) updateData.has_dishwasher = Boolean(has_dishwasher);
    if (has_oven !== undefined && has_oven !== null) updateData.has_oven = Boolean(has_oven);
    if (has_fan !== undefined && has_fan !== null) updateData.has_fan = Boolean(has_fan);
    if (has_elevator !== undefined && has_elevator !== null) updateData.has_elevator = Boolean(has_elevator);
    if (has_camera_surveillance !== undefined && has_camera_surveillance !== null) updateData.has_camera_surveillance = Boolean(has_camera_surveillance);
    if (has_security !== undefined && has_security !== null) updateData.has_security = Boolean(has_security);
    if (has_gym !== undefined && has_gym !== null) updateData.has_gym = Boolean(has_gym);

    // Vérifier qu'au moins un champ est fourni pour la mise à jour
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée fournie pour la mise à jour" },
        { status: 400 }
      );
    }

    console.log('Données à mettre à jour:', updateData); // Debug

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId
      },
      data: updateData
    });

    console.log('Listing mis à jour avec succès:', updatedListing.id); // Debug

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Erreur détaillée lors de la mise à jour du listing:', error);
    
    // Fournir plus de détails sur l'erreur en développement
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          error: "Erreur lors de la mise à jour du listing",
          details: error instanceof Error ? error.message : 'Erreur inconnue',
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
    
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