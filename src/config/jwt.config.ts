import { readFileSync } from 'fs';
import * as path from 'path';

let privateKey: string;
let publicKey: string;

try {
  privateKey = readFileSync(
    path.join(process.cwd(), 'certs/private.key'),
    'utf8'
  );
  publicKey = readFileSync(
    path.join(process.cwd(), 'certs/public.key'),
    'utf8'
  );
} catch (error) {
  privateKey = process.env.JWT_PRIVATE_KEY;
  publicKey = process.env.JWT_PUBLIC_KEY;
}

export const jwtConfig = {
  privateKey,
  publicKey,
  accessTokenExpiry: '30m',
  refreshTokenExpiry: '7d'
};