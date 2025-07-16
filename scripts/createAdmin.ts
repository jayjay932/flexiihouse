import prisma from "../app/libs/prismadb";
import bcrypt from "bcrypt";

async function main() {
  const email = "jasonmampouya.pro@gmail.com";
  const password = "admin123"; // choisis un mot de passe fort en prod

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Principal",
      email: email,
      hashedPassword: hashedPassword,
      role: "admin", // ✅ rôle explicitement défini
    },
  });

  console.log("Admin created:", admin);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
