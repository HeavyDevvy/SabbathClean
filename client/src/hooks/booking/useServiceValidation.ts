import { useMemo } from "react";
import { validateAccountNumber, southAfricanBanks } from "../../../../config/banks";

export interface ValidationErrors {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  selectedBank?: string;
  bankAccount?: string;
  bankBranch?: string;
}

export interface PaymentFormData {
  paymentMethod: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  selectedBank: string;
  bankAccount: string;
  bankBranch: string;
}

// Luhn Algorithm for card validation
function validateCardNumberLuhn(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  
  let sum = 0;
  let shouldDouble = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    if (shouldDouble) {
      if ((digit *= 2) > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

// Detect card brand from number
export function detectCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return '';
}

// Formatting functions
export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .slice(0, 19);
}

export function formatExpiryDate(value: string): string {
  const numericValue = value.replace(/\D/g, '').slice(0, 4);
  if (numericValue.length >= 2) {
    return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
  }
  return numericValue;
}

/**
 * Validation functions for payment fields
 */
export const validateCardNumber = (cardNumber: string): string => {
  if (!cardNumber) return "Card number is required";
  if (!validateCardNumberLuhn(cardNumber)) return "Invalid card number";
  return "";
};

export const validateExpiryDate = (expiry: string): string => {
  if (!expiry) return "Expiry date is required";
  const [month, year] = expiry.split('/');
  if (!month || !year || month.length !== 2 || year.length !== 2) {
    return "Use MM/YY format";
  }
  const monthNum = parseInt(month);
  const yearNum = parseInt('20' + year);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  if (monthNum < 1 || monthNum > 12) return "Invalid month";
  if (yearNum < currentYear) return "Card has expired";
  if (yearNum === currentYear && monthNum < currentMonth) return "Card has expired";
  return "";
};

export const validateCVV = (cvv: string, cardBrand: string): string => {
  if (!cvv) return "CVV is required";
  const expectedLength = cardBrand === 'American Express' ? 4 : 3;
  if (cvv.length !== expectedLength) {
    return `CVV must be ${expectedLength} digits`;
  }
  if (!/^\d+$/.test(cvv)) return "CVV must be numeric";
  return "";
};

export const validateCardholderName = (name: string): string => {
  if (!name) return "Cardholder name is required";
  if (name.length < 3) return "Name is too short";
  if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters";
  return "";
};

export const validateSelectedBank = (bankCode: string): string => {
  if (!bankCode) return "Please select your bank";
  return "";
};

export const validateBankAccount = (account: string, selectedBank: string): string => {
  if (!account) return "Bank account is required";
  if (selectedBank) {
    const isValid = validateAccountNumber(selectedBank, account);
    if (!isValid) {
      const bank = southAfricanBanks.find(b => b.code === selectedBank);
      const lengths = bank?.accountNumberLength.join(' or ') || '8-12';
      return `Account must be ${lengths} digits for this bank`;
    }
  } else if (!/^\d{8,12}$/.test(account)) {
    return "Account number must be 8-12 digits";
  }
  return "";
};

export const validateBankBranch = (branch: string): string => {
  if (!branch) return "Branch code is required";
  if (!/^\d{6}$/.test(branch)) return "Branch code must be 6 digits";
  return "";
};

/**
 * Hook for validating service booking payment information
 */
export function useServiceValidation(formData: PaymentFormData) {
  const cardBrand = useMemo(() => detectCardBrand(formData.cardNumber), [formData.cardNumber]);
  
  const errors = useMemo((): ValidationErrors => {
    if (formData.paymentMethod === "card") {
      return {
        cardNumber: validateCardNumber(formData.cardNumber),
        expiryDate: validateExpiryDate(formData.expiryDate),
        cvv: validateCVV(formData.cvv, cardBrand),
        cardholderName: validateCardholderName(formData.cardholderName)
      };
    } else if (formData.paymentMethod === "bank") {
      return {
        selectedBank: validateSelectedBank(formData.selectedBank),
        bankAccount: validateBankAccount(formData.bankAccount, formData.selectedBank),
        bankBranch: validateBankBranch(formData.bankBranch)
      };
    }
    return {};
  }, [formData, cardBrand]);

  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== "" && error !== undefined);
  }, [errors]);

  const isValid = !hasErrors;

  return {
    errors,
    hasErrors,
    isValid,
    cardBrand,
    // Export utility functions
    formatCardNumber,
    formatExpiryDate,
    detectCardBrand
  };
}
