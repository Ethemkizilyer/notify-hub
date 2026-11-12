import { execSync } from 'node:child_process';

export default function globalSetup(): void {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}
