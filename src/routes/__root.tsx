import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import type { RouterAuth } from "@/router";

import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
  auth: RouterAuth;
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl font-black text-primary">404</h1>
        <h2 className="mt-4 font-serif text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn't exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { title: "PLATO — Plateau Digital Cultural Archive" },
      { name: "description", content: "Where Culture Lives On. Explore Plateau State's 17 LGAs, learn dialects, stories, proverbs and more." },
      { name: "theme-color", content: "#c46a3a" },
      { property: "og:title", content: "PLATO — Plateau Digital Cultural Archive" },
      { property: "og:description", content: "Where Culture Lives On. Explore Plateau State's 17 LGAs, learn dialects, stories, proverbs and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "PLATO — Plateau Digital Cultural Archive" },
      { name: "twitter:description", content: "Where Culture Lives On. Explore Plateau State's 17 LGAs, learn dialects, stories, proverbs and more." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a769e42b-e201-4146-b49f-539998544710/id-preview-f4f18118--b7bd43f7-cd05-4d87-80c9-0f3fb06e4fa3.lovable.app-1776970261319.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a769e42b-e201-4146-b49f-539998544710/id-preview-f4f18118--b7bd43f7-cd05-4d87-80c9-0f3fb06e4fa3.lovable.app-1776970261319.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "PLATO" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "shortcut icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthBridge() {
  const auth = useAuth();
  const ctx = Route.useRouteContext();
  // Keep router context auth in sync
  ctx.auth.isAuthenticated = !!auth.session;
  ctx.auth.userId = auth.user?.id ?? null;
  ctx.auth.roles = auth.roles;
  ctx.auth.isAdmin = auth.isAdmin;
  ctx.auth.isContributor = auth.isContributor;
  return <Outlet />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthBridge />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
