export type RegistrationInput = {
  displayName: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string[]> };

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value: unknown): string {
  return text(value).toLowerCase();
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRegistration(input: unknown): ValidationResult<RegistrationInput> {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const data: RegistrationInput = {
    displayName: text(source.displayName),
    email: normalizeEmail(source.email),
    password: typeof source.password === "string" ? source.password : "",
  };

  const errors: Record<string, string[]> = {
    displayName: [],
    email: [],
    password: [],
  };

  if (data.displayName.length < 2 || data.displayName.length > 80) {
    errors.displayName.push("Use entre 2 e 80 caracteres.");
  }
  if (!validEmail(data.email) || data.email.length > 254) {
    errors.email.push("Informe um e-mail válido.");
  }
  if (data.password.length < 10 || data.password.length > 128) {
    errors.password.push("A senha deve ter entre 10 e 128 caracteres.");
  }
  if (!/[a-zA-Z]/.test(data.password) || !/\d/.test(data.password)) {
    errors.password.push("A senha deve conter letras e números.");
  }

  const success = Object.values(errors).every((items) => items.length === 0);
  return success ? { success: true, data } : { success: false, errors };
}

export function validateLogin(input: unknown): ValidationResult<LoginInput> {
  const source = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const data: LoginInput = {
    email: normalizeEmail(source.email),
    password: typeof source.password === "string" ? source.password : "",
  };

  const errors: Record<string, string[]> = { email: [], password: [] };
  if (!validEmail(data.email)) errors.email.push("Informe um e-mail válido.");
  if (!data.password) errors.password.push("Informe a senha.");

  const success = Object.values(errors).every((items) => items.length === 0);
  return success ? { success: true, data } : { success: false, errors };
}
