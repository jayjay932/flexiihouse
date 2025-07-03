'use client';

import Image from "next/image";
import { useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

interface ListingGalleryProps {
  images: { url: string; id: string }[];
}

const ListingGallery: React.FC<ListingGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const next = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };
  const ArrowBackIcon = IoIosArrowBack as unknown as React.FC<{ size?: number; className?: string }>
const ArrowForwardIcon = IoIosArrowForward as unknown as React.FC<{ size?: number; className?: string }>


  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden">
      {images.length > 0 ? (
        <Image
          src={images[currentIndex].url}
          alt={`image-${currentIndex}`}
          fill
          className="object-cover w-full h-full"
       
        />
      ) : (
        <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
          <p className="text-neutral-500">Aucune image</p>
        </div>
      )}

      {/* Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white transition"
          >
            <ArrowBackIcon  size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow hover:bg-white transition"
          >
            < ArrowForwardIcon size={24} />
          </button>
        </>
      )}
    </div>
  );
};

export default ListingGallery;
