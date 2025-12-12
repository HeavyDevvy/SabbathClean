(async () => {
  const base = 'http://localhost:5001';
  const req = async (m, u, b, t) => {
    const r = await fetch(base + u, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }, body: b ? JSON.stringify(b) : undefined });
    const text = await r.text();
    let j; try { j = JSON.parse(text); } catch { j = { raw: text }; }
    if (!r.ok) throw new Error(m + ' ' + u + ' -> ' + r.status + ': ' + text);
    return j;
  };
  const pLogin = await req('POST','/api/auth/login',{ email:'provider_test@example.com', password:'testpass' });
  const pToken = pLogin.accessToken;
  const pUser = pLogin.user;
  const provider = await req('GET',`/api/providers/by-user/${pUser.id}`);
  console.log('Provider ID', provider.id);
  const cLogin = await req('POST','/api/auth/login',{ email:'customer_test@example.com', password:'testpass' });
  const cToken = cLogin.accessToken;
  const services = await req('GET','/api/services');
  const svc = services[0] || { id:'house-cleaning', name:'House Cleaning', basePrice:'300', category:'indoor-services', subcategory:'house-cleaning' };
  const tomorrow = new Date(Date.now()+24*60*60*1000).toISOString().slice(0,10);
  await req('POST','/api/cart/items',{ serviceId: svc.id, serviceName: svc.name || 'Service', serviceType: svc.subcategory || svc.category || 'service', providerId: provider.id, scheduledDate: tomorrow, scheduledTime: '10:00', duration: 2, basePrice: String(svc.basePrice || '300'), addOnsPrice: '0', subtotal: String(svc.basePrice || '300'), tipAmount: '0', serviceDetails: { address:'123 Test St', city:'Cape Town', provider:{ id: provider.id, name:'Prov User'} } }, cToken);
  const order = await req('POST','/api/cart/checkout',{ paymentMethod:'card', cardLast4:'4242', cardBrand:'VISA', cardholderName:'Cust User' }, cToken);
  console.log('Order', order.order?.id);
  const bookings = await req('GET',`/api/providers/${provider.id}/bookings?status=pending-provider,accepted`, null, pToken);
  console.log('Provider bookings len', Array.isArray(bookings)?bookings.length:-1);
})();
