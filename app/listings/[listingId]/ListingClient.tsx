'use client';

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from 'date-fns';
import { MapPin, Share, Heart, Star, Award } from 'lucide-react';

import useLoginModal from "@/app/hooks/useLoginModal";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import ListingGallery from "@/app/components/listings/ListingGallery";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: 'selection'
};

interface ListingClientProps {
  reservations?: SafeReservation[];
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  reservations = [],
  currentUser
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  // 🔁 Fetch des dates avec isAvailable: false
  useEffect(() => {
    const fetchUnavailableDates = async () => {
      try {
        const res = await fetch(`/api/availability/${listing.id}`);
        const data = await res.json();
        const parsedDates = data.map((item: any) => new Date(item.date));
        setUnavailableDates(parsedDates);
      } catch (err) {
        console.error("Erreur fetch unavailable dates:", err);
      }
    };

    fetchUnavailableDates();
  }, [listing.id]);

  // 🧠 Combine réservations et indisponibilités
  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation: any) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate)
      });
      dates = [...dates, ...range];
    });

    return [...dates, ...unavailableDates];
  }, [reservations, unavailableDates]);

  const category = useMemo(() => {
    return categories.find((items) =>
      items.label === listing.category);
  }, [listing.category]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
    setIsLoading(true);

    axios.post('/api/reservations', {
      totalPrice,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      listingId: listing?.id
    })
      .then(() => {
        toast.success('Listing reserved!');
        setDateRange(initialDateRange);
        router.push("/trips");
      })
      .catch(() => {
        toast.error('Something went wrong.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    totalPrice,
    dateRange,
    listing?.id,
    router,
    currentUser,
    loginModal
  ]);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInDays(
        dateRange.endDate,
        dateRange.startDate
      );

      if (dayCount && listing.price) {
        setTotalPrice(dayCount * listing.price);
      } else {
        setTotalPrice(listing.price);
      }
    }
  }, [dateRange, listing.price]);

  // Fonction pour générer une note simulée
  const getRating = () => {
    return (4.2 + Math.random() * 0.8).toFixed(1);
  };

  return (
    <Container>
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header section amélioré - Style Airbnb professionnel */}
          <div className="flex flex-col gap-4">
            {/* Titre principal */}
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
                {listing.title}
              </h1>
              
              {/* Localisation avec icône */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <p className="text-gray-600 text-sm font-medium underline cursor-pointer hover:text-gray-900 transition-colors">
                  {listing.city}
                </p>
              </div>
            </div>

    
          </div>

          {/* Galerie d'images */}
          <div className="w-full">
            <ListingGallery images={listing.images} />
          </div>

          

          {/* Contenu principal */}
          <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
            <ListingInfo
              user={listing.user}
              description={listing.description}
              guestCount={listing.guestCount}
              roomCount={listing.roomCount}
              bathroomCount={listing.bathroomCount}
              toilets={listing.toilets}
              category={category}
              rental_type={listing.rental_type}
              price_per_month={listing.price_per_month}
              price={listing.price}
              city={listing.city ?? undefined}
              quater={listing.quater ?? ''}
              locationValue={listing.locationValue}
              has_wifi={listing.has_wifi}
              has_kitchen={listing.has_kitchen}
              has_parking={listing.has_parking}
              has_pool={listing.has_pool}
              has_balcony={listing.has_balcony}
              has_garden={listing.has_garden}
              has_terrace={listing.has_terrace}
              has_living_room={listing.has_living_room}
              is_furnished={listing.is_furnished}
              has_tv={listing.has_tv}
              has_air_conditioning={listing.has_air_conditioning}
              has_washing_machin={listing.has_washing_machin}
              has_dryer={listing.has_dryer}
              has_iron={listing.has_iron}
              has_hair_dryer={listing.has_hair_dryer}
              has_fridge={listing.has_fridge}
              has_dishwasher={listing.has_dishwasher}
              has_oven={listing.has_oven}
              has_fan={listing.has_fan}
              has_elevator={listing.has_elevator}
              has_camera_surveillance={listing.has_camera_surveillance}
              has_security={listing.has_security}
              has_gym={listing.has_gym}
            />

            <div className="order-first mb-10 md:order-last md:col-span-3">
              <ListingReservation
                price={listing.rental_type === 'mensuel' ? listing.price_per_month : listing.price}
                rental_type={listing.rental_type}
                totalPrice={totalPrice}
                onChangeDate={(value) => setDateRange(value)}
                dateRange={dateRange}
                onSubmit={onCreateReservation}
                disabled={isLoading}
                disabledDates={disabledDates}
                listingId={listing.id}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ListingClient;