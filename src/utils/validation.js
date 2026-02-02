// Input validation utilities

/**
 * Validate Ethereum address
 */
export function isValidAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value) {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && isFinite(num);
}

/**
 * Validate trading side
 */
export function isValidSide(side) {
  if (!side || typeof side !== 'string') return false;
  return ['BUY', 'SELL'].includes(side.toUpperCase());
}

/**
 * Validate token symbol
 */
export function isValidSymbol(symbol) {
  if (!symbol || typeof symbol !== 'string') return false;
  return /^[A-Z]{2,10}$/.test(symbol.toUpperCase());
}

/**
 * Sanitize numeric input
 */
export function sanitizeAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.abs(num); // Always positive
}

/**
 * Validate slippage percentage (0-100)
 */
export function isValidSlippage(slippage) {
  const num = parseFloat(slippage);
  return !isNaN(num) && num >= 0 && num <= 100;
}

/**
 * Validate deadline (must be future timestamp)
 */
export function isValidDeadline(deadline) {
  const time = parseInt(deadline);
  return !isNaN(time) && time > Date.now() / 1000;
}
