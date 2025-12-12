(async () => {
  const base = 'http://localhost:5001';
  const req = async (m, u, b, t) => {
    const r = await fetch(base + u, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: b ? JSON.stringify(b) : undefined });
    const text = await r.text();
    let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }
    if (!r.ok) throw new Error(m + ' ' + u + ' ' + r.status + ' ' + text);
    return j;
  };
  const login = await req('POST','/api/auth/login',{ email:'provider_test@example.com', password:'testpass' });
  const token = login.accessToken;
  const user = login.user;
  const provider = await req('GET',`/api/providers/by-user/${user.id}`);
  const bookings = await req('GET',`/api/providers/${provider.id}/bookings?status=pending-provider,accepted`, null, token);
  console.log('Bookings length:', Array.isArray(bookings) ? bookings.length : -1);
  console.log('First booking:', Array.isArray(bookings) ? bookings[0] : null);
})();
