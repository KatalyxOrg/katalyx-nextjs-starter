import { JsonLd } from "@/components/seo/json-ld";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { createSiteGraphJsonLd } from "@/lib/seo/structured-data";
import { t } from "@/lib/strings";
import { env } from "@/server/env";

export default function HomePage() {
  const siteGraph = createSiteGraphJsonLd({
    name: APP_NAME,
    url: new URL(env.NEXT_PUBLIC_APP_URL),
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16 animate-fade-in">
      <JsonLd data={siteGraph} />
      <Card>
        <CardHeader>
          <CardTitle>{APP_NAME}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("Modèle Next.js pour les applications Katalyx — démarrez ici et ajoutez votre domaine.")}
          </p>
          <p className="text-sm">
            <a
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("Documentation Next.js")}
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
