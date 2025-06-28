// Validation utilities for user profile data

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFullName = (name: string): ValidationResult => {
  if (name.length > 100) {
    return { isValid: false, error: 'Full name must be less than 100 characters' };
  }
  return { isValid: true };
};

export const validateBio = (bio: string): ValidationResult => {
  if (bio.length > 500) {
    return { isValid: false, error: 'Bio must be less than 500 characters' };
  }
  return { isValid: true };
};

export const validateDateOfBirth = (dateString: string): ValidationResult => {
  if (!dateString) {
    return { isValid: true }; // Optional field
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return { isValid: false, error: 'Date must be in YYYY-MM-DD format' };
  }

  const date = new Date(dateString);
  const today = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  // Check age constraints (13-120 years old)
  const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
  const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
  
  if (date < minDate || date > maxDate) {
    return { isValid: false, error: 'Please enter a valid birth date (13-120 years old)' };
  }

  return { isValid: true };
};

export const validateHeight = (heightString: string): ValidationResult => {
  if (!heightString) {
    return { isValid: true }; // Optional field
  }

  const height = parseFloat(heightString);
  if (isNaN(height)) {
    return { isValid: false, error: 'Height must be a valid number' };
  }

  if (height < 50 || height > 300) {
    return { isValid: false, error: 'Height must be between 50-300 cm' };
  }

  return { isValid: true };
};

export const validateWeight = (weightString: string): ValidationResult => {
  if (!weightString) {
    return { isValid: true }; // Optional field
  }

  const weight = parseFloat(weightString);
  if (isNaN(weight)) {
    return { isValid: false, error: 'Weight must be a valid number' };
  }

  if (weight < 20 || weight > 500) {
    return { isValid: false, error: 'Weight must be between 20-500 kg' };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validateUsername = (username: string): ValidationResult => {
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }
  
  if (username.length > 30) {
    return { isValid: false, error: 'Username must be less than 30 characters' };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  return { isValid: true };
};

// Unit conversion utilities
export const convertCmToFeetInches = (cm: number): string => {
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
};

export const convertFeetInchesToCm = (feetInches: string): number => {
  const match = feetInches.match(/(\d+)'(\d+)"/);
  if (!match) return 0;
  
  const feet = parseInt(match[1]);
  const inches = parseInt(match[2]);
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54);
};

export const convertKgToLbs = (kg: number): number => {
  return Math.round(kg * 2.20462);
};

export const convertLbsToKg = (lbs: number): number => {
  return Math.round((lbs / 2.20462) * 10) / 10; // Round to 1 decimal place
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};