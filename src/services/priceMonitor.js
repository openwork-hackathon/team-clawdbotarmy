// Price Monitoring Service
// Continuously monitors prices and triggers alerts

import { getAllPrices } from '../api/portfolio';
import {
  getActiveAlerts,
  checkCondition,
  triggerAlert,
  markNotified
} from './alertManager';

let monitorInterval = null;
let isMonitoring = false;
const MONITOR_INTERVAL = 30000; // Check every 30 seconds

// Store recent prices for reference
const priceCache = new Map();

/**
 * Start monitoring prices
 */
export function startMonitoring(intervalMs = MONITOR_INTERVAL) {
  if (isMonitoring) {
    console.log('Price monitoring already running');
    return;
  }

  console.log(`Starting price monitoring (every ${intervalMs}ms)`);
  isMonitoring = true;

  // Run immediately, then on interval
  checkPrices();
  monitorInterval = setInterval(checkPrices, intervalMs);
}

/**
 * Stop monitoring
 */
export function stopMonitoring() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
  isMonitoring = false;
  console.log('Price monitoring stopped');
}

/**
 * Check if monitoring is active
 */
export function isMonitoringActive() {
  return isMonitoring;
}

/**
 * Main price checking logic
 */
async function checkPrices() {
  try {
    const activeAlerts = getActiveAlerts();
    if (activeAlerts.length === 0) {
      return; // Nothing to check
    }

    // Get current prices
    const prices = await getCurrentPrices();

    // Check each alert
    for (const alert of activeAlerts) {
      const currentPrice = prices[alert.symbol];
      
      if (!currentPrice) {
        console.warn(`No price found for ${alert.symbol}`);
        continue;
      }

      // Update price cache
      priceCache.set(alert.symbol, {
        price: currentPrice,
        timestamp: Date.now()
      });

      // Check if condition is met
      if (checkCondition(alert, currentPrice)) {
        console.log(`🔔 Alert triggered! ${alert.symbol} ${alert.condition} ${alert.targetPrice} (current: ${currentPrice})`);
        
        // Trigger the alert
        triggerAlert(alert.id, currentPrice);
        
        // Send notification
        await sendNotification(alert, currentPrice);
        
        // Mark as notified
        markNotified(alert.id);
      }
    }
  } catch (error) {
    console.error('Price check error:', error);
  }
}

/**
 * Get current prices for all symbols
 */
async function getCurrentPrices() {
  try {
    const coingeckoPrices = await getAllPrices();
    
    // Map CoinGecko IDs to our symbols
    return {
      'BTC': coingeckoPrices['bitcoin']?.usd,
      'WBTC': coingeckoPrices['wrapped-bitcoin']?.usd,
      'ETH': coingeckoPrices['ethereum']?.usd,
      'SOL': coingeckoPrices['solana']?.usd,
      'USDC': 1, // Stablecoin
      'OPENWORK': coingeckoPrices['openwork-ai']?.usd || 0.00001,
      'ARYA': 0.5 // Mock price (would get from Clanker contract)
    };
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    return {};
  }
}

/**
 * Send notification for triggered alert
 */
async function sendNotification(alert, currentPrice) {
  const message = formatAlertMessage(alert, currentPrice);
  
  console.log(`📨 Notification: ${message}`);
  
  // Email notification
  if (alert.email) {
    await sendEmail(alert.email, message);
  }
  
  // Webhook notification
  if (alert.webhook) {
    await sendWebhook(alert.webhook, {
      alertId: alert.id,
      symbol: alert.symbol,
      condition: alert.condition,
      targetPrice: alert.targetPrice,
      currentPrice,
      triggeredAt: new Date().toISOString(),
      message
    });
  }
  
  // Could add: Telegram, Discord, SMS, etc.
}

/**
 * Format alert message
 */
function formatAlertMessage(alert, currentPrice) {
  const direction = alert.condition === 'above' ? '↑' : '↓';
  const emoji = alert.condition === 'above' ? '🚀' : '📉';
  
  return `${emoji} Price Alert: ${alert.symbol} ${direction} $${currentPrice.toFixed(4)} (target: $${alert.targetPrice})`;
}

/**
 * Send email (placeholder - would integrate with SendGrid, etc.)
 */
async function sendEmail(email, message) {
  console.log(`📧 Would send email to ${email}: ${message}`);
  // TODO: Integrate with email service
  return Promise.resolve();
}

/**
 * Send webhook
 */
async function sendWebhook(url, payload) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
    
    console.log(`✓ Webhook sent to ${url}`);
  } catch (error) {
    console.error('Webhook error:', error);
  }
}

/**
 * Get monitoring status
 */
export function getMonitorStatus() {
  const activeAlerts = getActiveAlerts();
  
  return {
    isActive: isMonitoring,
    interval: MONITOR_INTERVAL,
    activeAlerts: activeAlerts.length,
    cachedPrices: Array.from(priceCache.entries()).map(([symbol, data]) => ({
      symbol,
      price: data.price,
      timestamp: data.timestamp
    }))
  };
}

/**
 * Manual price check (for testing)
 */
export async function checkNow() {
  await checkPrices();
  return getMonitorStatus();
}
