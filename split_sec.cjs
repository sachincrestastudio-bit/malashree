const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src");

const jwtContent = `
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');

export const generateToken = async (payload: any, expiresIn: string = '7d'): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
};

export const verifyToken = async (token: string): Promise<any | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
};

export const setAuthCookie = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
};

export const getAuthCookie = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  return cookieStore.get('auth_token')?.value;
};

export const clearAuthCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
};
`;

const passwordContent = `
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
`;

fs.writeFileSync(path.join(src, "utils/jwt.ts"), jwtContent);
fs.writeFileSync(path.join(src, "utils/password.ts"), passwordContent);
if (fs.existsSync(path.join(src, "utils/security.ts"))) {
  fs.unlinkSync(path.join(src, "utils/security.ts"));
}

// Update references
const replaceInFile = (file, replacements) => {
  let content = fs.readFileSync(file, "utf8");
  replacements.forEach((r) => (content = content.replace(r.search, r.replace)));
  fs.writeFileSync(file, content);
};

replaceInFile(path.join(src, "middleware.ts"), [
  { search: /'\.\/utils\/security'/g, replace: "'./utils/jwt'" },
]);

replaceInFile(path.join(src, "actions/auth.ts"), [
  {
    search:
      /import \{ hashPassword, verifyPassword, generateToken, setAuthCookie, clearAuthCookie \} from '\.\.\/utils\/security';/g,
    replace:
      "import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt';\nimport { hashPassword, verifyPassword } from '../utils/password';",
  },
]);

replaceInFile(path.join(src, "actions/user.ts"), [
  {
    search: /import \{ getAuthCookie, verifyToken \} from '\.\.\/utils\/security';/g,
    replace: "import { getAuthCookie, verifyToken } from '../utils/jwt';",
  },
]);

console.log("Security files split.");
