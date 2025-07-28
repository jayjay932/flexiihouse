import { NextResponse } from "next/server";
import prisma from '@/app/libs/prismadb';
import getCurrentUser from "@/app/actions/getCurrentUser";

// GET - Récupérer les listings avec filtres
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Récupérer tous les paramètres de recherche
    const searchQuery = searchParams.get('searchQuery');
    const locationValue = searchParams.get('locationValue');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const guestCount = searchParams.get('guestCount');
    const roomCount = searchParams.get('roomCount');
    const bathroomCount = searchParams.get('bathroomCount');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const rentalType = searchParams.get('rental_type');
    const city = searchParams.get('city');
    const listingTypes = searchParams.get('listing_type');
    const accommodationType = searchParams.get('accommodationType');
    
    // Équipements
    const hasWifi = searchParams.get('has_wifi') === 'true';
    const hasKitchen = searchParams.get('has_kitchen') === 'true';
    const hasParking = searchParams.get('has_parking') === 'true';
    const hasPool = searchParams.get('has_pool') === 'true';
    const hasBalcony = searchParams.get('has_balcony') === 'true';
    const hasGarden = searchParams.get('has_garden') === 'true';
    const hasTerrace = searchParams.get('has_terrace') === 'true';
    const hasLivingRoom = searchParams.get('has_living_room') === 'true';
    const isFurnished = searchParams.get('is_furnished') === 'true';
    const hasTv = searchParams.get('has_tv') === 'true';
    const hasAirConditioning = searchParams.get('has_air_conditioning') === 'true';
    const hasWashingMachine = searchParams.get('has_washing_machin') === 'true';
    const hasDryer = searchParams.get('has_dryer') === 'true';
    const hasIron = searchParams.get('has_iron') === 'true';
    const hasHairDryer = searchParams.get('has_hair_dryer') === 'true';
    const hasFridge = searchParams.get('has_fridge') === 'true';
    const hasDishwasher = searchParams.get('has_dishwasher') === 'true';
    const hasOven = searchParams.get('has_oven') === 'true';
    const hasFan = searchParams.get('has_fan') === 'true';
    const hasElevator = searchParams.get('has_elevator') === 'true';
    const hasCameraSurveillance = searchParams.get('has_camera_surveillance') === 'true';
    const hasSecurity = searchParams.get('has_security') === 'true';
    const hasGym = searchParams.get('has_gym') === 'true';

    // Debug - Log des paramètres reçus
    console.log('🔍 Paramètres de recherche reçus:', {
      searchQuery,
      locationValue,
      minPrice,
      maxPrice,
      guestCount,
      roomCount,
      bathroomCount,
      category,
      rentalType,
      city,
      listingTypes,
      hasWifi,
      hasKitchen,
      hasParking,
    });

    // Construire la clause WHERE pour Prisma
    const whereClause: any = {};

    // Recherche par nom/description
    if (searchQuery?.trim()) {
      whereClause.OR = [
        { title: { contains: searchQuery.trim(), mode: 'insensitive' } },
        { description: { contains: searchQuery.trim(), mode: 'insensitive' } }
      ];
    }

    // Filtre par localisation
    if (locationValue) {
      whereClause.locationValue = locationValue;
    }

    // Filtre par ville
    if (city) {
      whereClause.city = city;
    }

    // Filtre par catégorie
    if (category) {
      whereClause.category = category;
    }

    // Filtre par type de location
    if (rentalType) {
      whereClause.rental_type = rentalType;
    }

    // Filtre par prix
    if (minPrice || maxPrice) {
      // Pour les locations courtes, filtrer sur price
      // Pour les locations mensuelles, filtrer sur price_per_month
      if (rentalType === 'courte') {
        whereClause.price = {};
        if (minPrice) whereClause.price.gte = parseInt(minPrice);
        if (maxPrice) whereClause.price.lte = parseInt(maxPrice);
      } else if (rentalType === 'mensuel') {
        whereClause.price_per_month = {};
        if (minPrice) whereClause.price_per_month.gte = parseInt(minPrice);
        if (maxPrice) whereClause.price_per_month.lte = parseInt(maxPrice);
      } else {
        // Si pas de type spécifié, chercher dans les deux
        whereClause.OR = [
          {
            AND: [
              { rental_type: 'courte' },
              {
                price: {
                  ...(minPrice && { gte: parseInt(minPrice) }),
                  ...(maxPrice && { lte: parseInt(maxPrice) })
                }
              }
            ]
          },
          {
            AND: [
              { rental_type: 'mensuel' },
              {
                price_per_month: {
                  ...(minPrice && { gte: parseInt(minPrice) }),
                  ...(maxPrice && { lte: parseInt(maxPrice) })
                }
              }
            ]
          }
        ];
      }
    }

    // Filtres de capacité
    if (guestCount) {
      whereClause.guestCount = { gte: parseInt(guestCount) };
    }

    if (roomCount) {
      whereClause.roomCount = { gte: parseInt(roomCount) };
    }

    if (bathroomCount) {
      whereClause.bathroomCount = { gte: parseInt(bathroomCount) };
    }

    // Filtres d'équipements
    if (hasWifi) whereClause.has_wifi = true;
    if (hasKitchen) whereClause.has_kitchen = true;
    if (hasParking) whereClause.has_parking = true;
    if (hasPool) whereClause.has_pool = true;
    if (hasBalcony) whereClause.has_balcony = true;
    if (hasGarden) whereClause.has_garden = true;
    if (hasTerrace) whereClause.has_terrace = true;
    if (hasLivingRoom) whereClause.has_living_room = true;
    if (isFurnished) whereClause.is_furnished = true;
    if (hasTv) whereClause.has_tv = true;
    if (hasAirConditioning) whereClause.has_air_conditioning = true;
    if (hasWashingMachine) whereClause.has_washing_machin = true;
    if (hasDryer) whereClause.has_dryer = true;
    if (hasIron) whereClause.has_iron = true;
    if (hasHairDryer) whereClause.has_hair_dryer = true;
    if (hasFridge) whereClause.has_fridge = true;
    if (hasDishwasher) whereClause.has_dishwasher = true;
    if (hasOven) whereClause.has_oven = true;
    if (hasFan) whereClause.has_fan = true;
    if (hasElevator) whereClause.has_elevator = true;
    if (hasCameraSurveillance) whereClause.has_camera_surveillance = true;
    if (hasSecurity) whereClause.has_security = true;
    if (hasGym) whereClause.has_gym = true;

    // Filtre par types de propriété
    if (listingTypes) {
      const types = listingTypes.split(',').filter(type => type.trim());
      if (types.length > 0) {
        whereClause.listing_type = { in: types };
      }
    }

    // Filtre par type d'hébergement
    if (accommodationType && accommodationType !== 'tous') {
      // Vous pouvez adapter cette logique selon votre modèle de données
      // Par exemple, si vous avez un champ accommodation_type
      whereClause.accommodation_type = accommodationType;
    }

    // Filtre par dates (pour éviter les conflits de réservation)
    if (startDate && endDate) {
      // Exclure les listings qui ont des réservations conflictuelles
      whereClause.reservations = {
        none: {
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(startDate) } }
              ]
            },
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } }
              ]
            },
            {
              AND: [
                { startDate: { gte: new Date(startDate) } },
                { endDate: { lte: new Date(endDate) } }
              ]
            }
          ]
        }
      };
    }

    console.log('🔍 Clause WHERE générée:', JSON.stringify(whereClause, null, 2));

    // Exécuter la requête
    const listings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        reservations: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ ${listings.length} listings trouvés`);

    return NextResponse.json(listings);

  } catch (error) {
    console.error("Erreur lors de récupération des listings:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" }, 
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau listing
export async function POST(request: Request) {
  console.log("📥 Nouvelle requête POST reçue");
  
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.log("❌ Utilisateur non authentifié");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ Utilisateur authentifié:", currentUser.id);

    let body;
    try {
      body = await request.json();
      console.log("✅ Body parsé avec succès");
    } catch (parseError) {
      console.error("❌ Erreur de parsing JSON:", parseError);
      return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
    }

    console.log("🔍 Données reçues:", {
      title: body.title,
      description: body.description?.length,
      category: body.category,
      rental_type: body.rental_type,
      location: body.location,
      images: Array.isArray(body.images) ? body.images.length : 'not array',
      city: body.city,
      quater: body.quater,
      listing_type: body.listing_type,
      price: body.price,
      price_per_month: body.price_per_month
    });

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

    // Validation détaillée des champs obligatoires
    const errors: string[] = [];

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      errors.push("Titre requis (minimum 3 caractères)");
    }

    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      errors.push("Description requise (minimum 10 caractères)");
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      errors.push("Au moins une image est requise");
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      errors.push("Catégorie requise");
    }

    if (!location || !location.value || typeof location.value !== 'string') {
      errors.push("Localisation requise");
    }

    if (!rental_type || !['courte', 'mensuel'].includes(rental_type)) {
      errors.push("Type de location requis (courte ou mensuel)");
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      errors.push("Ville requise");
    }

    if (!quater || typeof quater !== 'string' || quater.trim().length === 0) {
      errors.push("Quartier requis");
    }

    if (!listing_type || typeof listing_type !== 'string' || listing_type.trim().length === 0) {
      errors.push("Type de logement requis");
    }

    // Validation des nombres
    const roomCountNum = Number(roomCount);
    if (isNaN(roomCountNum) || roomCountNum < 1) {
      errors.push("Nombre de chambres invalide (minimum 1)");
    }

    const bathroomCountNum = Number(bathroomCount);
    if (isNaN(bathroomCountNum) || bathroomCountNum < 0) {
      errors.push("Nombre de salles de bain invalide");
    }

    const toiletsNum = Number(toilets);
    if (isNaN(toiletsNum) || toiletsNum < 0) {
      errors.push("Nombre de toilettes invalide");
    }

    const guestCountNum = Number(guestCount);
    if (isNaN(guestCountNum) || guestCountNum < 1) {
      errors.push("Nombre d'invités invalide (minimum 1)");
    }

    // Validation des prix selon le type de location
    if (rental_type === "mensuel") {
      const monthlyPrice = Number(price_per_month);
      if (isNaN(monthlyPrice) || monthlyPrice <= 0) {
        errors.push("Prix mensuel requis et doit être supérieur à 0");
      }
    }

    if (rental_type === "courte") {
      const dailyPrice = Number(price);
      if (isNaN(dailyPrice) || dailyPrice <= 0) {
        errors.push("Prix par nuit requis et doit être supérieur à 0");
      }
    }

    // Validation des images
    if (images && Array.isArray(images)) {
      const invalidImages = images.filter(img => !img || typeof img !== 'string' || img.trim().length === 0);
      if (invalidImages.length > 0) {
        errors.push("Certaines images ne sont pas valides");
      }
    }

    if (errors.length > 0) {
      console.log("❌ Erreurs de validation:", errors);
      return NextResponse.json({ 
        error: "Données invalides", 
        details: errors 
      }, { status: 400 });
    }

    console.log("✅ Validation réussie, création du listing...");

    try {
      const listing = await prisma.listing.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          roomCount: roomCountNum,
          bathroomCount: bathroomCountNum,
          toilets: toiletsNum,
          guestCount: guestCountNum,
          locationValue: location.value.trim(),
          price: rental_type === "courte" ? Number(price) : 0,
          price_per_month: rental_type === "mensuel" ? Number(price_per_month) : 0,
          rental_type,
          userId: currentUser.id,
          city: city.trim(),
          quater: quater.trim(),
          listing_type: listing_type.trim(),
          // Équipements avec conversion boolean explicite
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
          images: {
            create: images.map((url: string) => ({ url: url.trim() })),
          },
        },
        include: {
          images: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        }
      });

      console.log("✅ Listing créé avec succès:", listing.id);
      return NextResponse.json(listing, { status: 201 });

    } catch (prismaError: any) {
      console.error("❌ Erreur Prisma lors de la création:", prismaError);
      
      // Gestion des erreurs spécifiques de Prisma
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ 
          error: "Conflit de données - un listing similaire existe déjà" 
        }, { status: 409 });
      }
      
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ 
          error: "Référence invalide - vérifiez les données" 
        }, { status: 400 });
      }

      return NextResponse.json({ 
        error: "Erreur de base de données", 
        details: process.env.NODE_ENV === 'development' ? prismaError.message : undefined
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error("❌ Erreur générale lors de la création du listing:", error);
    return NextResponse.json({ 
      error: "Erreur interne du serveur",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}