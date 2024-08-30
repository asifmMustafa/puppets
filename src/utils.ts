// ANSI escape codes for colors and reset
const TEXT_COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
} as const;

// Define a type that includes the keys of TEXT_COLORS
type TextColor = keyof typeof TEXT_COLORS;

// Just to make the logs look nice :)
export const logMsg = (
  color: TextColor,
  text_one: string,
  text_two: string
): void =>
  console.log(
    `${TEXT_COLORS[color]}[ ${text_one} ]${TEXT_COLORS.reset} ${text_two}`
  );

export const logError = (message: string): void =>
  console.log(`${TEXT_COLORS.red}[ ERROR ]${TEXT_COLORS.reset} ${message}`);

export const catchError = (error: any): void => {
  if (error instanceof Error) {
    logError(error.message);
  } else {
    logError("An unknown error occurred.");
  }
};

export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
