/**
 * Validation utilities for API data
 */

export function validateUuid(id: string | undefined | null): boolean {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhoneNumber(
  phone: string | undefined | null
): boolean {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
}

export function validatePositiveNumber(
  value: number | undefined | null
): boolean {
  return value !== undefined && value !== null && value > 0;
}

export function validateNonNegativeNumber(
  value: number | undefined | null
): boolean {
  return value !== undefined && value !== null && value >= 0;
}

export function validateStringNotEmpty(
  value: string | undefined | null
): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}

export function validateFileSize(sizeBytes: number, maxSizeMB = 50): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return sizeBytes <= maxSizeBytes;
}

export function validateFileType(
  fileName: string,
  allowedExtensions: string[]
): boolean {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? allowedExtensions.includes(extension) : false;
}

export function validatePrintJobRequest(data: {
  uploadedFileId?: string;
  printerId?: string;
  pageSizeId?: string;
  colorModeId?: string;
  numberOfCopy?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validateUuid(data.uploadedFileId)) {
    errors.push('Invalid uploaded file ID');
  }

  if (!validateUuid(data.printerId)) {
    errors.push('Invalid printer ID');
  }

  if (!validateUuid(data.pageSizeId)) {
    errors.push('Invalid page size ID');
  }

  if (!validateUuid(data.colorModeId)) {
    errors.push('Invalid color mode ID');
  }

  if (
    !validatePositiveNumber(data.numberOfCopy) ||
    data.numberOfCopy! > 99 ||
    data.numberOfCopy! < 1
  ) {
    errors.push('Number of copies must be between 1 and 99');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateDepositRequest(data: {
  amount?: number;
  paymentMethod?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!validatePositiveNumber(data.amount) || data.amount! < 10000) {
    errors.push('Deposit amount must be at least 10,000 VND');
  }

  if (!validateStringNotEmpty(data.paymentMethod)) {
    errors.push('Payment method is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

