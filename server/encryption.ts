import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// AES-256-GCM encryption for gate codes (Phase 3.2)
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.GATE_CODE_ENCRYPTION_KEY || generateFallbackKey();

function generateFallbackKey(): string {
  // In production, this MUST be set in environment variables
  if (process.env.NODE_ENV === 'production') {
    throw new Error('GATE_CODE_ENCRYPTION_KEY environment variable is required in production');
  }
  
  // Development fallback (EXACTLY 32 bytes for AES-256)
  return 'dev_encryption_key_32bytes_ok!';
}

// Ensure key is 32 bytes for AES-256
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY;
  if (key.length !== 32) {
    throw new Error('Encryption key must be exactly 32 characters (256 bits)');
  }
  return Buffer.from(key, 'utf-8');
}

export interface EncryptedData {
  encryptedGateCode: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts a gate code using AES-256-GCM
 * @param gateCode - Plain text gate code
 * @returns Encrypted data with IV and authentication tag
 */
export function encryptGateCode(gateCode: string): EncryptedData {
  if (!gateCode || gateCode.trim() === '') {
    throw new Error('Gate code cannot be empty');
  }

  // Generate random IV (12 bytes is standard for GCM)
  const iv = randomBytes(12);
  
  // Create cipher
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  // Encrypt the gate code
  let encrypted = cipher.update(gateCode, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get authentication tag
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedGateCode: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypts an encrypted gate code
 * @param encryptedData - Encrypted gate code with IV and auth tag
 * @returns Plain text gate code
 */
export function decryptGateCode(encryptedData: EncryptedData): string {
  try {
    const decipher = createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    // Set auth tag for GCM mode
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    // Decrypt
    let decrypted = decipher.update(encryptedData.encryptedGateCode, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Gate code decryption failed:', error);
    throw new Error('Failed to decrypt gate code - data may be corrupted');
  }
}

/**
 * Masks a gate code for display (shows only first and last character)
 * @param gateCode - Plain text gate code
 * @returns Masked gate code
 */
export function maskGateCode(gateCode: string): string {
  if (!gateCode || gateCode.length === 0) return '';
  if (gateCode.length === 1) return '*';
  if (gateCode.length === 2) return gateCode[0] + '*';
  
  const first = gateCode[0];
  const last = gateCode[gateCode.length - 1];
  const maskedMiddle = '*'.repeat(gateCode.length - 2);
  
  return `${first}${maskedMiddle}${last}`;
}
