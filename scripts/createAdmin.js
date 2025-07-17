const prisma = require("../app/libs/prismadb").default;
const bcrypt = require("bcryptjs");

async function main() {
  const email = "admin@gmail.com";
  const numberPhone = "0100000000"; // ← change si déjà utilisé
  const password = "123";

  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { numberPhone },
      ],
    },
  });

  if (existingAdmin) {
    console.log("❌ Admin déjà existant:", existingAdmin.email || existingAdmin.numberPhone);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email,
      numberPhone,
      hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Admin créé :", admin);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur :", error);
    process.exit(1);
  });
