import prisma from "@/app/libs/prismadb";
import { Listing } from "@prisma/client";

export interface IListingsParams {
  userId?: string;
  guestCount?: number;
  roomCount?: number;
  bathroomCount?: number;
  toilets?: number;
  startDate?: string;
  endDate?: string;
  locationValue?: string;
  category?: string;
  searchQuery?: string; // 🔍 AJOUTÉ
  // Nouveaux filtres ajoutés
  minPrice?: string;
  maxPrice?: string;
  rental_type?: string;
  city?: string;
  listing_type?: string;
  accommodationType?: string;
  // Équipements - tous en string car ils viennent des URL params
  has_wifi?: string;
  has_kitchen?: string;
  has_parking?: string;
  has_pool?: string;
  has_balcony?: string;
  has_garden?: string;
  has_terrace?: string;
  has_living_room?: string;
  is_furnished?: string;
  has_tv?: string;
  has_air_conditioning?: string;
  has_washing_machin?: string;
  has_dryer?: string;
  has_iron?: string;
  has_hair_dryer?: string;
  has_fridge?: string;
  has_dishwasher?: string;
  has_oven?: string;
  has_fan?: string;
  has_elevator?: string;
  has_camera_surveillance?: string;
  has_security?: string;
  has_gym?: string;
}

export type SafeListing = Omit<Listing, "createdAt"> & {
  createdAt: string;
  images: { id: string; url: string }[];
};

export default async function getListings(
  params: IListingsParams
): Promise<SafeListing[]> {
  try {
    const {
      userId,
      roomCount,
      guestCount,
      bathroomCount,
      toilets,
      locationValue,
      startDate,
      endDate,
      category,
      searchQuery,
      // Nouveaux paramètres
      minPrice,
      maxPrice,
      rental_type,
      city,
      listing_type,
      accommodationType,
      // Équipements
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
    } = params;

    // Debug: Log des paramètres reçus
    console.log('🔍 getListings - Paramètres reçus:', {
      searchQuery,
      locationValue,
      minPrice,
      maxPrice,
      rental_type,
      city,
      listing_type,
      has_wifi,
      has_kitchen,
      has_parking,
    });

    let query: any = {};

    // Filtres existants
    if (userId) query.userId = userId;
    if (category) query.category = category;
    if (roomCount) query.roomCount = { gte: +roomCount };
    if (guestCount) query.guestCount = { gte: +guestCount };
    if (bathroomCount) query.bathroomCount = { gte: +bathroomCount };
    if (toilets) query.toilets = { gte: +toilets };
    if (locationValue) query.locationValue = locationValue;

    // Recherche par nom/description améliorée
    if (searchQuery?.trim()) {
      query.OR = [
        { title: { contains: searchQuery.trim(), mode: "insensitive" } },
        { description: { contains: searchQuery.trim(), mode: "insensitive" } }
      ];
    }

    // Nouveaux filtres ajoutés

    // Filtre par ville
    if (city) {
      query.city = city;
    }

    // Filtre par type de location
    if (rental_type) {
      query.rental_type = rental_type;
    }

    // Filtre par prix
    if (minPrice || maxPrice) {
      const minPriceNum = minPrice ? parseInt(minPrice) : undefined;
      const maxPriceNum = maxPrice ? parseInt(maxPrice) : undefined;

      if (rental_type === 'courte') {
        // Pour les locations courtes, filtrer sur le champ 'price'
        query.price = {};
        if (minPriceNum !== undefined) query.price.gte = minPriceNum;
        if (maxPriceNum !== undefined) query.price.lte = maxPriceNum;
      } else if (rental_type === 'mensuel') {
        // Pour les locations mensuelles, filtrer sur le champ 'price_per_month'
        query.price_per_month = {};
        if (minPriceNum !== undefined) query.price_per_month.gte = minPriceNum;
        if (maxPriceNum !== undefined) query.price_per_month.lte = maxPriceNum;
      } else {
        // Si pas de type spécifié, chercher dans les deux types
        const priceConditions = [];
        
        if (minPriceNum !== undefined || maxPriceNum !== undefined) {
          // Condition pour les locations courtes
          priceConditions.push({
            AND: [
              { rental_type: 'courte' },
              {
                price: {
                  ...(minPriceNum !== undefined && { gte: minPriceNum }),
                  ...(maxPriceNum !== undefined && { lte: maxPriceNum })
                }
              }
            ]
          });

          // Condition pour les locations mensuelles
          priceConditions.push({
            AND: [
              { rental_type: 'mensuel' },
              {
                price_per_month: {
                  ...(minPriceNum !== undefined && { gte: minPriceNum }),
                  ...(maxPriceNum !== undefined && { lte: maxPriceNum })
                }
              }
            ]
          });
        }

        if (priceConditions.length > 0) {
          // Si on avait déjà une condition OR pour la recherche, on doit restructurer
          if (query.OR) {
            query.AND = [
              { OR: query.OR }, // Condition de recherche existante
              { OR: priceConditions } // Conditions de prix
            ];
            delete query.OR;
          } else {
            query.OR = priceConditions;
          }
        }
      }
    }

    // Filtres d'équipements (convertir string 'true' en boolean)
    if (has_wifi === 'true') query.has_wifi = true;
    if (has_kitchen === 'true') query.has_kitchen = true;
    if (has_parking === 'true') query.has_parking = true;
    if (has_pool === 'true') query.has_pool = true;
    if (has_balcony === 'true') query.has_balcony = true;
    if (has_garden === 'true') query.has_garden = true;
    if (has_terrace === 'true') query.has_terrace = true;
    if (has_living_room === 'true') query.has_living_room = true;
    if (is_furnished === 'true') query.is_furnished = true;
    if (has_tv === 'true') query.has_tv = true;
    if (has_air_conditioning === 'true') query.has_air_conditioning = true;
    if (has_washing_machin === 'true') query.has_washing_machin = true;
    if (has_dryer === 'true') query.has_dryer = true;
    if (has_iron === 'true') query.has_iron = true;
    if (has_hair_dryer === 'true') query.has_hair_dryer = true;
    if (has_fridge === 'true') query.has_fridge = true;
    if (has_dishwasher === 'true') query.has_dishwasher = true;
    if (has_oven === 'true') query.has_oven = true;
    if (has_fan === 'true') query.has_fan = true;
    if (has_elevator === 'true') query.has_elevator = true;
    if (has_camera_surveillance === 'true') query.has_camera_surveillance = true;
    if (has_security === 'true') query.has_security = true;
    if (has_gym === 'true') query.has_gym = true;

    // Filtre par types de propriété
    if (listing_type) {
      const types = listing_type.split(',').map(t => t.trim()).filter(t => t);
      if (types.length > 0) {
        query.listing_type = { in: types };
      }
    }

    // Filtre par type d'hébergement
    if (accommodationType && accommodationType !== 'tous') {
      // Si vous avez un champ accommodation_type dans votre base de données
      // query.accommodation_type = accommodationType;
      
      // Sinon, vous pouvez adapter selon votre logique métier
      // Par exemple, filtrer par des caractéristiques spécifiques
      switch (accommodationType) {
        case 'chambre':
          // Logique pour chambre privée
          break;
        case 'entier':
          // Logique pour logement entier
          break;
      }
    }

    // Filtre par dates (éviter les conflits de réservation) - existant
    if (startDate && endDate) {
      query.NOT = {
        reservations: {
          some: {
            OR: [
              {
                endDate: { gte: startDate },
                startDate: { lte: startDate },
              },
              {
                startDate: { lte: endDate },
                endDate: { gte: endDate },
              },
            ],
          },
        },
      };
    }

    // Debug: Log de la requête finale
    console.log('🔍 getListings - Requête Prisma:', JSON.stringify(query, null, 2));

    const listings = await prisma.listing.findMany({
      where: query,
      include: {
        images: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`✅ getListings - ${listings.length} listings trouvés`);

    const safeListings: SafeListing[] = listings.map((listing) => ({
      ...listing,
      createdAt: listing.createdAt.toISOString(),
      images: listing.images.map((img) => ({
        id: img.id,
        url: img.url,
      })),
    }));

    return safeListings;
  } catch (error: any) {
    console.error("❌ getListings - Erreur:", error);
    throw new Error(error);
  }
}