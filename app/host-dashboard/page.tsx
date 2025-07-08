// app/host-dashboard/page.tsx
import Link from "next/link";
import Container from "@/app/components/Container";

const HostDashboardPage = () => {
  return (
    <Container>
      <h1 className="text-xl font-semibold mb-4">Dashboard Hôte</h1>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/host-earnings" className="p-4 bg-white rounded-xl shadow hover:bg-gray-50">
          Voir mes revenus
        </Link>
        <Link href="/host-reservations" className="p-4 bg-white rounded-xl shadow hover:bg-gray-50">
          Réservations reçues
        </Link>
        <Link href="/host-availability" className="p-4 bg-white rounded-xl shadow hover:bg-gray-50">
          Gérer mes disponibilités
        </Link>
      </div>
    </Container>
  );
};

export default HostDashboardPage;
