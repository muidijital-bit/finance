import { pbkdf2Sync, randomBytes } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Kullanim: node scripts/hash-password.mjs SIFRENIZ');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 100000, 32, 'sha256');
console.log('\nCloudflare env var olarak ekleyin:\n');
console.log('ADMIN_PASSWORD_HASH=' + salt.toString('hex') + ':' + hash.toString('hex'));
