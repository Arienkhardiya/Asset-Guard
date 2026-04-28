/**
 * TEMPORARILY DISABLED AUTH FOR DEBUGGING
 * Allows all requests and attaches a mock user.
 */
export const authenticateToken = async (req, res, next) => {
    // Attach mock user as requested
    req.user = {
        id: "1",
        uid: "1",
        email: "test@demo.com",
        role: "Admin",
        tenantId: "mock-tenant-id",
        tenantType: "Organization"
    };
    next();
};
export const requireRole = (roles) => {
    return (req, res, next) => {
        // Temporarily bypass role checks
        next();
    };
};
