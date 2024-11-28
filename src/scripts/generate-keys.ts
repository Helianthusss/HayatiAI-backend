import { writeFileSync, mkdirSync } from 'fs';
import { generateKeyPairSync } from 'crypto';
import * as path from 'path';

function generateKeys() {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Ensure certs directory exists
  const certsPath = path.join(process.cwd(), 'certs');
  try {
    mkdirSync(certsPath);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }

  // Write keys to files
  writeFileSync(`${certsPath}/private.key`, privateKey);
  writeFileSync(`${certsPath}/public.key`, publicKey);

  console.log('RSA key pair generated successfully!');
}

generateKeys();