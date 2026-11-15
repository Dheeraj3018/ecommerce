import type { MetadataRoute } from "next";
import { absoluteUrl,indexingEnabled } from "@/lib/site";
export default function robots():MetadataRoute.Robots {
 return indexingEnabled ? {rules:{userAgent:"*",allow:"/",disallow:["/api/","/auth/"]},sitemap:absoluteUrl("/sitemap.xml")} : {rules:{userAgent:"*",disallow:"/"}};
}
