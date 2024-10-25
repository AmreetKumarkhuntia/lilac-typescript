import { months } from './defaults.ts';

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0; // Generate a random number between 0 and 15
    const v = c === 'x' ? r : (r & 0x3) | 0x8; // If 'y', ensure the format
    return v.toString(16); // Convert to hexadecimal
  });
}

/**
 * * Formats the current timestamp.
 * @returns {string} The formatted timestamp string.
 */
export function formatTimestamp(): string {
  const now = new Date();
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return `[${date}/${month}/${year}-${hours}:${minutes}:${seconds}.${milliseconds}]`;
}
