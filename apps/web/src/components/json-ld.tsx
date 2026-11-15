import { jsonLd } from "@/lib/seo";

export function JsonLd({ value }: { value: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(value)}}/>;
}
