function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENV = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? "", // 移除結尾斜線
  LINE_CHANNEL_ID: must("NEXT_PUBLIC_LINE_CLIENT_ID"),
  LINE_CHANNEL_SECRET: must("LINE_CLIENT_SECRET"),
  // 優先用固定的 LINE_REDIRECT_URI；若沒設，就用 runtime 動態推導
  LINE_REDIRECT_URI: process.env.NEXT_PUBLIC_LINE_REDIRECT_URI ?? "",
};
