import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://imhs.edu.lk";

  let courses: any[] = [];
  try {
    courses = await prisma.course.findMany({
      where: { published: true },
      select: { slug: true, createdAt: true },
    });
  } catch (error) {
    console.error("Sitemap DB connection error (MySQL):", error);
  }

  const courseUrls = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: course.createdAt,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/faculty`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    ...courseUrls,
  ];
}
