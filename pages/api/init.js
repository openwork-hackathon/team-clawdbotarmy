// Initialization endpoint - call once on app start
import { initializeServices, isInitialized } from '../../src/services/init';

export default function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!isInitialized()) {
      initializeServices();
      return res.status(200).json({ 
        success: true, 
        message: 'Services initialized',
        initialized: true
      });
    } else {
      return res.status(200).json({ 
        success: true, 
        message: 'Services already initialized',
        initialized: true
      });
    }
  } catch (error) {
    console.error('Initialization error:', error);
    return res.status(500).json({
      error: 'Initialization failed',
      message: error.message
    });
  }
}

// Auto-initialize on first API call
initializeServices();
