const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.listing.updateMany({
    data: {
      city: "Non spécifiée",
      country: "Non spécifié",
      statut: "EN_ATTENTE",
      postedStatut: "ACTIF",
      hasLivingRoom: false,
      isFurnished: false,
      hasGarden: false,
      hasBalcony: false,
      hasTerrace: false,
      hasPool: false,
      hasWifi: false,
      hasParking: false,
      hasKitchen: false,
      rentalType: "MENSUEL",
      pricePerNight: 0,
      pricePerMonth: 0,
      priceForSale: 0,
      motif: "",
      listingType: null,
      occupationType: null,
      photo: null,
    }
  })

  console.log(`✅ ${updated.count} listings mis à jour avec les nouveaux champs.`)
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e)
  })
  .finally(() => {
    prisma.$disconnect()
  })
