import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/about", "/faculty", "/courses", "/contact"],
      disallow: ["/admin/", "/dashboard/", "/login", "/api/"],
    },
    sitemap: "https://imhs.edu.lk/sitemap.xml",
  };
}
