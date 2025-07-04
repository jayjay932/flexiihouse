"use client"

import { FC } from "react"
import { SafeUser } from "../types";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import useFavorite from "../hooks/useFavorite";
const OutlineHeartIcon = AiOutlineHeart as unknown as React.FC<{ size?: number; className?: string }>;
const FillHeartIcon = AiFillHeart as unknown as React.FC<{ size?: number; className?: string }>;

interface HeartButtonProps {
    listingId: string;
    currentUser?: SafeUser | null
}

const HeartButton: FC<HeartButtonProps> = ({ listingId, currentUser }) => {

    const { hasFavorited, toggleFavorite } = useFavorite({
        listingId,
        currentUser
    });


    return (
        <div
            onClick={toggleFavorite}
            className="relative hover:opacity-80 transition cursor-pointer"
        >
            <OutlineHeartIcon 
                size={28}
                className="fill-white absolute -top-[2px] -right-[2px]"
            />
            < FillHeartIcon
                size={24}
                className={
                    hasFavorited ? 'fill-rose-500' : "fill-neutral-500/70"
                }
            />
        </div>
    )
}

export default HeartButton