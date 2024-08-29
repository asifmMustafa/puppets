// ANSI escape codes for colors and reset
const TEXT_COLORS = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
};

// Just to make the logs look nice :)
const logMsg = (color: string, text_one: string, text_two: string): void =>
  console.log(
    `${TEXT_COLORS[color]}[ ${text_one} ]${TEXT_COLORS.reset} ${text_two}`
  );

const logError = (message: string): void =>
  console.log(`${TEXT_COLORS.red}[ ERROR ]${TEXT_COLORS.reset} ${message}`);

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = { logMsg, logError, delay, getRandomNumber };
