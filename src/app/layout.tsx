import type { Metadata, ResolvingMetadata } from "next";
import "./globals.css";
import { fonts } from "@/lib/fonts";
import { ChakraProvider } from "@/providers/chakra";
import ReactQueryClient from "@/providers/react-query";
import AuthProvider from "@/providers/auth";
import { getSession } from "@/lib/auth/next-auth";
import { SiteConfigProvider } from "@/context/SiteConfig";
import { getSettings } from "@/lib/queries/settings";
import { NuqsProvider } from "@/providers/nuqs";
import { getSiteUrl } from "@/utils/url";
import { objectToQueryParams } from "@/utils";
import { groupSettingsByFolder } from "@/components/pages/Dashboard/Settings/utils";
import { TelegramFab } from "@/components/Telegram/Fab";
import isEmpty from "just-is-empty";
import {
  CanRender,
  ConditionalScriptRenderer,
} from "@/components/ScriptsManager";
import { getThirdPartyScripts } from "@/lib/third-party-scripts";
import { SCRIPT_POSITIONS } from "@/lib/third-party-scripts/types";
import dynamic from "next/dynamic";

type Props = {
  params: { slug?: string } & Record<string, string | string[] | undefined>;
  searchParams: { [key: string]: string | string[] | undefined };
};
const MixPanelAnalytics = dynamic(
  () => import("@/components/Analytics/MixpanelAnalytics")
);
const GoogleTagManagerNoscript = dynamic(
  () => import("@/components/Analytics/GoogleTagManager/Noscript")
);

export async function generateMetadata(
  _: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const siteSettings = await getSettings();

  return {
    metadataBase: new URL(getSiteUrl()),
    title: siteSettings?.siteTitle?.value,
    description: siteSettings?.siteDescription?.value,
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
      noimageindex: false,
      nositelinkssearchbox: false,
    },
    icons: {
      icon: siteSettings?.siteFavicon?.value || "/favicon.ico",
      shortcut: siteSettings?.siteFavicon?.value || "/favicon.ico",
      apple: siteSettings?.siteFavicon?.value || "/favicon.ico",
    },
    openGraph: {
      title: siteSettings?.siteName?.value,
      description: siteSettings?.siteDescription?.value,

      siteName: siteSettings?.siteName?.value,
      images: [
        {
          url:
            siteSettings.siteOpengraph?.value ||
            `/api/og?${objectToQueryParams({ title: siteSettings.siteTitle?.value, description: siteSettings.siteDescription?.value })}`,
          width: 1200,
          height: 630,
        },
      ],

      locale: "en-US",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const siteSettings = await getSettings();
  const groupedSettings = groupSettingsByFolder(siteSettings);
  const socialSettings = groupedSettings["social"] || [];
  const scripts = getThirdPartyScripts(siteSettings);
  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: getSiteUrl(),
    name: siteSettings.siteName.value,
    description: siteSettings.siteDescription.value,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: siteSettings.siteName.value,
      logo: {
        "@type": "ImageObject",
        url: siteSettings.siteLogo.value,
      },
    },
    inLanguage: "en-US",
    copyrightYear: new Date().getFullYear().toString(),

    copyrightHolder: {
      "@type": "Organization",
      name: siteSettings.siteName.value,
    },
  };

  const organizationName = siteSettings.organizationName?.value || siteSettings.siteName.value;
  const organizationUrl = siteSettings.organizationUrl?.value || getSiteUrl();
  const organizationEmail = siteSettings.organizationEmail?.value || siteSettings.siteEmail?.value;
  const organizationPhone = siteSettings.organizationPhone?.value;
  const organizationAddress = siteSettings.organizationAddress?.value;

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationUrl,
    name: organizationName,
    url: organizationUrl,
    logo: {
      "@type": "ImageObject",
      url: siteSettings.siteLogo.value,
      width: "300",
      height: "300",
    },
    description: siteSettings.siteDescription.value,
    ...(siteSettings.organizationFoundingDate?.value && {
      foundingDate: siteSettings.organizationFoundingDate.value,
    }),
    ...(siteSettings.organizationFounder?.value && {
      founder: {
        "@type": "Person",
        name: siteSettings.organizationFounder.value,
      },
    }),
    ...(organizationAddress && {
      address: {
        "@type": "PostalAddress",
        ...JSON.parse(organizationAddress),
      },
    }),
    ...(organizationEmail && { email: organizationEmail }),
    ...(organizationPhone && {
      contactPoint: {
        "@type": "ContactPoint",
        telephone: organizationPhone,
        contactType: "customer service",
        ...(organizationEmail && { email: organizationEmail }),
        availableLanguage: "English",
      },
    }),
    sameAs: socialSettings
      .filter((setting) => !isEmpty(setting.value))
      .map((setting) => setting.value),
  };
  return (
    <html
      lang="en"
      className={`${fonts.body.variable} ${fonts.heading.variable}`}
    >
      <head>
        <ConditionalScriptRenderer
          scripts={scripts}
          position={SCRIPT_POSITIONS.HEAD_START}
          globalEnabled={true}
        />

        <ConditionalScriptRenderer
          scripts={scripts}
          position={SCRIPT_POSITIONS.HEAD_END}
          globalEnabled={true}
        />
      </head>
      <body>
        <>
          <ConditionalScriptRenderer
            scripts={scripts}
            position={SCRIPT_POSITIONS.BODY_START}
            globalEnabled={true}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
          />

          <SiteConfigProvider initialConfig={siteSettings}>
            <ReactQueryClient>
              <AuthProvider session={session}>
                <NuqsProvider>
                  <ChakraProvider>{children}</ChakraProvider>
                </NuqsProvider>
              </AuthProvider>
            </ReactQueryClient>
          </SiteConfigProvider>
          <ConditionalScriptRenderer
            scripts={scripts}
            position={SCRIPT_POSITIONS.BODY_END}
            globalEnabled={true}
          />
          <CanRender
            enabled={
              !isEmpty(siteSettings.gtmId.value) && siteSettings.gtmId.enabled
            }
            fallback={null}
          >
            <GoogleTagManagerNoscript gtmId={siteSettings.gtmId.value} />
          </CanRender>
          <CanRender
            enabled={
              !isEmpty(siteSettings.mixpanelToken.value) &&
              siteSettings.mixpanelToken.enabled
            }
            fallback={null}
          >
            <MixPanelAnalytics token={siteSettings.mixpanelToken.value} />
          </CanRender>
        </>
      </body>
    </html>
  );
}
