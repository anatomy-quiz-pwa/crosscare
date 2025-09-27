export const ENV = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "",
  LINE_CHANNEL_ID: process.env.LINE_CHANNEL_ID ?? process.env.NEXT_PUBLIC_LINE_CLIENT_ID ?? "",
  LINE_CHANNEL_SECRET: process.env.LINE_CHANNEL_SECRET ?? "",
  LINE_REDIRECT_URI: process.env.LINE_REDIRECT_URI ?? "",
  SESSION_SECRET: process.env.SESSION_SECRET ?? "",
};

export function missingEnvKeys(): string[] {
  const miss: string[] = [];
  if (!ENV.LINE_CHANNEL_ID) miss.push("LINE_CHANNEL_ID");
  if (!ENV.LINE_CHANNEL_SECRET) miss.push("LINE_CHANNEL_SECRET");
  if (!ENV.SESSION_SECRET) miss.push("SESSION_SECRET");
  return miss;
}