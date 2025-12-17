export function auth(req, res, next) {
  console.log("Expected:", process.env.API_KEY);
  console.log("Received:", req.headers.authorization);

  const token = req.headers.authorization;
  if (!token || token !== `Bearer ${process.env.API_KEY}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
