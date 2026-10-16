import { JWTPayload, jwtVerify, SignJWT } from "jose";

function getJwtSecret(): Uint8Array {
  const secretKey = process.env.JWT_SECRET;

  if (!secretKey) {
    throw new Error(
      "JWT_SECRET environment variable is missing in .env.local.",
    );
  }

  return new TextEncoder().encode(secretKey);
}

export interface AuthTokenPayload extends JWTPayload {
  userID: number | string;
  username: string;
}

export async function signAuthToken(
  payload: AuthTokenPayload,
  expiresIn = "7d",
): Promise<string> {
  return new SignJWT(payload)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .setProtectedHeader({ alg: "HS256" })
    .sign(getJwtSecret());
}

export async function verifyAuthToken(
  token: string | undefined,
): Promise<AuthTokenPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    return payload as AuthTokenPayload;
  } catch (err) {
    return null;
  }
}
