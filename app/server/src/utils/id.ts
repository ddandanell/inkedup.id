import crypto from 'crypto';

export function generateId(prefix = 'id'): string {
  return `${prefix}-${crypto.randomBytes(8).toString('hex')}`;
}

export function generateReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `INK-${ts}-${rand}`;
}
