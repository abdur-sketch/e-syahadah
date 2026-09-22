import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "E-Syahadah Pesantren Digital",
    short_name: "E-Syahadah",
    description: "Pengelolaan E-Raport dan ijazah digital pesantren.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#6652c8",
    orientation: "portrait-primary",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
