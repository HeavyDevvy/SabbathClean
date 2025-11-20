export const getCardBrand = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';
  return '';
};

export const formatCardNumber = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .slice(0, 19);
};

export const formatExpiryDate = (value: string): string => {
  const numericValue = value.replace(/\D/g, '').slice(0, 4);
  if (numericValue.length >= 2) {
    return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
  }
  return numericValue;
};

export const validateCardNumber = (cardNumber: string): string => {
  if (!cardNumber) return "Card number is required";
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d{13,19}$/.test(cleaned)) return "Invalid card number format";
  
  // Luhn Algorithm
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
  return sum % 10 === 0 ? "" : "Invalid card number";
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

export const validateCVV = (cvv: string, cardType: string): string => {
  if (!cvv) return "CVV is required";
  const expectedLength = cardType === 'American Express' ? 4 : 3;
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

export const validateBankAccount = (
  account: string,
  selectedBank?: string,
  validateAccountNumber?: (bankCode: string, account: string) => boolean,
  southAfricanBanks?: Array<{ code: string; accountNumberLength: number[] }>
): string => {
  if (!account) return "Bank account is required";
  if (selectedBank && validateAccountNumber) {
    const isValid = validateAccountNumber(selectedBank, account);
    if (!isValid && southAfricanBanks) {
      const bank = southAfricanBanks.find(b => b.code === selectedBank);
      const lengths = bank?.accountNumberLength.join(' or ') || '8-12';
      return `Account must be ${lengths} digits for this bank`;
    }
    if (!isValid) {
      return "Invalid account number for this bank";
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

export interface PaymentErrors {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  selectedBank: string;
  bankAccount: string;
  bankBranch: string;
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
