import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  title: "Delivery Express - Sua Loja Online",
  description:
    "Delivery Express - Entrega rápida e segura na sua casa. Encontre os melhores produtos com preços especiais e receba no conforto do seu lar.",
  keywords: "delivery, ecommerce, entrega rápida, loja online, produtos, compras online",
  authors: [{ name: "VisionX", url: "https://visionxma.com" }],
  creator: "VisionX",
  publisher: "VisionX",
  robots: "index, follow",

  // Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://seudominio.com",
    siteName: "Delivery Express",
    title: "Delivery Express - Sua Loja Online",
    description: "Entrega rápida e segura na sua casa. Encontre os melhores produtos com preços especiais.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Delivery Express - Sua Loja Online",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@deliveryexpress",
    creator: "@visionxma",
    title: "Delivery Express - Sua Loja Online",
    description: "Entrega rápida e segura na sua casa. Encontre os melhores produtos com preços especiais.",
    images: ["/og-image.jpg"],
  },

  // Verificação e configurações do site
  verification: {
    google: "google-site-verification-code-aqui",
    // yandex: 'yandex-verification-code-aqui',
    // bing: 'bing-verification-code-aqui',
  },

  // Configurações de aplicativo
  applicationName: "Delivery Express",
  generator: "Next.js 14",
  referrer: "origin-when-cross-origin",

  // Configurações para PWA
  manifest: "/manifest.json",

  // Configurações de formato
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Configurações de categorização
  category: "ecommerce",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Configurações de viewport otimizadas */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />

        {/* Configurações de tema */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light dark" />

        {/* Configurações de aplicativo móvel */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Delivery Express" />

        {/* Ícones */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* Preload de recursos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//firebase.googleapis.com" />
        <link rel="dns-prefetch" href="//firestore.googleapis.com" />

        {/* Configurações de cache */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />

        {/* Estilos críticos inline */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            html {
              font-family: ${GeistSans.style.fontFamily}, system-ui, -apple-system, sans-serif;
              --font-sans: ${GeistSans.variable};
              --font-mono: ${GeistMono.variable};
              scroll-behavior: smooth;
            }
            
            /* Prevenção de FOUC (Flash of Unstyled Content) */
            body {
              opacity: 0;
              animation: fadeIn 0.3s ease-in-out forwards;
            }
            
            @keyframes fadeIn {
              to { opacity: 1; }
            }
            
            /* Otimização de performance */
            * {
              box-sizing: border-box;
            }
            
            /* Configurações de acessibilidade */
            @media (prefers-reduced-motion: reduce) {
              html { scroll-behavior: auto; }
              * { animation-duration: 0.01ms !important; }
            }
            
            /* Loading skeleton para melhor UX */
            .loading-skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `,
          }}
        />

        {/* Structured Data / JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Delivery Express",
              description: "Entrega rápida e segura na sua casa",
              url: "https://seudominio.com",
              logo: "https://seudominio.com/logo.png",
              foundingDate: "2024",
              founder: {
                "@type": "Organization",
                name: "VisionX",
                url: "https://visionxma.com",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+55-xx-xxxxx-xxxx",
                contactType: "customer service",
                availableLanguage: "Portuguese",
              },
              sameAs: [
                "https://facebook.com/deliveryexpress",
                "https://instagram.com/deliveryexpress",
                "https://twitter.com/deliveryexpress",
              ],
            }),
          }}
        />

        {/* Google Analytics (substitua GA_MEASUREMENT_ID pelo seu ID) */}
        {process.env.NODE_ENV === "production" && (
          <>
            <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'GA_MEASUREMENT_ID', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </head>

      <body className="antialiased min-h-screen bg-background text-foreground">
        {/* Fallback para usuários sem JavaScript */}
        <noscript>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "8px",
              margin: "20px",
              textAlign: "center",
            }}
          >
            <h2>JavaScript Necessário</h2>
            <p>Para uma melhor experiência, por favor habilite o JavaScript no seu navegador.</p>
          </div>
        </noscript>

        {/* Container principal */}
        <div id="root">{children}</div>

        {/* Indicador de conectividade (opcional) */}
        <div id="offline-indicator" style={{ display: "none" }}>
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#f44336",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              fontSize: "14px",
              zIndex: 1000,
            }}
          >
            Sem conexão com a internet
          </div>
        </div>

        {/* Script para detecção de conectividade */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                const indicator = document.getElementById('offline-indicator');
                
                function updateOnlineStatus() {
                  if (navigator.onLine) {
                    indicator.style.display = 'none';
                  } else {
                    indicator.style.display = 'block';
                  }
                }
                
                window.addEventListener('online', updateOnlineStatus);
                window.addEventListener('offline', updateOnlineStatus);
                updateOnlineStatus();
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
