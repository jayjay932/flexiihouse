export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        "/trips",
        "/reservations",
        "/properties",
        "/favorites",
        "/host-reservations",
          "/host-messages",
        "/host-dashboard",
"/host-earnings",
"/host-listings",
"/host-availability"

    ]
};