"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Modal from "./Modal"; // ton composant Modal existant (sans prop body)
import { SafeUser } from "@/app/types";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface TermsModalProps {
  currentUser?: SafeUser | null;
}

/**
 * TermsModal (version children)
 * - S’ouvre si l’utilisateur connecté n’a pas accepté les CGU
 * - Contenu scrollable avec padding-bottom
 * - Footer sticky (boutons toujours visibles, au-dessus de la BottomNav)
 */
const TermsModal: React.FC<TermsModalProps> = ({ currentUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUser && currentUser.termsAcceptance?.accepted !== true) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [currentUser]);

  const handleAccept = async () => {
    try {
      await axios.post("/api/terms", { accepted: true });
      toast.success("Merci d’avoir accepté les conditions.");
      setIsOpen(false);
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleRefuse = async () => {
    try {
      await axios.post("/api/terms", { accepted: false });
      toast.error("Connexion refusée.");
      setIsOpen(false);
      await signOut({ callbackUrl: "/" });
    } catch {
      toast.error("Erreur lors du refus.");
    }
  };

  const content = useMemo(
    () => (
      <div className="relative">
        {/* Zone scrollable avec réserve bas pour le footer */}
        <div className="max-h-[70vh] overflow-y-auto text-sm text-gray-700 px-1 space-y-4 pb-[calc(96px+env(safe-area-inset-bottom))]">
          <p className="mb-2 font-semibold text-gray-900 text-base">
            Conditions Générales d’Utilisation
          </p>

          <div>
            <p><strong>1. Frais de service</strong></p>
            <ul className="list-disc pl-5">
              <li>Une commission fixe de <strong>1000 FCFA</strong> est automatiquement ajoutée au prix défini par l’hôte.</li>
              <li>Cette commission couvre les frais de fonctionnement, de promotion et de traitement par la plateforme.</li>
              <li><strong>Seuls les frais d’envoi Mobile Money</strong> sont pris en charge par Flexii. Les <strong>frais de retrait</strong> restent à la charge du bénéficiaire.</li>
            </ul>
          </div>

          <div>
            <p><strong>2. Délai d’annulation</strong></p>
            <ul className="list-disc pl-5">
              <li>Annulation gratuite pendant 1 heure après réservation.</li>
              <li>Passé ce délai :
                <ul className="list-disc pl-5">
                  <li>Client : Retenue de 1 000 FCFA</li>
                  <li>Hôte : Remboursement complet + 1 000 FCFA de pénalité</li>
                </ul>
              </li>
            </ul>
          </div>

          <div>
            <p><strong>3. Validation à l’arrivée</strong></p>
            <ul className="list-disc pl-5">
              <li>Le client valide son arrivée via la plateforme pour déclencher le paiement.</li>
              <li>Sans validation, aucun paiement n’est effectué à l’hôte.</li>
            </ul>
          </div>

          <div>
            <p><strong>4. Utilisation des contenus</strong></p>
            <ul className="list-disc pl-5">
              <li>Flexii peut utiliser vos contenus (photos, descriptions) à des fins promotionnelles.</li>
            </ul>
          </div>

          <div>
            <p><strong>5. Obligations de l’hôte</strong></p>
            <ul className="list-disc pl-5">
              <li>Fournir des informations exactes</li>
              <li>Honorer toutes les réservations confirmées</li>
              <li>Collaborer en cas de litige</li>
            </ul>
          </div>

          <div>
            <p><strong>6. Obligations du client</strong></p>
            <ul className="list-disc pl-5">
              <li>Respect des lieux et des horaires</li>
              <li>Contacter Flexii en cas de problème dans les 24h</li>
            </ul>
          </div>

          <div>
            <p><strong>7. Paiement des hôtes</strong></p>
            <ul className="list-disc pl-5">
              <li>Après validation du client</li>
              <li>Versement dans un délai de 48h via Mobile Money</li>
            </ul>
          </div>

          <div>
            <p><strong>8. Responsabilité de Flexii</strong></p>
            <ul className="list-disc pl-5">
              <li>Flexii n’est pas responsable des dommages ou litiges.</li>
              <li>Flexii agit uniquement comme intermédiaire.</li>
            </ul>
          </div>

          <div>
            <p><strong>9. Modification des CGU</strong></p>
            <ul className="list-disc pl-5">
              <li>Les CGU peuvent être modifiées à tout moment avec préavis.</li>
            </ul>
          </div>

          <div>
            <p><strong>10. Contact</strong></p>
            <p>
              Email : <em>support@flexii.com</em><br />
              WhatsApp : <em>+225 XXXXXXXX</em>
            </p>
          </div>
        </div>

        {/* Footer sticky (toujours visible) */}
        <div className="sticky bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t pt-3 pb-[max(12px,env(safe-area-inset-bottom))] z-[1]">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleRefuse}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    ),
    [] // contenu statique
  );

  // IMPORTANT : on passe le contenu en children, pas via body
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}          // on force un choix, donc pas de close libre
      title="Conditions d'utilisation"
    >
      {content}
    </Modal>
  );
};

export default TermsModal;
