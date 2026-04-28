import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(200).json({
            success: true,
            demo: true
        });
        return;
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        logger.error('JWT Verification failed', { error: error.message });
        res.status(200).json({
            success: true,
            demo: true
        });
    }
};
