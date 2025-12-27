import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  try {
    const a = Buffer.from(String(aHex || ''), 'hex');
    const b = Buffer.from(String(bHex || ''), 'hex');
    if (a.length !== b.length || a.length === 0) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const rawBody = await readRawBody(req);
    const signature = String(req.headers['x-yoco-signature'] || '');
    const secret = process.env.YOCO_WEBHOOK_SECRET || '';
    if (!signature || !secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const isValid = timingSafeEqualHex(signature, expected);
    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      payload = {};
    }
    const eventType = String(payload?.type || payload?.event || '');
    let bookingId: string | undefined = String(payload?.metadata?.bookingId || payload?.metadata?.booking_id || '');
    if (bookingId && bookingId.length === 0) bookingId = undefined;
    if (!bookingId) {
      const checkoutId =
        String(payload?.checkoutId || payload?.id || payload?.data?.id || '') || undefined;
      if (checkoutId) {
        const pay = await prisma.payment.findFirst({ where: { transactionId: checkoutId } });
        if (pay) bookingId = pay.bookingId;
      }
    }
    if (bookingId) {
      console.log('Webhook event:', eventType, 'bookingId:', bookingId);
      const payment = await prisma.payment.findUnique({ where: { bookingId } });
      if (payment) {
        let newStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | undefined = undefined;
        if (eventType === 'payment.succeeded') newStatus = 'COMPLETED';
        else if (eventType === 'payment.failed') newStatus = 'FAILED';
        else if (eventType === 'refund.succeeded') newStatus = 'REFUNDED';
        if (newStatus) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentStatus: newStatus,
              paymentDate: newStatus === 'COMPLETED' ? new Date() : payment.paymentDate,
              payoutDate: newStatus === 'REFUNDED' ? new Date() : payment.payoutDate,
            },
          });
        }
      }
    } else {
      console.log('Webhook event:', eventType, 'bookingId: not found');
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(200).json({ received: true });
  }
}
