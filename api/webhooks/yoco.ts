import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma.js';
import sgMail from '@sendgrid/mail';

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

          // Send confirmation email if payment succeeded
          if (newStatus === 'COMPLETED') {
            try {
              const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: { user: true }
              });

              if (booking && booking.user && booking.user.email) {
                const apiKey = process.env.SENDGRID_API_KEY;
                if (apiKey) {
                  sgMail.setApiKey(apiKey);
                  const msg = {
                    to: booking.user.email,
                    from: 'bookings@berryevents.co.za', // Verified sender
                    subject: `Berry Events Booking Confirmation - ${booking.id}`,
                    text: `Your booking (Ref: ${booking.id}) has been confirmed. Service: ${booking.eventType}. Date: ${new Date(booking.eventDate).toLocaleDateString()}. Amount: R${booking.totalAmount}.`,
                    html: `
                      <div style="font-family: Arial, sans-serif; color: #333;">
                        <h1 style="color: #7c3aed;">Booking Confirmed!</h1>
                        <p>Hi ${booking.user.firstName},</p>
                        <p>Your payment was successful and your booking has been confirmed.</p>
                        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                          <p><strong>Reference:</strong> ${booking.id}</p>
                          <p><strong>Service:</strong> ${booking.eventType}</p>
                          <p><strong>Date:</strong> ${new Date(booking.eventDate).toLocaleDateString()}</p>
                          <p><strong>Time:</strong> ${booking.eventTime}</p>
                          <p><strong>Amount Paid:</strong> R${booking.totalAmount}</p>
                        </div>
                        <p>We've attached your receipt to this email.</p>
                        <p>If you have any questions, please reply to this email.</p>
                        <p>Best regards,<br>The Berry Events Team</p>
                      </div>
                    `,
                  };
                  await sgMail.send(msg);
                  console.log(`Confirmation email sent to ${booking.user.email}`);
                } else {
                  console.warn("SENDGRID_API_KEY not configured, skipping email");
                }
              }
            } catch (emailError) {
              console.error("Failed to send confirmation email:", emailError);
            }
          }
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
