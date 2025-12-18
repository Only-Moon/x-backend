import crypto from "crypto";

/**
 * Derives a stable, non-reversible identifier
 * for a ChatGPT conversation context.
 */
export function getChatGPTContextId(req) {
  const raw =
    req.headers["x-openai-conversation-id"] ||
    req.headers["x-openai-session-id"] ||
    req.headers["x-openai-user-id"];

  if (!raw) return null;

  return crypto.createHash("sha256").update(raw).digest("hex");
}
