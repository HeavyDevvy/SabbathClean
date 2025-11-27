/* minimal parity test script */
const base = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

async function req(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json };
}

function randomEmail() {
  return `test+${Date.now()}@berryevents.local`; // local-only domain
}

(async () => {
  console.log('Parity test against', base);
  const email = randomEmail();
  const password = 'TestPass123!';

  const signup = await req('POST', '/api/auth/register', {
    email, password, firstName: 'Test', lastName: 'User'
  });
  if (!signup.ok) {
    console.error('Signup failed', signup.status, signup.json);
    process.exit(1);
  }
  const accessToken = signup.json.accessToken;

  const login = await req('POST', '/api/auth/login', { email, password });
  if (!login.ok) {
    console.error('Login failed', login.status, login.json);
    process.exit(1);
  }

  // Provider registration (minimal payload)
  const createProvider = await req('POST', '/api/providers', {
    userId: signup.json.user.id,
    firstName: 'Test',
    lastName: 'Provider',
    email,
    phone: '0000000000',
    bio: 'Demo provider',
    hourlyRate: '250.00',
    servicesOffered: ['house-cleaning'],
    experience: 'beginner',
    location: 'Cape Town',
    bankingDetails: { bankName: 'capitec-bank', accountHolder: 'Test Provider', accountNumber: '12345678', branchCode: '1234', accountType: 'checking' },
    providerType: 'individual'
  }, accessToken);
  if (!createProvider.ok) {
    console.error('Provider signup failed', createProvider.status, createProvider.json);
    process.exit(1);
  }

  console.log('Parity test passed');
  process.exit(0);
})();

