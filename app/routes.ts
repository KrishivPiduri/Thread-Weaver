import { type RouteConfig, index, route } from "@react-router/dev/routes";

// Wrap routes in a layout that handles analytics
const withAnalytics = (r: ReturnType<typeof route> | ReturnType<typeof index>) => {
    return {
        ...r,
        wrapper: "routes/analytics-layout.tsx",
    };
};

export default [
    withAnalytics(index("routes/home.tsx")),
    withAnalytics(route("/login", "routes/login.tsx")),
    withAnalytics(route("/generate", "routes/generate.tsx")),
    withAnalytics(route("/workspace", "routes/workspace.tsx")),
] satisfies RouteConfig;
