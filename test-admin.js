const { SignJWT } = require('jose');

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod",
);

async function run() {
  const payload = {
    id: "669db6e8d80f8361ab89ab89", // fake or need real ID
    role: "admin",
    email: "pariharsachin5002@gmail.com"
  };
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
    
  console.log("TOKEN:", token);
}
run();
