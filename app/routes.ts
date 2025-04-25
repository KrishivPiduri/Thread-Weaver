import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/generate", "routes/generate.tsx"),
    route("/workspace/:id", "routes/workspace.tsx"),
    route("/embed/:id", "routes/embed.tsx"),
] satisfies RouteConfig;
