import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ConfigManager } from '../../../core/ConfigManager';
import { logger } from '../../../utils/logger';

/**
 * Interface for JWT payload
 */
interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  [key: string]: any;
}

/**
 * Verify a JWT token
 * @param token - JWT token
 * @param secret - JWT secret
 */
export function verifyToken(token: string, secret: string): JWTPayload {
  return jwt.verify(token, secret) as JWTPayload;
}

/**
 * Authentication middleware for the REST API
 * @param configManager - Configuration manager instance
 */
export function authMiddleware(configManager: ConfigManager) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip authentication for health check endpoint
    if (req.path === '/health') {
      return next();
    }
    
    // Check if authentication is enabled
    const authEnabled = configManager.get('security.jwt.enabled', true);
    
    if (!authEnabled) {
      // If authentication is disabled, add a default user to the request
      req.user = {
        userId: 'anonymous',
        username: 'anonymous',
        role: 'user'
      };
      return next();
    }
    
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication token is required' });
    }
    
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authentication token format' });
    }
    
    const token = parts[1];
    
    try {
      // Verify the token
      const secret = configManager.get('security.jwt.secret', '');
      const decoded = verifyToken(token, secret);
      
      // Add the decoded user to the request
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.error(`Authentication error: ${error instanceof Error ? error.message : String(error)}`);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  };
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

