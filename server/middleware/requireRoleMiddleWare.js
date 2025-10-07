import { supabase } from "../db/supabase.js";
// Generic role checker
export function requireRole(allowedRoles) {
    return async (req, res, next) => {
        try {
            const user = req.user; // must be set by requireAuth
            if (!user) {
                return res.status(401).json({ error: "Unauthorized: No user found" });
            }
            // Fetch role from database
            const { data: roleData, error } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user.id)
                .single();
            if (error) {
                console.error("Error fetching role:", error.message);
                return res.status(500).json({ error: "Failed to fetch user role" });
            }
            const userRole = roleData?.role ?? "viewer";
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ error: "Forbidden: Insufficient role" });
            }
            // Attach role for downstream use
            req.user.role = userRole;
            next();
        }
        catch (err) {
            console.error("Role check failed:", err.message);
            return res.status(401).json({ error: "Unauthorized" });
        }
    };
}
export const requireAdmin = requireRole(["admin"]);
export const requireEditor = requireRole(["admin", "editor"]);
export const requireViewer = requireRole(["admin", "editor", "viewer"]);
