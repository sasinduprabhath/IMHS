import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/about",
        "/faculty",
        "/dr-isuru-wijesinghe",
        "/courses",
        "/courses/*",
        "/consultation",
        "/gallery",
        "/contact",
        "/privacy-policy",
      ],
      disallow: [
        "/admin",
        "/admin/*",
        "/dashboard",
        "/dashboard/*",
        "/login",
        "/verify-otp",
        "/api/*",
      ],
    },
    sitemap: "https://imhsedu.com/sitemap.xml",
  };
}
