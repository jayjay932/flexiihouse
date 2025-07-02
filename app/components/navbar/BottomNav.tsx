"use client";

import { usePathname, useRouter } from "next/navigation";
import { FC, useState, useCallback } from "react";
import { SafeUser } from "@/app/types";

// Icônes
import { FiSearch, FiUser, FiMessageSquare } from "react-icons/fi";
import { AiOutlineHeart } from "react-icons/ai";
import { FaSuitcase } from "react-icons/fa";

// Hooks
import useLoginModal from "@/app/hooks/useLoginModal";
import useRegisterModal from "@/app/hooks/useRegisterModal";
import useRentModal from "@/app/hooks/useRentModal";

// Auth
import { signOut } from "next-auth/react";

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
  const iconClass = (active: boolean) =>
    active ? "text-rose-500" : "text-gray-500";

  const toggleProfileMenu = useCallback(() => {
    setProfileMenuOpen((prev) => !prev);
  }, []);

  const onRent = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
    rentModal.onOpen();
  }, [currentUser, loginModal, rentModal]);

  return (
    <>
      <nav className="fixed bottom-0 w-full bg-white border-t z-50 md:hidden flex justify-around items-center h-16">
        {/* Explorer */}
        <button
          onClick={() => router.push("/")}
          className="flex flex-col items-center text-xs"
        >
          <FiSearch className={`w-6 h-6 ${iconClass(isActive("/"))}`} />
          <span className={iconClass(isActive("/"))}>Explorer</span>
        </button>

        {/* Favoris */}
        <button
          onClick={() => router.push("/favorites")}
          className="flex flex-col items-center text-xs"
        >
          <AiOutlineHeart
            className={`w-6 h-6 ${iconClass(isActive("/favorites"))}`}
          />
          <span className={iconClass(isActive("/favorites"))}>Favoris</span>
        </button>

        {currentUser ? (
          <>
            {/* Voyages */}
            <button
              onClick={() => router.push("/trips")}
              className="flex flex-col items-center text-xs"
            >
              <FaSuitcase
                className={`w-6 h-6 ${iconClass(isActive("/trips"))}`}
              />
              <span className={iconClass(isActive("/trips"))}>Voyages</span>
            </button>

            {/* Messages */}
            <button
              onClick={() => router.push("/messages")}
              className="flex flex-col items-center text-xs"
            >
              <FiMessageSquare
                className={`w-6 h-6 ${iconClass(isActive("/messages"))}`}
              />
              <span className={iconClass(isActive("/messages"))}>Messages</span>
            </button>

            {/* Profil */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex flex-col items-center text-xs"
              >
                <FiUser
                  className={`w-6 h-6 ${iconClass(isActive("/profile"))}`}
                />
                <span className={iconClass(isActive("/profile"))}>Profil</span>
              </button>

              {profileMenuOpen && (
                <div className="absolute bottom-16 right-0 bg-white shadow-md rounded-lg w-48 p-2 text-sm z-50">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/trips");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My trips
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/favorites");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My favorites
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/reservations");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My reservations
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      router.push("/properties");
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My properties
                  </button>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      onRent();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Airbnb my home
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      signOut();
                    }}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Connexion */}
            <button
              onClick={loginModal.onOpen}
              className="flex flex-col items-center text-xs"
            >
              <FiUser className={`w-6 h-6 ${iconClass(false)}`} />
              <span className="text-gray-500">Connexion</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
};

export default BottomNav;
