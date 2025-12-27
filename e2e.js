import WebSocket from 'ws';

(async () => {
  const base = 'http://localhost:5001';
  const suffix = Math.random().toString(36).slice(2,8);
  const provEmail = `provider_test+${suffix}@example.com`;
  const custEmail = `customer_test+${suffix}@example.com`;
  const fetchJson = async (method, url, body, token) => {
    const res = await fetch(base + url, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${text}`);
    return json;
  };
  const health = await fetch(base + '/__health');
  console.log('HEALTH', health.status);
  // 1) Register provider user
  const provReg = await fetchJson('POST','/api/auth/register',{ email: provEmail, password:'testpass', firstName:'Prov', lastName:'User', phone:'0000000000', isProvider:true });
  const provToken = provReg.accessToken;
  const provUser = provReg.user;
  console.log('Provider user', provUser.id);
  // 2) Create provider profile
  const provider = await fetchJson('POST','/api/providers',{ userId: provUser.id, firstName:'Prov', lastName:'User', email: provEmail, phone:'0000000000', hourlyRate:'350', servicesOffered:['gardening'], location:'Cape Town', providerType:'individual', rating:'4.8', totalReviews:120 });
  console.log('Provider profile', provider.id);
  // 3) Admin login and approve provider
  const adminLogin = await fetchJson('POST','/api/admin/login',{ email:'admin@berryevents.co.za', password:'123456' });
  const adminToken = adminLogin.token;
  await fetchJson('POST',`/api/admin/providers/${provider.id}`,{ action: "approve" },adminToken);
  console.log('Provider approved');
  // 4) Register customer user
  const custReg = await fetchJson('POST','/api/auth/register',{ email: custEmail, password:'testpass', firstName:'Cust', lastName:'User', phone:'0000000000' });
  const custToken = custReg.accessToken;
  const custUser = custReg.user;
  console.log('Customer user', custUser.id);
  // 5) Fetch a service
  const services = await fetchJson('GET','/api/services');
  const svc = services[0] || { id:'house-cleaning', name:'House Cleaning', basePrice:'300', category:'indoor-services', subcategory:'house-cleaning' };
  console.log('Service', svc.id);
  // 6) Add cart item selecting provider
  const tomorrow = new Date(Date.now()+24*60*60*1000);
  const dateStr = tomorrow.toISOString().slice(0,10);
  const cartItemRes = await fetchJson('POST','/api/cart/items',{ serviceId: svc.id, serviceName: svc.name || 'Service', serviceType: svc.subcategory || svc.category || 'service', providerId: provider.id, scheduledDate: dateStr, scheduledTime: '09:00', duration: 2, basePrice: String(svc.basePrice || '300'), addOnsPrice: '0', subtotal: String(svc.basePrice || '300'), tipAmount: '0', serviceDetails: { address:'123 Test St', city:'Cape Town', provider:{ id: provider.id, name: 'Prov User'} } }, custToken);
  console.log('Cart item added', cartItemRes.item?.id);
  // 7) Checkout to create bookings
  const checkoutRes = await fetchJson('POST','/api/cart/checkout',{ paymentMethod:'card', cardLast4:'4242', cardBrand:'VISA', cardholderName:'Cust User' }, custToken);
  console.log('Order created', checkoutRes.order?.id);
  // 8) Provider fetch bookings
  const provBookings = await fetchJson('GET',`/api/providers/${provider.id}/bookings?status=pending-provider,accepted`, null, provToken);
  console.log('Provider bookings count', Array.isArray(provBookings) ? provBookings.length : -1);
  const first = Array.isArray(provBookings) ? provBookings[0] : null;
  if (first) {
    // 9) Accept booking and create chat
    await fetchJson('PATCH',`/api/bookings/${first.id}/status`,{ status:'accepted' });
    console.log('Booking accepted', first.id, 'bookingNumber', first.bookingNumber);
    const conversation = await fetchJson('POST','/api/conversations',{ bookingId:first.id, customerId:first.customerId, providerId: provider.id }, provToken);
    console.log('Conversation created', conversation.id);

    // 9b) WebSocket subscribe and realtime test
    const ws = new WebSocket('ws://localhost:5001/ws');
    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });
    ws.send(JSON.stringify({ type: 'subscribe_chat', conversationId: conversation.id }));
    let received = [];
    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg.toString());
        if (data.type === 'new_message' && data.conversationId === conversation.id) {
          received.push(data.message);
        }
      } catch {}
    });

    // Send messages from customer and provider
    await fetchJson('POST','/api/messages',{ conversationId: conversation.id, senderId: custUser.id, senderType: 'customer', content: 'Hello from customer' }, custToken);
    await new Promise(r => setTimeout(r, 500));
    await fetchJson('POST','/api/messages',{ conversationId: conversation.id, senderId: provUser.id, senderType: 'provider', content: 'Hello from provider' }, provToken);
    await new Promise(r => setTimeout(r, 500));

    // Verify both sides can fetch messages
    const msgsForCust = await fetchJson('GET',`/api/conversations/${conversation.id}/messages`, null, custToken);
    const msgsForProv = await fetchJson('GET',`/api/conversations/${conversation.id}/messages`, null, provToken);
    console.log('Messages (customer view)', msgsForCust.length);
    console.log('Messages (provider view)', msgsForProv.length);
    if (msgsForCust.length < 2 || msgsForProv.length < 2) {
      throw new Error('Messages did not persist correctly');
    }
    if (received.length < 2) {
      throw new Error('Realtime messages not received over WebSocket');
    }
    ws.close();
  }
  // 10) Past bookings check
  const past = await fetchJson('GET',`/api/providers/${provider.id}/bookings?status=declined,completed,cancelled`, null, provToken);
  console.log('Past bookings count', Array.isArray(past) ? past.length : -1);
  console.log('E2E flow complete');
})().catch(err => { console.error('E2E error:', err.message); process.exit(1); });
