"use client";

import { usePathname, useRouter } from "next/navigation";
import { FC, useState, useCallback } from "react";
import { SafeUser } from "@/app/types";

import { FiSearch, FiUser, FiMessageSquare } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { FaSuitcase } from "react-icons/fa";

import useLoginModal from "@/app/hooks/useLoginModal";
import useRentModal from "@/app/hooks/useRentModal";
import { signOut } from "next-auth/react";
import { IoChatbubblesOutline } from "react-icons/io5";

const IconFiSearch = FiSearch as unknown as React.FC<{ className?: string }>;
const IconAiOutlineHeart = AiOutlineHeart as unknown as React.FC<{ className?: string }>;
const IconFiUser = FiUser as unknown as React.FC<{ className?: string }>;
const IconFiMessageSquare = FiMessageSquare as unknown as React.FC<{ className?: string }>;
const IconFaSuitcase = FaSuitcase as unknown as React.FC<{ className?: string }>;
const IconIoChatbubblesOutline = IoChatbubblesOutline as unknown as React.FC<{ className?: string }>;
interface BottomNavProps {
  currentUser?: SafeUser | null;
}

const BottomNav: FC<BottomNavProps> = ({ currentUser }) => {
  const pathname = usePathname();
  const router = useRouter();

  const loginModal = useLoginModal();
  const rentModal = useRentModal();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const iconClass = (active: boolean) => active ? "text-rose-500" : "text-gray-500";

  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen((prev) => !prev);
  }, []);

  const onRent = useCallback(() => {
    if (!currentUser) return loginModal.onOpen();
    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal]);

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t z-50 md:hidden flex justify-around items-center h-16">
      <button onClick={() => router.push("/")} className="flex flex-col items-center text-xs">
        <IconFiSearch className={`w-6 h-6 ${iconClass(isActive("/"))}`} />
        <span className={iconClass(isActive("/"))}>Explorer</span>
      </button>

      <button onClick={() => router.push("/favorites")} className="flex flex-col items-center text-xs">
        <IconAiOutlineHeart className={`w-6 h-6 ${iconClass(isActive("/favorites"))}`} />
        <span className={iconClass(isActive("/favorites"))}>Favoris</span>
      </button>

      {currentUser ? (
        <>
          <button onClick={() => router.push("/trips")} className="flex flex-col items-center text-xs">
            <IconFaSuitcase className={`w-6 h-6 ${iconClass(isActive("/trips"))}`} />
            <span className={iconClass(isActive("/trips"))}>Voyages</span>
          </button>

          <button onClick={() => router.push("/messages")} className="flex flex-col items-center text-xs">
            <IconFiMessageSquare className={`w-6 h-6 ${iconClass(isActive("/messages"))}`} />
            <span className={iconClass(isActive("/messages"))}>Messages</span>
          </button>

          <div className="relative">
            <button onClick={toggleProfileMenu} className="flex flex-col items-center text-xs">
              <IconFiUser className={`w-6 h-6 ${iconClass(isActive("/profile"))}`} />
              <span className={iconClass(isActive("/profile"))}>Profil</span>
            </button>

            {profileMenuOpen && (
              <div className="absolute bottom-16 right-0 bg-white shadow-md rounded-lg w-52 p-2 text-sm z-50">
                <button onClick={() => { setProfileMenuOpen(false); router.push("/trips"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Mes voyages
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push("/favorites"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Mes favoris
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push("/reservations"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Mes réservations
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push("/properties"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Mes logements
                </button>
                <button onClick={() => { setProfileMenuOpen(false); onRent(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Mettre mon logement en ligne
                </button>

                {/* Tous les utilisateurs ont accès aux fonctionnalités hôte */}
                <hr className="my-1" />
                <button onClick={() => { setProfileMenuOpen(false); router.push("/host-dashboard"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Dashboard hôte
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push("/host-reservations"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Réservations reçues
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push("/host-availability"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Disponibilité
                </button>
                <button onClick={() => { setProfileMenuOpen(false); router.push("/host-earnings"); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                  Revenus
                </button>

                <hr className="my-1" />
                <button onClick={() => { setProfileMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100">
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <button onClick={loginModal.onOpen} className="flex flex-col items-center text-xs">
          <IconFiUser className="w-6 h-6 text-gray-500" />
          <span className="text-gray-500">Connexion</span>
        </button>
      )}
    </nav>
  );
};

export default BottomNav;
