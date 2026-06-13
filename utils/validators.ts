export const validators = {
  email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value: string) => /^[+0-9\s-]{7,20}$/.test(value),
  required: (value?: string) => Boolean(value?.trim()),
};
