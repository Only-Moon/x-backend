import crypto from "crypto";

export async function auth(req, res, next) {
  const snapshot = {
    ip: req.ip,
    headers: req.headers,
  };

  const fingerprint = crypto
    .createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex");

  // attach for response inspection
  req.__fingerprint = fingerprint;

  next();
}
