// Price Monitor Control API
import {
  startMonitoring,
  stopMonitoring,
  isMonitoringActive,
  getMonitorStatus,
  checkNow
} from '../../src/services/priceMonitor';

export default async function handler(req, res) {
  const { method } = req;
  const { action } = req.query;

  if (method !== 'GET' && method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    switch (action) {
      case 'start':
        startMonitoring();
        return res.status(200).json({ 
          success: true, 
          message: 'Monitoring started',
          status: getMonitorStatus()
        });

      case 'stop':
        stopMonitoring();
        return res.status(200).json({ 
          success: true, 
          message: 'Monitoring stopped',
          status: getMonitorStatus()
        });

      case 'status':
        return res.status(200).json(getMonitorStatus());

      case 'check':
        const result = await checkNow();
        return res.status(200).json({
          success: true,
          message: 'Manual check completed',
          ...result
        });

      default:
        // Default: return status
        return res.status(200).json(getMonitorStatus());
    }
  } catch (error) {
    console.error('Monitor API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
