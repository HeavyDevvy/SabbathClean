(async () => {
  const base = 'http://localhost:5001';
  const req = async (m, u, b, t) => {
    const r = await fetch(base + u, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: b ? JSON.stringify(b) : undefined });
    const tx = await r.text(); let j; try { j = JSON.parse(tx); } catch { j = { raw: tx }; }
    if (!r.ok) throw new Error(m + ' ' + u + ' -> ' + r.status + ': ' + tx);
    return j;
  };
  // 1) Register provider user (unique email)
  let provReg;
  try {
    provReg = await req('POST','/api/auth/register',{ email:'provider_fix9@example.com', password:'testpass', firstName:'Fix9', lastName:'Provider', phone:'0000000000', isProvider:true });
  } catch (e) {
    const login = await req('POST','/api/auth/login',{ email:'provider_fix9@example.com', password:'testpass' });
    provReg = { accessToken: login.accessToken, user: login.user };
  }
  const provToken = provReg.accessToken; const provUser = provReg.user;
  // 2) Create provider profile
  const provider = await req('POST','/api/providers',{ userId: provUser.id, firstName:'Fix9', lastName:'Provider', email:'provider_fix9@example.com', phone:'0000000000', hourlyRate:'350', servicesOffered:['gardening'], location:'Cape Town', providerType:'individual', rating:'4.8', totalReviews:120 });
  // 3) Admin approve
  const adminLogin = await req('POST','/api/admin/login',{ email:'admin@berryevents.co.za', password:'123456' });
  await req('POST',`/api/admin/providers/${provider.id}/approve`,{},adminLogin.token);
  // 4) Register customer user
  let custReg;
  try {
    custReg = await req('POST','/api/auth/register',{ email:'customer_fix9@example.com', password:'testpass', firstName:'Fix9', lastName:'Customer', phone:'0000000000' });
  } catch (e) {
    const login = await req('POST','/api/auth/login',{ email:'customer_fix9@example.com', password:'testpass' });
    custReg = { accessToken: login.accessToken, user: login.user };
  }
  const custToken = custReg.accessToken;
  // 5) Add cart item with selected provider
  const services = await req('GET','/api/services');
  const svc = services.find(s=>s.subcategory==='gardening') || services[0];
  const tomorrow = new Date(Date.now()+24*60*60*1000).toISOString().slice(0,10);
  await req('POST','/api/cart/items',{ serviceId: svc.id, serviceName: svc.name || 'Service', serviceType: svc.subcategory || svc.category || 'service', providerId: provider.id, scheduledDate: tomorrow, scheduledTime: '09:00', duration: 2, basePrice: String(svc.basePrice || '300'), addOnsPrice: '0', subtotal: String(svc.basePrice || '300'), tipAmount: '0', serviceDetails: { address:'123 Test St', city:'Cape Town', provider:{ id: provider.id, name:'Fix9 Provider'} } }, custToken);
  // 6) Checkout
  const order = await req('POST','/api/cart/checkout',{ paymentMethod:'card', cardLast4:'4242', cardBrand:'VISA', cardholderName:'Fix9 Customer' }, custToken);
  // 7) Provider fetch bookings
  const provLogin = await req('POST','/api/auth/login',{ email:'provider_fix9@example.com', password:'testpass' });
  const provBookings = await req('GET',`/api/providers/${provider.id}/bookings?status=pending-provider,accepted`, null, provLogin.accessToken);
  console.log('Bookings count for provider', provider.id, ':', Array.isArray(provBookings)?provBookings.length:-1);
  if (Array.isArray(provBookings) && provBookings[0]) {
    const first = provBookings[0];
    // Accept
    await req('PATCH',`/api/bookings/${first.id}/status`,{ status:'accepted' });
    await req('POST','/api/conversations',{ bookingId:first.id, customerId:first.customerId, providerId: provider.id });
    // Decline and move to past
    await req('PATCH',`/api/bookings/${first.id}/status`,{ status:'declined' });
    const past = await req('GET',`/api/providers/${provider.id}/bookings?status=declined,completed,cancelled`, null, provLogin.accessToken);
    console.log('Past count after decline:', Array.isArray(past)?past.length:-1);
  }
  console.log('E2E Fix9 flow done');
})();
