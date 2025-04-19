import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    // Define the index route for the home page
    index("routes/home.tsx"),

    // Define the public route for the login page
    route("/login", "routes/login.tsx"),
    // Protected routes — they require the user to be logged in
    route("/generate", "routes/generate.tsx"),

    // Workspace route (protected)
    route("/workspace", "routes/workspace.tsx"),
] satisfies RouteConfig;
