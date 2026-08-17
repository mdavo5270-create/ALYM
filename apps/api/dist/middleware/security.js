import crypto from "crypto";
const isProd = () => process.env.NODE_ENV === "production";
const hits = /* @__PURE__ */ new Map();
function rateLimit(max = 60, windowMs = 6e4) {
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const key = `${ip}:${req.path.split("/").slice(0, 4).join("/")}`;
    const row = hits.get(key) || hits.get(ip);
    const bucket = hits.get(key);
    if (!bucket || now > bucket.reset) {
      hits.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((bucket.reset - now) / 1e3)));
      return res.status(429).json({ error: "Trop de requ\xEAtes, r\xE9essaie plus tard" });
    }
    void row;
    next();
  };
}
function securityHeaders(_req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  if (isProd()) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    );
  }
  next();
}
function requireJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32 || s.includes("change-me") || s.includes("dev-secret")) {
    if (isProd()) {
      console.error("FATAL: JWT_SECRET manquant ou trop faible (min 32 chars) en production");
      process.exit(1);
    }
    console.warn("WARNING: JWT_SECRET faible \u2014 OK en dev uniquement");
  }
}
function productionErrorHandler(err, _req, res, _next) {
  if (!isProd()) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Erreur serveur";
    return res.status(500).json({ error: message });
  }
  console.error("[error]", err instanceof Error ? err.message : "unknown");
  return res.status(500).json({ error: "Erreur serveur" });
}
function logInfo(...args) {
  if (!isProd() || process.env.LOG_VERBOSE === "1") {
    console.log(...args);
  }
}
function logError(...args) {
  console.error(...args);
}
function verifyWebhookSignature(secretEnv = "WEBHOOK_SECRET", headerName = "x-signature") {
  return (req, res, next) => {
    const secret = process.env[secretEnv];
    if (!secret) {
      if (isProd()) return res.status(503).json({ error: "Webhook non configur\xE9" });
      return next();
    }
    const sig = req.headers[headerName];
    if (typeof sig !== "string") {
      return res.status(401).json({ error: "Signature manquante" });
    }
    const raw = req.rawBody;
    const payload = raw ?? Buffer.from(JSON.stringify(req.body ?? {}));
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return res.status(401).json({ error: "Signature invalide" });
    }
    next();
  };
}
function rejectUploads(req, res, next) {
  const ct = req.headers["content-type"] || "";
  if (ct.includes("multipart/form-data")) {
    return res.status(415).json({ error: "Upload non autoris\xE9" });
  }
  next();
}
export {
  logError,
  logInfo,
  productionErrorHandler,
  rateLimit,
  rejectUploads,
  requireJwtSecret,
  securityHeaders,
  verifyWebhookSignature
};
