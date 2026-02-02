// Price Alerts API
import {
  createAlert,
  getAlert,
  getAlerts,
  updateAlert,
  deleteAlert,
  cancelAlert,
  getAlertStats
} from '../../src/services/alertManager';

export default function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      case 'PUT':
        return handlePut(req, res);
      case 'DELETE':
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Alerts API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET /api/alerts - List alerts or get stats
function handleGet(req, res) {
  const { id, userId, symbol, status, stats } = req.query;

  // Get specific alert
  if (id) {
    const alert = getAlert(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.status(200).json(alert);
  }

  // Get statistics
  if (stats === 'true') {
    const statsData = getAlertStats(userId);
    return res.status(200).json(statsData);
  }

  // Get filtered list
  const alerts = getAlerts({ userId, symbol, status });
  return res.status(200).json({
    count: alerts.length,
    alerts
  });
}

// POST /api/alerts - Create new alert
function handlePost(req, res) {
  const { symbol, condition, targetPrice, currentPrice, userId, email, webhook } = req.body;

  // Validation
  if (!symbol) {
    return res.status(400).json({ error: 'Missing required field: symbol' });
  }

  if (!condition || !['above', 'below'].includes(condition)) {
    return res.status(400).json({ error: 'Invalid condition. Must be "above" or "below"' });
  }

  if (!targetPrice || isNaN(targetPrice) || parseFloat(targetPrice) <= 0) {
    return res.status(400).json({ error: 'Invalid targetPrice. Must be a positive number' });
  }

  try {
    const alert = createAlert({
      symbol,
      condition,
      targetPrice,
      currentPrice,
      userId: userId || 'anonymous',
      email,
      webhook
    });

    return res.status(201).json(alert);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

// PUT /api/alerts - Update or cancel alert
function handlePut(req, res) {
  const { id, action, ...updates } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required field: id' });
  }

  // Cancel action
  if (action === 'cancel') {
    const alert = cancelAlert(id);
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    return res.status(200).json(alert);
  }

  // General update
  const alert = updateAlert(id, updates);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.status(200).json(alert);
}

// DELETE /api/alerts - Delete alert
function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing required query param: id' });
  }

  const deleted = deleteAlert(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  return res.status(200).json({ success: true, message: 'Alert deleted' });
}
