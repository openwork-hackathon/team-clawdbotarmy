// Service initialization
// Auto-start background services when the app starts

import { startMonitoring } from './priceMonitor';

let initialized = false;

export function initializeServices() {
  if (initialized) {
    console.log('Services already initialized');
    return;
  }

  console.log('🚀 Initializing ClawdbotArmy services...');

  // Start price monitoring
  try {
    startMonitoring();
    console.log('✓ Price monitoring started');
  } catch (error) {
    console.error('Failed to start price monitoring:', error);
  }

  initialized = true;
  console.log('✓ All services initialized');
}

export function isInitialized() {
  return initialized;
}
