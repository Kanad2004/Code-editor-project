export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  return errors;
};

export const validateUsername = (username) => {
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, and underscores allowed';
  return null;
};

export const getPasswordStrength = (password) => {
  const errors = validatePassword(password);
  if (errors.length === 0) return { strength: 'Strong', color: 'text-green-500' };
  if (errors.length <= 2) return { strength: 'Medium', color: 'text-yellow-500' };
  return { strength: 'Weak', color: 'text-red-500' };
};
