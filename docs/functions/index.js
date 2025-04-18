const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const stripeSecret = functions.config().stripe.secret;
const webhookSecret = functions.config().stripe.webhook;
const stripe = require('stripe')(stripeSecret);

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post('/createCheckoutSession', async (req, res) => {
  const { invoiceId } = req.body;
  const invSnap = await db.collection('invoices').doc(invoiceId).get();
  if (!invSnap.exists) return res.status(404).send('Invoice not found');
  const data = invSnap.data();
  // Build line items from invoice items array
  const lineItems = data.items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: { name: item.description },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    metadata: { invoiceId },
    success_url: `https://${functions.config().app.domain}/success?iid=${invoiceId}`,
    cancel_url: `https://${functions.config().app.domain}/invoice.html?iid=${invoiceId}`
  });
  res.json({ url: session.url });
});

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    const sess = event.data.object;
    const iid = sess.metadata.invoiceId;
    db.collection('invoices').doc(iid).update({ paid: true });
  }
  res.sendStatus(200);
});

exports.api = functions.https.onRequest(app);
