// Price Alert Management System
// In-memory storage (would use DB in production)

const alerts = new Map();
let alertIdCounter = 1;

/**
 * Create a new price alert
 */
export function createAlert(config) {
  const alert = {
    id: `alert_${alertIdCounter++}`,
    symbol: config.symbol.toUpperCase(),
    condition: config.condition, // 'above' or 'below'
    targetPrice: parseFloat(config.targetPrice),
    currentPrice: parseFloat(config.currentPrice) || null,
    status: 'active', // 'active', 'triggered', 'expired', 'cancelled'
    createdAt: new Date().toISOString(),
    triggeredAt: null,
    userId: config.userId || 'anonymous',
    email: config.email || null,
    webhook: config.webhook || null,
    notified: false
  };

  // Validation
  if (!alert.symbol || !alert.condition || !alert.targetPrice) {
    throw new Error('Missing required fields: symbol, condition, targetPrice');
  }

  if (!['above', 'below'].includes(alert.condition)) {
    throw new Error('Condition must be "above" or "below"');
  }

  if (alert.targetPrice <= 0) {
    throw new Error('Target price must be positive');
  }

  alerts.set(alert.id, alert);
  return alert;
}

/**
 * Get alert by ID
 */
export function getAlert(id) {
  return alerts.get(id) || null;
}

/**
 * Get all alerts (with optional filters)
 */
export function getAlerts(filters = {}) {
  let results = Array.from(alerts.values());

  if (filters.userId) {
    results = results.filter(a => a.userId === filters.userId);
  }

  if (filters.symbol) {
    results = results.filter(a => a.symbol === filters.symbol.toUpperCase());
  }

  if (filters.status) {
    results = results.filter(a => a.status === filters.status);
  }

  // Sort by creation date (newest first)
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return results;
}

/**
 * Get active alerts only
 */
export function getActiveAlerts() {
  return getAlerts({ status: 'active' });
}

/**
 * Update alert
 */
export function updateAlert(id, updates) {
  const alert = alerts.get(id);
  if (!alert) return null;

  Object.assign(alert, updates, {
    updatedAt: new Date().toISOString()
  });

  alerts.set(id, alert);
  return alert;
}

/**
 * Delete alert
 */
export function deleteAlert(id) {
  return alerts.delete(id);
}

/**
 * Cancel alert
 */
export function cancelAlert(id) {
  return updateAlert(id, { status: 'cancelled' });
}

/**
 * Trigger alert (mark as triggered)
 */
export function triggerAlert(id, currentPrice) {
  return updateAlert(id, {
    status: 'triggered',
    triggeredAt: new Date().toISOString(),
    currentPrice,
    notified: false
  });
}

/**
 * Mark alert as notified
 */
export function markNotified(id) {
  return updateAlert(id, { notified: true });
}

/**
 * Check if price meets alert condition
 */
export function checkCondition(alert, currentPrice) {
  if (alert.condition === 'above') {
    return currentPrice >= alert.targetPrice;
  } else if (alert.condition === 'below') {
    return currentPrice <= alert.targetPrice;
  }
  return false;
}

/**
 * Get alert statistics
 */
export function getAlertStats(userId = null) {
  const filtered = userId ? getAlerts({ userId }) : Array.from(alerts.values());

  return {
    total: filtered.length,
    active: filtered.filter(a => a.status === 'active').length,
    triggered: filtered.filter(a => a.status === 'triggered').length,
    cancelled: filtered.filter(a => a.status === 'cancelled').length,
    bySymbol: filtered.reduce((acc, a) => {
      acc[a.symbol] = (acc[a.symbol] || 0) + 1;
      return acc;
    }, {})
  };
}

/**
 * Clear all alerts (for testing)
 */
export function clearAllAlerts() {
  alerts.clear();
  alertIdCounter = 1;
}

/**
 * Get alerts count
 */
export function getAlertsCount() {
  return alerts.size;
}
