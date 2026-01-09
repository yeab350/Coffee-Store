import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'
import OpenAI from 'openai'

dotenv.config()

const PORT = Number(process.env.PORT || 5175)
const MONGODB_URI = process.env.MONGODB_URI
const MONGODB_DB = process.env.MONGODB_DB || 'abyssinia_beans'
const JWT_SECRET = process.env.JWT_SECRET
const PRIMARY_ADMIN_EMAIL = (process.env.PRIMARY_ADMIN_EMAIL || 'yeabtsegaye350@gmail.com').trim().toLowerCase()

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI in environment')
}
if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment')
}

const normaliseEmail = (value) => String(value || '').trim().toLowerCase()

const createToken = (user) => {
  const payload = {
    sub: user._id?.toString?.() || user.id || user.email,
    email: user.email,
    role: user.role,
    name: user.name,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

const authRequired = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }
  const token = header.slice('Bearer '.length)
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

const primaryAdminRequired = (req, res, next) => {
  const email = normaliseEmail(req.user?.email)
  if (email !== PRIMARY_ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Only the primary admin can perform this action' })
  }
  return next()
}

const computeOrderStatus = (order, nowMs) => {
  const createdAt = Number(order.createdAt || 0)
  const age = nowMs - createdAt
  if (!Number.isFinite(age) || age < 0) {
    return { status: order.status || 'Queued', fulfilledAt: order.fulfilledAt }
  }
  if (age >= 3600) {
    return { status: 'Fulfilled', fulfilledAt: order.fulfilledAt || nowMs }
  }
  if (age >= 1600) {
    return { status: 'Roasting', fulfilledAt: order.fulfilledAt }
  }
  return { status: 'Queued', fulfilledAt: order.fulfilledAt }
}

const buildReference = (timestampMs, index) => {
  const tail = String(timestampMs).slice(-6)
  return `ABY-${tail}-${index + 1}`
}

const stripWrappingQuotes = (value) => {
  const trimmed = String(value || '').trim()
  if (trimmed.length >= 2) {
    const first = trimmed[0]
    const last = trimmed[trimmed.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
      return trimmed.slice(1, -1).trim()
    }
  }
  return trimmed
}

const getClientIp = (req) => {
  const forwarded = String(req.headers['x-forwarded-for'] || '')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return String(req.ip || '')
}

const extractResponseText = (payload) => {
  if (!payload) return ''
  if (typeof payload.output_text === 'string') return payload.output_text
  const outputs = Array.isArray(payload.output) ? payload.output : []
  const chunks = []
  for (const out of outputs) {
    const content = Array.isArray(out?.content) ? out.content : []
    for (const part of content) {
      if (part?.type === 'output_text' && typeof part?.text === 'string') {
        chunks.push(part.text)
      }
    }
  }
  return chunks.join('\n').trim()
}

const seedProducts = async (products) => {
  const now = Date.now()
  const seed = [
    {
      slug: 'yirgacheffe-washed',
      name: 'Yirgacheffe – Washed',
      region: 'Yirgacheffe',
      process: 'Washed',
      flavorNotes: ['floral', 'citrus', 'tea-like'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'Clean, bright cup with lifted aromatics typical of washed processing.',
      imageUrl: '/coffees/yirgacheffe-washed.jpg',
    },
    {
      slug: 'yirgacheffe-natural',
      name: 'Yirgacheffe – Natural',
      region: 'Yirgacheffe',
      process: 'Natural',
      flavorNotes: ['berry', 'stone fruit', 'sweet'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'Fruit-forward profile from whole-cherry drying and careful raised-bed handling.',
      imageUrl: '/coffees/yirgacheffe-natural.jpg',
    },
    {
      slug: 'sidamo-washed',
      name: 'Sidamo – Washed',
      region: 'Sidamo',
      process: 'Washed',
      flavorNotes: ['citrus', 'honey', 'black tea'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'Structured and crisp, highlighting clarity and sweetness from washed processing.',
      imageUrl: '/coffees/sidamo-washed.jpg',
    },
    {
      slug: 'guji-natural',
      name: 'Guji – Natural',
      region: 'Guji',
      process: 'Natural',
      flavorNotes: ['ripe fruit', 'cocoa', 'floral'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'A classic natural profile with a rounded body and sweet finish.',
      imageUrl: '/coffees/guji-natural.jpg',
    },
    {
      slug: 'harrar-natural',
      name: 'Harrar – Natural',
      region: 'Harrar',
      process: 'Natural',
      flavorNotes: ['dried fruit', 'spice', 'chocolate'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'Bold and aromatic, leaning into traditional Harrar natural character.',
      imageUrl: '/coffees/harrar-natural.jpg',
    },
    {
      slug: 'limu-washed',
      name: 'Limu – Washed',
      region: 'Limu',
      process: 'Washed',
      flavorNotes: ['sweet citrus', 'caramel', 'tea-like'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'Balanced washed coffee with a clean finish and gentle sweetness.',
      imageUrl: '/coffees/limu-washed.jpg',
    },
    {
      slug: 'bench-maji-natural',
      name: 'Bench Maji – Natural',
      region: 'Bench Maji',
      process: 'Natural',
      flavorNotes: ['tropical fruit', 'jammy', 'cacao'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'Sweet natural lot with ripe fruit character and a smooth body.',
      imageUrl: '/coffees/bench-maji-natural.jpg',
    },
    {
      slug: 'kaffa-forest-coffee',
      name: 'Kaffa – Forest Coffee',
      region: 'Kaffa',
      process: 'Forest Coffee',
      flavorNotes: ['herbal', 'floral', 'cocoa'],
      altitude: '—',
      pricePerKg: 1500,
      story: 'Wild and semi-wild coffees traditionally collected from forest systems in Kaffa.',
      imageUrl: '/coffees/kaffa-forest-coffee.jpg',
    },
  ]

  await Promise.all(
    seed.map((item) =>
      products.updateOne(
        { slug: item.slug },
        {
          $set: { ...item, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      ),
    ),
  )
}

const main = async () => {
  const client = new MongoClient(MONGODB_URI)
  await client.connect()

  const db = client.db(MONGODB_DB)
  const users = db.collection('users')
  const orders = db.collection('orders')
  const products = db.collection('products')

  await users.createIndex({ email: 1 }, { unique: true })
  await orders.createIndex({ userEmail: 1, createdAt: -1 })
  await products.createIndex({ slug: 1 }, { unique: true })
  await products.createIndex({ createdAt: -1 })

  await seedProducts(products)

  const app = express()

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true)
        }

        const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        const isIpv6Local = /^https?:\/\/\[::1\](:\d+)?$/.test(origin)
        return callback(null, isLocal || isIpv6Local)
      },
      credentials: false,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/health', (_req, res) => res.json({ ok: true }))

  // Products listing used by the mobile app.
  // Returns JSON: { products: [...] }
  app.get('/products', async (req, res) => {
    const limitRaw = Number(req.query?.limit)
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(200, Math.floor(limitRaw)) : 200

    const toNumber = (value) => {
      const num = Number(value)
      return Number.isFinite(num) ? num : 0
    }

    const list = await products
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    const normalized = list.map((p) => ({
      id: p.slug || (p._id?.toString?.() || String(p._id || '')),
      name: p.name || p.title || '',
      price: toNumber(p.price ?? p.pricePerKg ?? p.amount ?? 0),
      imageUrl: p.imageUrl || p.image || p.imageSrc || '',
      description: p.description || p.story || '',
      slug: p.slug || '',
      region: p.region || '',
      process: p.process || '',
      flavorNotes: Array.isArray(p.flavorNotes) ? p.flavorNotes : [],
      altitude: p.altitude || '',
      pricePerKg: toNumber(p.pricePerKg ?? p.price ?? 0),
    }))

    return res.json({ products: normalized })
  })

  // Public chat endpoint (no auth) that calls OpenAI securely from the server.
  // NOTE: Do NOT call OpenAI directly from the browser; keep API keys server-side.
  const chatRate = new Map()
  const CHAT_WINDOW_MS = 10 * 60 * 1000
  const CHAT_MAX_REQUESTS = 30

  app.post('/chat', async (req, res) => {
    const apiKey = stripWrappingQuotes(process.env.OPENAI_API_KEY)
    if (!apiKey) return res.status(500).json({ error: 'Missing OPENAI_API_KEY on the server' })

    const client = new OpenAI({ apiKey })

    const ip = getClientIp(req)
    const now = Date.now()
    const entry = chatRate.get(ip) || { count: 0, resetAt: now + CHAT_WINDOW_MS }
    if (now > entry.resetAt) {
      entry.count = 0
      entry.resetAt = now + CHAT_WINDOW_MS
    }
    entry.count += 1
    chatRate.set(ip, entry)
    if (entry.count > CHAT_MAX_REQUESTS) {
      return res.status(429).json({ error: 'Too many chat requests. Please try again in a few minutes.' })
    }

    const message = String(req.body?.message || '').trim()
    if (!message) return res.status(400).json({ error: 'Message is required' })

    const model = String(process.env.OPENAI_MODEL || 'gpt-4.1-mini').trim() || 'gpt-4.1-mini'

    try {
      const response = await client.responses.create({
        model,
        input: message,
      })

      const reply = String(response?.output_text || '').trim()
      if (!reply) {
        return res.status(502).json({ error: 'Empty response from OpenAI' })
      }

      return res.json({ reply })
    } catch (err) {
      const status = Number(err?.status)
      const httpStatus = Number.isFinite(status) && status >= 400 && status < 600 ? status : 502

      const rawMessage = String(err?.message || '').trim()
      const message =
        httpStatus === 401
          ? 'OpenAI authentication failed. Check OPENAI_API_KEY on the server.'
          : httpStatus === 429
            ? 'OpenAI quota/billing limit reached. Check your OpenAI project billing and usage.'
            : rawMessage

      return res.status(httpStatus).json({ error: message || 'Chat service unavailable. Please try again.' })
    }
  })

  app.post('/auth/signup', async (req, res) => {
    const name = String(req.body?.name || '').trim()
    const email = normaliseEmail(req.body?.email)
    const password = String(req.body?.password || '').trim()

    if (!name) return res.status(400).json({ error: 'Name is required' })
    if (!email) return res.status(400).json({ error: 'Email is required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const role = email === PRIMARY_ADMIN_EMAIL ? 'admin' : 'member'
    const passwordHash = await bcrypt.hash(password, 10)

    try {
      const createdAt = Date.now()
      const doc = { name, email, passwordHash, createdAt, role }
      const result = await users.insertOne(doc)
      const user = { _id: result.insertedId, name, email, createdAt, role }
      const token = createToken(user)
      return res.status(201).json({ user, token })
    } catch (e) {
      if (String(e?.message || '').includes('E11000')) {
        return res.status(409).json({ error: 'An account already exists for this email' })
      }
      return res.status(500).json({ error: 'Signup failed' })
    }
  })

  app.post('/auth/login', async (req, res) => {
    const email = normaliseEmail(req.body?.email)
    const password = String(req.body?.password || '').trim()

    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const userDoc = await users.findOne({ email })
    if (!userDoc) return res.status(401).json({ error: 'Incorrect email or password' })

    const ok = await bcrypt.compare(password, userDoc.passwordHash)
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password' })

    // Enforce primary admin role based on email.
    const role = email === PRIMARY_ADMIN_EMAIL ? 'admin' : userDoc.role || 'member'
    if (role !== userDoc.role) {
      await users.updateOne({ _id: userDoc._id }, { $set: { role } })
    }

    const user = {
      _id: userDoc._id,
      name: userDoc.name,
      email: userDoc.email,
      createdAt: userDoc.createdAt,
      role,
    }
    const token = createToken(user)
    return res.json({ user, token })
  })

  app.get('/auth/me', authRequired, async (req, res) => {
    const email = normaliseEmail(req.user?.email)
    const userDoc = await users.findOne({ email }, { projection: { passwordHash: 0 } })
    if (!userDoc) return res.status(404).json({ error: 'User not found' })

    const role = email === PRIMARY_ADMIN_EMAIL ? 'admin' : userDoc.role || 'member'
    if (role !== userDoc.role) {
      await users.updateOne({ _id: userDoc._id }, { $set: { role } })
    }

    return res.json({
      user: { _id: userDoc._id, name: userDoc.name, email: userDoc.email, createdAt: userDoc.createdAt, role },
    })
  })

  app.get('/orders/my', authRequired, async (req, res) => {
    const email = normaliseEmail(req.user?.email)
    const list = await orders.find({ userEmail: email }).sort({ createdAt: -1 }).toArray()

    const now = Date.now()
    const updates = []
    const normalized = list.map((order) => {
      const { status, fulfilledAt } = computeOrderStatus(order, now)
      if (status !== order.status || (fulfilledAt && fulfilledAt !== order.fulfilledAt)) {
        updates.push({ id: order._id, status, fulfilledAt })
      }
      return { ...order, status, fulfilledAt }
    })

    if (updates.length) {
      await Promise.all(
        updates.map((u) => orders.updateOne({ _id: u.id }, { $set: { status: u.status, fulfilledAt: u.fulfilledAt } })),
      )
    }

    return res.json({ orders: normalized })
  })

  app.post('/orders/checkout', authRequired, async (req, res) => {
    const email = normaliseEmail(req.user?.email)
    const cartItems = Array.isArray(req.body?.cartItems) ? req.body.cartItems : []

    if (cartItems.length === 0) return res.status(400).json({ error: 'Cart is empty' })

    const timestamp = Date.now()
    const docs = cartItems.map((item, index) => {
      const createdAt = timestamp
      const status = 'Queued'
      return {
        userEmail: email,
        reference: buildReference(timestamp, index),
        status,
        createdAt,
        roastId: item.roastId,
        roastLabel: item.roastLabel,
        bagSize: item.bagSize,
        blend: item.blend,
        price: item.price,
      }
    })

    const result = await orders.insertMany(docs)
    const inserted = docs.map((doc, index) => ({ ...doc, _id: result.insertedIds[index] }))
    return res.status(201).json({ orders: inserted })
  })

  app.get('/admin/users', authRequired, async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' })
    }

    const userDocs = await users
      .find({}, { projection: { passwordHash: 0 } })
      .sort({ createdAt: -1 })
      .toArray()

    const totals = await orders
      .aggregate([
        { $group: { _id: '$userEmail', totalSpent: { $sum: '$price' } } },
      ])
      .toArray()

    const totalsByEmail = new Map(totals.map((t) => [String(t._id || '').toLowerCase(), Number(t.totalSpent || 0)]))

    const rows = userDocs.map((u) => {
      const email = normaliseEmail(u.email)
      const role = email === PRIMARY_ADMIN_EMAIL ? 'admin' : u.role || 'member'
      return {
        name: u.name,
        email,
        createdAt: u.createdAt,
        role,
        totalSpent: totalsByEmail.get(email) || 0,
      }
    })

    const totalSpentAll = rows.reduce((sum, r) => sum + (Number.isFinite(r.totalSpent) ? r.totalSpent : 0), 0)

    return res.json({
      primaryAdminEmail: PRIMARY_ADMIN_EMAIL,
      totalSignups: rows.length,
      totalSpent: totalSpentAll,
      users: rows,
    })
  })

  app.post('/admin/promote', authRequired, primaryAdminRequired, async (req, res) => {
    const targetEmail = normaliseEmail(req.body?.email)
    if (!targetEmail) return res.status(400).json({ error: 'Email is required' })
    if (targetEmail === PRIMARY_ADMIN_EMAIL) {
      return res.status(400).json({ error: 'Primary admin is already admin' })
    }

    const result = await users.updateOne({ email: targetEmail }, { $set: { role: 'admin' } })
    if (result.matchedCount === 0) return res.status(404).json({ error: 'User not found' })

    return res.json({ ok: true })
  })

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
