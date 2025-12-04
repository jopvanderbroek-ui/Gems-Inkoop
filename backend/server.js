const express = require('express')
const app = express()
app.use(express.json())
const cors = require('cors')

// Read environment variables
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL || '*'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || null
const SHIPPO_TOKEN = process.env.SHIPPO_TOKEN || null
const DATABASE_URL = process.env.DATABASE_URL || null

// Configure CORS (allow either specific origin or all)
if (FRONTEND_URL === '*' || FRONTEND_URL === '') {
  app.use(cors())
} else {
  app.use(cors({ origin: FRONTEND_URL }))
}

// Log non-sensitive presence of important env vars (do not log secrets)
console.log('Starting server with:')
console.log('- PORT =', PORT)
console.log('- FRONTEND_URL =', FRONTEND_URL === '*' ? 'any' : FRONTEND_URL)
console.log('- STRIPE configured =', !!STRIPE_SECRET_KEY)
console.log('- SHIPPO configured =', !!SHIPPO_TOKEN)
console.log('- DATABASE configured =', !!DATABASE_URL)

// products (in production: use a DB)
const products = [
  { id: 1, title: 'Duurzame Mok', priceEUR: 12.5, weightKg: 0.4, hsCode: '6912.00' },
  { id: 2, title: 'Wollen Sjaal', priceEUR: 29.9, weightKg: 0.3, hsCode: '6214.20' },
  { id: 3, title: 'Bluetooth Speaker', priceEUR: 49.0, weightKg: 0.6, hsCode: '8518.22' }
]

app.get('/api/products', (req, res) => res.json(products))

function mockEstimate(body) {
  const weight = (body.parcels || []).reduce((s, p) => s + (p.weightKg || 0) * (p.qty || 1), 0)
  const crossBorder = (body.from && body.from.country) !== (body.to && body.to.country)
  const base = 5.0
  const rate = 3.0
  const crossFee = crossBorder ? 10.0 : 0
  const price = +(base + weight * rate + crossFee).toFixed(2)
  const duties = +(0.05 * (body.declaredValue || 50)).toFixed(2)
  return { carrier: 'DemoCarrier', service: crossBorder ? 'International Express' : 'Domestic', price: { currency: 'EUR', amount: price }, eta: crossBorder ? '3-10 business days' : '1-3 business days', duties: { currency: 'EUR', amount: duties } }
}

app.post('/api/estimate', (req, res) => {
  const e = mockEstimate(req.body)
  res.json(e)
})

let orders = {}
app.post('/api/create-order', (req, res) => {
  const id = 'ORD' + Math.floor(Math.random() * 900000 + 100000)
  const record = { orderId: id, status: 'processing', createdAt: new Date().toISOString(), details: req.body }
  orders[id] = record
  res.json(record)
})

app.get('/api/order/:id', (req, res) => {
  const o = orders[req.params.id]
  if (!o) return res.status(404).json({ error: 'not found' })
  res.json(o)
})

app.listen(PORT, () => console.log(`Mock server listening on http://localhost:${PORT}`))
