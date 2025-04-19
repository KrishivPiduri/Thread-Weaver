// root.tsx
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { TopicProvider } from "../context/TopicContext";
import { AuthProvider } from "../context/AuthContext";
import type { Route } from "./+types/root";
import "./app.css";
import UserMenu from "../components/UserMenu";
import { useAuth } from "../context/AuthContext";
import { GraphDataProvider } from "../context/GraphDataContext";
import { useLocation, Navigate } from "react-router-dom";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Auto Mind</title>
        <Meta />
        <Links />
      </head>
      <body>
      {children}
      <ScrollRestoration />
      <Scripts />
      </body>
      </html>
  );
}

// ✅ This is where we set up all providers, but don’t use hooks here!
export default function App() {
  return (
      <GraphDataProvider>
        <AuthProvider>
          <TopicProvider>
            <AppWrapper />
          </TopicProvider>
        </AuthProvider>
      </GraphDataProvider>
  );
}

// ✅ Hooks like useAuth go here, safely under providers
function AppWrapper() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isPublic = location.pathname === "/" || location.pathname === "/login";

  if (loading) return null;

  if (!user && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  return (
      <>
        {!isPublic && user && <UserMenu user={user} onLogout={() => {}} />}
        <Outlet />
      </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
        error.status === 404
            ? "The requested page could not be found."
            : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
      <main className="pt-16 p-4 container mx-auto">
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
            <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
        )}
      </main>
  );
}
