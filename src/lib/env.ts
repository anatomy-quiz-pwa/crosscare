function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENV = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? "",
  LINE_CHANNEL_ID: must("LINE_CHANNEL_ID"),
  LINE_CHANNEL_SECRET: must("LINE_CLIENT_SECRET"),
  LINE_REDIRECT_URI: process.env.LINE_REDIRECT_URI ?? "",
  SESSION_SECRET: must("SESSION_SECRET"),
};
