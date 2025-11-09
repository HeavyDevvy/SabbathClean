// South African Banks Configuration
// Used for payment validation and bank account verification

export interface BankInfo {
  code: string;
  name: string;
  accountNumberLength: number[]; // Allowed lengths
  branchCodeRequired: boolean;
}

export const southAfricanBanks: BankInfo[] = [
  {
    code: "ABSA",
    name: "ABSA",
    accountNumberLength: [10, 11],
    branchCodeRequired: true,
  },
  {
    code: "FNB",
    name: "FNB (First National Bank)",
    accountNumberLength: [10, 11],
    branchCodeRequired: true,
  },
  {
    code: "STANDARD",
    name: "Standard Bank",
    accountNumberLength: [9, 10, 11],
    branchCodeRequired: true,
  },
  {
    code: "NEDBANK",
    name: "Nedbank",
    accountNumberLength: [10, 11],
    branchCodeRequired: true,
  },
  {
    code: "CAPITEC",
    name: "Capitec Bank",
    accountNumberLength: [10],
    branchCodeRequired: false, // Capitec uses universal branch code
  },
  {
    code: "INVESTEC",
    name: "Investec",
    accountNumberLength: [10, 11],
    branchCodeRequired: true,
  },
  {
    code: "AFRICAN",
    name: "African Bank",
    accountNumberLength: [10],
    branchCodeRequired: true,
  },
  {
    code: "TYME",
    name: "TymeBank",
    accountNumberLength: [10],
    branchCodeRequired: false, // Digital bank
  },
  {
    code: "DISCOVERY",
    name: "Discovery Bank",
    accountNumberLength: [10],
    branchCodeRequired: true,
  },
  {
    code: "BIDVEST",
    name: "Bidvest Bank",
    accountNumberLength: [10, 11],
    branchCodeRequired: true,
  },
  {
    code: "SASFIN",
    name: "Sasfin Bank",
    accountNumberLength: [10],
    branchCodeRequired: true,
  },
];

// Validate account number based on selected bank
export function validateAccountNumber(bankCode: string, accountNumber: string): boolean {
  const bank = southAfricanBanks.find(b => b.code === bankCode);
  if (!bank) return accountNumber.length >= 8 && accountNumber.length <= 13; // Generic fallback
  
  const cleanNumber = accountNumber.replace(/\s/g, '');
  return bank.accountNumberLength.includes(cleanNumber.length);
}

// Validate CVV
export function validateCVV(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

// Validate expiry date (MM/YY format)
export function validateExpiry(expiry: string): { valid: boolean; message?: string } {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return { valid: false, message: "Format must be MM/YY" };
  }
  
  const [month, year] = expiry.split('/').map(Number);
  
  if (month < 1 || month > 12) {
    return { valid: false, message: "Invalid month" };
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, message: "Card has expired" };
  }
  
  return { valid: true };
}
