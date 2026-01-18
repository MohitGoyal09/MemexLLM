/**
 * Email Validation Utility
 * Provides multiple layers of validation to prevent fake/disposable emails
 */

// List of common disposable/temporary email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  // Popular disposable email services
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'tempmail.com',
  'getnada.com',
  'maildrop.cc',
  'trashmail.com',
  'sharklasers.com',
  'grr.la',
  'emailondeck.com',
  'fakeinbox.com',
  'mt2014.com',
  'mt2015.com',
  'getairmail.com',
  'dispostable.com',
  'tempinbox.com',
  'mohmal.com',
  'mytemp.email',
  'spamgourmet.com',
  'jetable.org',
  'iroid.com',
  'nvhrw.com',
  'zxcv.com',
  'bobmail.info',
  'clrmail.com',
  'spam4.me',
  'tmails.net',
  'anonymbox.com',
  'mailnesia.com',
  'mailcatch.com',
  'wegwerfemail.de',
  'trashmail.de',
  'drdrb.net',
];

/**
 * Validates email format using RFC 5322
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Checks if email domain is a known disposable email provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

/**
 * Validates email domain has valid MX records (requires server-side check)
 * This is a placeholder - actual implementation should be done on backend
 */
export function hasMXRecords(email: string): Promise<boolean> {
  // This should be implemented on the backend using DNS lookup
  // For now, return true as placeholder
  console.warn('MX record validation should be done server-side');
  return Promise.resolve(true);
}

/**
 * Checks for common typos in popular email domains
 */
export function suggestEmailCorrection(email: string): string | null {
  const domain = email.toLowerCase().split('@')[1];
  
  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'protonmail.com',
  ];

  const typoMap: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
  };

  if (typoMap[domain]) {
    const username = email.split('@')[0];
    return `${username}@${typoMap[domain]}`;
  }

  return null;
}

/**
 * Validates if email belongs to a free email provider (optional - for business use)
 */
export function isFreeEmailProvider(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  const freeProviders = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'mail.com',
    'aol.com',
    'protonmail.com',
    'zoho.com',
  ];
  
  return freeProviders.includes(domain);
}

/**
 * Comprehensive email validation
 * Returns validation result with specific error messages
 */
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

export function validateEmail(email: string, options?: {
  blockDisposable?: boolean;
  blockFreeProviders?: boolean;
}): EmailValidationResult {
  const { 
    blockDisposable = true,
    blockFreeProviders = false,
  } = options || {};

  // Check if email is provided
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email is required',
    };
  }

  // Trim and lowercase for consistency
  const normalizedEmail = email.trim().toLowerCase();

  // Check format
  if (!isValidEmailFormat(normalizedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }

  // Check for typos and suggest corrections
  const suggestion = suggestEmailCorrection(normalizedEmail);
  if (suggestion) {
    return {
      isValid: false,
      error: `Did you mean ${suggestion}?`,
      suggestion,
    };
  }

  // Check for disposable email
  if (blockDisposable && isDisposableEmail(normalizedEmail)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not allowed. Please use a permanent email address.',
    };
  }

  // Check for free email providers (optional, for business apps)
  if (blockFreeProviders && isFreeEmailProvider(normalizedEmail)) {
    return {
      isValid: false,
      error: 'Please use your work email address',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Normalize email address (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if email is from a specific domain (for enterprise/org restrictions)
 */
export function isFromDomain(email: string, allowedDomains: string[]): boolean {
  const domain = email.toLowerCase().split('@')[1];
  return allowedDomains.map(d => d.toLowerCase()).includes(domain);
}
