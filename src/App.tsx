import type { FormEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

const backgroundVideos = [
  '/Coffee%20background%201.mp4',
  '/Coffee%20background%202.mp4',
  '/Coffee%20background%203.mp4',
]
const coffeeImageFallbackSrc = '/coffee-placeholder.svg'

type Coffee = {
  id: string
  name: string
  process: string
  region: string
  flavorNotes: string[]
  altitude: string
  pricePerKg: number
  story: string
  imageSrc: string
  imageAlt: string
}

const initialCoffeeCatalog: Coffee[] = [
  {
    id: 'yirgacheffe-washed',
    name: 'Yirgacheffe – Washed',
    process: 'Washed',
    region: 'Yirgacheffe',
    flavorNotes: ['floral', 'citrus', 'tea-like'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'Clean, bright cup with lifted aromatics typical of washed processing.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'yirgacheffe-natural',
    name: 'Yirgacheffe – Natural',
    process: 'Natural',
    region: 'Yirgacheffe',
    flavorNotes: ['berry', 'stone fruit', 'sweet'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'Fruit-forward profile from whole-cherry drying and careful raised-bed handling.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'sidamo-washed',
    name: 'Sidamo – Washed',
    process: 'Washed',
    region: 'Sidamo',
    flavorNotes: ['citrus', 'honey', 'black tea'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'Structured and crisp, highlighting clarity and sweetness from washed processing.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'guji-natural',
    name: 'Guji – Natural',
    process: 'Natural',
    region: 'Guji',
    flavorNotes: ['ripe fruit', 'cocoa', 'floral'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'A classic natural profile with a rounded body and sweet finish.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'harrar-natural',
    name: 'Harrar – Natural',
    process: 'Natural',
    region: 'Harrar',
    flavorNotes: ['dried fruit', 'spice', 'chocolate'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'Bold and aromatic, leaning into traditional Harrar natural character.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'limu-washed',
    name: 'Limu – Washed',
    process: 'Washed',
    region: 'Limu',
    flavorNotes: ['sweet citrus', 'caramel', 'tea-like'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'Balanced washed coffee with a clean finish and gentle sweetness.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'bench-maji-natural',
    name: 'Bench Maji – Natural',
    process: 'Natural',
    region: 'Bench Maji',
    flavorNotes: ['tropical fruit', 'jammy', 'cacao'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'Sweet natural lot with ripe fruit character and a smooth body.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'kaffa-forest-coffee',
    name: 'Kaffa – Forest Coffee',
    process: 'Forest Coffee',
    region: 'Kaffa',
    flavorNotes: ['herbal', 'floral', 'cocoa'],
    altitude: '—',
    pricePerKg: 1500,
    story: 'Wild and semi-wild coffees traditionally collected from forest systems in Kaffa.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
]
const handleCoffeeImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const img = event.currentTarget
  if (img.dataset.fallbackApplied === '1') {
    return
  }
  img.dataset.fallbackApplied = '1'
  img.src = coffeeImageFallbackSrc
}

const roastProfiles = [
  {
    id: 'green',
    label: 'As Is (Green Beans)',
    blurb: 'Ship unroasted so you can run your own profile or brew cascara straight from the cherry.',
    extraCostPerKg: 0,
  },
  {
    id: 'roasted',
    label: 'Roasted',
    blurb: 'We roast to order with live telemetry and cooling curves tuned for filter and espresso.',
    extraCostPerKg: 400,
  },
  {
    id: 'roasted-ground',
    label: 'Roasted & Ground',
    blurb: 'Freshly ground to your brew method moments before packing for maximum aromatics.',
    extraCostPerKg: 600,
  },
]

const bagSizeOptions = [
  { value: 0.25, label: '250 g' },
  { value: 0.5, label: '500 g' },
  { value: 0.75, label: '750 g' },
  { value: 1, label: '1 kg' },
  { value: 1.5, label: '1.5 kg' },
  { value: 2, label: '2 kg' },
]

const companyName = 'Abyssinia Beans'

const SESSION_STORAGE_KEY = 'abyssinia-session'
const TOKEN_STORAGE_KEY = 'abyssinia-token'
const CART_STORAGE_PREFIX = 'abyssinia-cart:'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5175'

type BlendRow = {
  id: string
  coffeeId: string
  percent: number
}

type CartBlend = {
  coffeeId: string
  name: string
  weight: number
}

type CartItem = {
  id: string
  createdAt: number
  roastId: string
  roastLabel: string
  bagSize: number
  blend: CartBlend[]
  price: number
}

type OrderRecord = CartItem & {
  _id: string
  userEmail: string
  reference: string
  status: 'Queued' | 'Roasting' | 'Fulfilled'
  fulfilledAt?: number
}

type AccountProfile = {
  _id?: string
  name: string
  email: string
  createdAt: number
  role: 'admin' | 'member'
}

type AdminUserRow = {
  name: string
  email: string
  createdAt: number
  role: 'admin' | 'member'
  totalSpent: number
}

type AdminSummary = {
  primaryAdminEmail: string
  totalSignups: number
  totalSpent: number
  users: AdminUserRow[]
}

type BlendNotice = {
  tone: 'positive' | 'warning'
  message: string
}

type ToastNotice = BlendNotice & {
  action?: { label: string; to: string }
}

type PendingCartDraft = {
  id: string
  createdAt: number
  blend: CartBlend[]
  basePrice: number
  bagSize: number
  quantity: number
  source: 'catalog' | 'custom'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(value)

const formatKg = (value: number) => {
  const rounded = Number(value.toFixed(2))
  if (rounded > 0 && rounded < 1) {
    return `${Math.round(rounded * 1000)} g`
  }
  return `${rounded} kg`
}

const computeBagQuantity = (totalKg: number, bagSizeKg: number) => {
  const totalGrams = Math.round(totalKg * 1000)
  const bagGrams = Math.round(bagSizeKg * 1000)

  if (!Number.isFinite(totalGrams) || totalGrams <= 0 || !Number.isFinite(bagGrams) || bagGrams <= 0) {
    return { isExact: false, exactCount: 0, exactBags: 0, nearestUpKg: 0, nearestDownKg: 0 }
  }

  const remainder = ((totalGrams % bagGrams) + bagGrams) % bagGrams
  const isExact = remainder === 0
  const nearestDownGrams = totalGrams - remainder
  const nearestUpGrams = remainder === 0 ? totalGrams : totalGrams + (bagGrams - remainder)

  return {
    isExact,
    exactCount: isExact ? totalGrams / bagGrams : 0,
    exactBags: totalGrams / bagGrams,
    nearestUpKg: Number((nearestUpGrams / 1000).toFixed(2)),
    nearestDownKg: Number((nearestDownGrams / 1000).toFixed(2)),
  }
}

const normaliseEmail = (value: string) => value.trim().toLowerCase()

const getCartStorageKey = (email: string) => `${CART_STORAGE_PREFIX}${normaliseEmail(email)}`

const getStoredToken = () => window.localStorage.getItem(TOKEN_STORAGE_KEY) || ''

type ApiError = Error & { status?: number }

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const apiRequest = async <T,>(
  path: string,
  options: RequestInit = {},
  token: string | null = null,
): Promise<T> => {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = (await response.json().catch(() => ({}))) as unknown
  if (!response.ok) {
    const message =
      (data as { error?: string } | null)?.error || `Request failed (${response.status})`
    const error: ApiError = new Error(message)
    error.status = response.status
    throw error
  }
  return data as T
}

const loadCartForEmail = (email: string): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(getCartStorageKey(email))
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveCartForEmail = (email: string, items: CartItem[]) => {
  window.localStorage.setItem(getCartStorageKey(email), JSON.stringify(items))
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const showBackgroundVideo = location.pathname === '/'
  const pageClassName = showBackgroundVideo ? 'page page--with-video' : 'page page--interior'
  const [catalog, setCatalog] = useState<Coffee[]>(initialCoffeeCatalog)
  const [isCatalogLoading, setIsCatalogLoading] = useState(false)
  const [bagSize, setBagSize] = useState<number>(1)
  const [customTotalKg, setCustomTotalKg] = useState<number>(1)
  const [catalogQuantities, setCatalogQuantities] = useState<Record<string, number>>(() => {
    return {}
  })
  const [blendRows, setBlendRows] = useState<BlendRow[]>([
    {
      id: 'row-1',
      coffeeId: initialCoffeeCatalog[0].id,
      percent: 50,
    },
    {
      id: 'row-2',
      coffeeId: initialCoffeeCatalog[1].id,
      percent: 50,
    },
  ])
  const [highlightBlend, setHighlightBlend] = useState(false)
  const blendSectionRef = useRef<HTMLElement | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartHydrating, setIsCartHydrating] = useState(true)
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [cartPulse, setCartPulse] = useState(false)
  const [blendNotice, setBlendNotice] = useState<BlendNotice | null>(null)
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null)
  const [currentUser, setCurrentUser] = useState<AccountProfile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [isBootLoading, setIsBootLoading] = useState(() => Boolean(getStoredToken()))
  const [adminSummary, setAdminSummary] = useState<AdminSummary | null>(null)
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authNotice, setAuthNotice] = useState<string>('')
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hi! I’m the Abyssinia Beans assistant. Tell me what you like (sweet, floral, chocolatey, bright) and how you brew, and I’ll recommend a coffee or a custom blend.',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [isChatSending, setIsChatSending] = useState(false)
  const chatInputRef = useRef<HTMLInputElement | null>(null)
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isChatOpen) {
      chatInputRef.current?.focus()
      requestAnimationFrame(() => {
        chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
      })
    }
  }, [isChatOpen])

  useEffect(() => {
    if (!isChatOpen) return
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [chatMessages, isChatOpen])

  useEffect(() => {
    setCatalogQuantities((current) => {
      const next: Record<string, number> = { ...current }
      for (const coffee of catalog) {
        if (!Number.isFinite(next[coffee.id]) || next[coffee.id] <= 0) {
          next[coffee.id] = 1
        }
      }
      return next
    })
  }, [catalog])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    setIsCatalogLoading(true)
    apiRequest<{ products: unknown[] }>(`/products?limit=200`, { method: 'GET', signal }, null)
      .then((result) => {
        const list = Array.isArray(result.products) ? result.products : []
        const mapped = list
          .map((raw) => raw as Record<string, unknown>)
          .map((p) => {
            const id = String(p.id || p.slug || '').trim()
            const name = String(p.name || '').trim()
            if (!id || !name) {
              return null
            }

            const process = String(p.process || '').trim() || '—'
            const region = String(p.region || '').trim() || '—'
            const altitude = String(p.altitude || '').trim() || '—'
            const pricePerKg = Number(p.pricePerKg ?? p.price ?? 0)
            const story = String(p.story || p.description || '').trim()
            const imageUrl = String(p.imageUrl || '').trim()
            const flavorNotes = Array.isArray(p.flavorNotes)
              ? (p.flavorNotes as unknown[]).map((n) => String(n)).filter(Boolean)
              : []

            return {
              id,
              name,
              process,
              region,
              flavorNotes,
              altitude,
              pricePerKg: Number.isFinite(pricePerKg) ? pricePerKg : 0,
              story,
              imageSrc: imageUrl || coffeeImageFallbackSrc,
              imageAlt: `${name} coffee`,
            } satisfies Coffee
          })
          .filter(Boolean) as Coffee[]

        if (mapped.length) {
          setCatalog(mapped)
        }
      })
      .catch(() => {
        // Keep the bundled fallback catalog if the API is unavailable.
      })
      .finally(() => {
        if (!signal.aborted) {
          setIsCatalogLoading(false)
        }
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    setBlendRows((rows) => {
      if (!catalog.length) {
        return rows
      }
      const catalogIds = new Set(catalog.map((c) => c.id))
      const nextRows = rows.map((row, index) => {
        if (catalogIds.has(row.coffeeId)) {
          return row
        }
        const fallbackId = catalog[index % catalog.length]?.id || catalog[0].id
        return { ...row, coffeeId: fallbackId }
      })
      return nextRows
    })
  }, [catalog])

  const [pendingCartDraft, setPendingCartDraft] = useState<PendingCartDraft | null>(null)
  const [isRoastPromptOpen, setIsRoastPromptOpen] = useState(false)
  const [backgroundVideoIndex, setBackgroundVideoIndex] = useState(0)
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null)
  const cartSectionRef = useRef<HTMLElement | null>(null)
  const orderTimers = useRef<Record<string, { roasting?: number; fulfilled?: number }>>({})

  const primaryAdminEmail = adminSummary?.primaryAdminEmail

  useEffect(() => {
    const video = backgroundVideoRef.current
    if (!video) {
      return
    }

    try {
      video.load()
      const playResult = video.play()
      if (playResult && typeof (playResult as Promise<void>).catch === 'function') {
        ;(playResult as Promise<void>).catch(() => {
          // Autoplay can be blocked; ignore.
        })
      }
    } catch {
      // Ignore if the browser blocks autoplay or video isn't ready.
    }
  }, [backgroundVideoIndex])

  const handleBackgroundVideoEnded = () => {
    if (backgroundVideos.length <= 1) {
      return
    }
    setBackgroundVideoIndex((index) => (index + 1) % backgroundVideos.length)
  }

  const totalPercent = useMemo(
    () => blendRows.reduce((sum, row) => sum + Number(row.percent || 0), 0),
    [blendRows],
  )

  const remainingPercent = useMemo(() => 100 - totalPercent, [totalPercent])

  const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price, 0), [cartItems])

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    [],
  )

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        day: 'numeric',
      }),
    [],
  )

  const estimatedPrice = useMemo(() => {
    const pricePerKg = blendRows.reduce((sum, row) => {
      const coffee = catalog.find((item) => item.id === row.coffeeId)
      if (!coffee) {
        return sum
      }
      const weightKg = customTotalKg * (Number(row.percent || 0) / 100)
      return sum + coffee.pricePerKg * weightKg
    }, 0)
    return pricePerKg
  }, [blendRows, catalog, customTotalKg])

  const bagQuantity = useMemo(() => computeBagQuantity(customTotalKg, bagSize), [bagSize, customTotalKg])

  useEffect(() => {
    if (!highlightBlend) {
      return
    }
    const timeout = window.setTimeout(() => setHighlightBlend(false), 1600)
    return () => window.clearTimeout(timeout)
  }, [highlightBlend])

  useEffect(() => {
    if (!cartPulse) {
      return
    }
    const timeout = window.setTimeout(() => setCartPulse(false), 900)
    return () => window.clearTimeout(timeout)
  }, [cartPulse])

  useEffect(() => {
    if (!blendNotice) {
      return
    }
    const timeout = window.setTimeout(() => setBlendNotice(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [blendNotice])

  useEffect(() => {
    if (!toastNotice) {
      return
    }
    const timeout = window.setTimeout(() => setToastNotice(null), 3200)
    return () => window.clearTimeout(timeout)
  }, [toastNotice])

  const showToast = (tone: ToastNotice['tone'], message: string, action?: ToastNotice['action']) => {
    setToastNotice({ tone, message, action })
  }

  const handleToastAction = (action: NonNullable<ToastNotice['action']>) => {
    setToastNotice(null)
    navigate(action.to)
    if (action.to === '/orders') {
      window.setTimeout(() => {
        cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }

  useEffect(() => {
    const storedToken = getStoredToken()
    if (!storedToken) {
      setAuthReady(true)
      setIsBootLoading(false)
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    setIsOrdersLoading(true)
    apiRequest<{ user: AccountProfile }>('/auth/me', { method: 'GET', signal }, storedToken)
      .then((result) => {
        setCurrentUser(result.user)
        window.localStorage.setItem(SESSION_STORAGE_KEY, result.user.email)
        return apiRequest<{ orders: OrderRecord[] }>(
          '/orders/my',
          { method: 'GET', signal },
          storedToken,
        )
      })
      .then((result) => {
        setOrders(result.orders)
      })
      .catch((error: unknown) => {
        if (signal.aborted) {
          return
        }

        const maybeError = error as ApiError
        const status = maybeError?.status
        const message = maybeError instanceof Error ? maybeError.message : String(error)

        // Only clear the token when the server confirms it's invalid/expired.
        if (status === 401 || status === 403) {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY)
          window.localStorage.removeItem(SESSION_STORAGE_KEY)
          setCurrentUser(null)
          setOrders([])
          setIsOrdersLoading(false)
          return
        }

        // Network/server hiccup: keep token so a later refresh can recover.
        console.warn('Session restore failed (keeping token):', message)
        setCurrentUser(null)
        setOrders([])
      })
      .finally(() => {
        if (!signal.aborted) {
          setAuthReady(true)
          setIsBootLoading(false)
          setIsOrdersLoading(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    // Load/save cart per user.
    if (!currentUser) {
      setIsCartHydrating(false)
      setCartItems([])
      return
    }
    setIsCartHydrating(true)
    setCartItems(loadCartForEmail(currentUser.email))
    setIsCartHydrating(false)
  }, [currentUser?.email])

  useEffect(() => {
    if (!currentUser) {
      return
    }
    saveCartForEmail(currentUser.email, cartItems)
  }, [cartItems, currentUser])

  useEffect(() => {
    if (!authNotice) {
      return
    }
    const timeout = window.setTimeout(() => setAuthNotice(''), 2800)
    return () => window.clearTimeout(timeout)
  }, [authNotice])

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, currentUser.email)
      const token = getStoredToken()
      if (token) {
        setIsOrdersLoading(true)
        apiRequest<{ orders: OrderRecord[] }>('/orders/my', { method: 'GET' }, token)
          .then((result) => setOrders(result.orders))
          .catch(() => setOrders([]))
          .finally(() => setIsOrdersLoading(false))

        if (currentUser.role === 'admin') {
          setIsAdminLoading(true)
          apiRequest<AdminSummary>('/admin/users', { method: 'GET' }, token)
            .then((result) => setAdminSummary(result))
            .catch(() => setAdminSummary(null))
            .finally(() => setIsAdminLoading(false))
        } else {
          setIsAdminLoading(false)
          setAdminSummary(null)
        }
      }
    } else {
      setIsOrdersLoading(false)
      setIsAdminLoading(false)
      setOrders([])
      setAdminSummary(null)
    }
  }, [currentUser])

  useEffect(() => {
    return () => {
      Object.values(orderTimers.current).forEach((timers) => {
        if (timers.roasting) {
          window.clearTimeout(timers.roasting)
        }
        if (timers.fulfilled) {
          window.clearTimeout(timers.fulfilled)
        }
      })
    }
  }, [])

  const handleBlendChange = (id: string, updates: Partial<BlendRow>) => {
    setBlendRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...updates } : row)),
    )
  }

  const addBlendRow = () => {
    setBlendRows((rows) => [
      ...rows,
      {
        id: `row-${rows.length + 1}`,
        coffeeId: catalog[rows.length % catalog.length]?.id ?? initialCoffeeCatalog[0].id,
        percent: 0,
      },
    ])
  }

  const removeBlendRow = (id: string) => {
    setBlendRows((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows))
  }

  const openAuthModal = (mode: 'login' | 'signup', message?: string) => {
    setIsAuthSubmitting(false)
    setAuthMode(mode)
    setAuthForm({ name: '', email: '', password: '' })
    setAuthNotice(message ?? '')
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    if (isAuthSubmitting) {
      return
    }
    setIsAuthModalOpen(false)
    setAuthNotice('')
  }

  const handleAuthInputChange = (field: 'name' | 'email' | 'password', value: string) => {
    setAuthForm((form) => ({ ...form, [field]: value }))
  }

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isAuthSubmitting) {
      return
    }

    const trimmedEmail = normaliseEmail(authForm.email)
    const trimmedName = authForm.name.trim()
    const password = authForm.password.trim()

    if (!trimmedEmail || !password) {
      setAuthNotice('Enter both email and password to continue.')
      return
    }

    if (authMode === 'signup' && !trimmedName) {
      setAuthNotice('Add your name so we can personalize your experience.')
      return
    }
    if (authMode === 'signup' && password.length < 6) {
      setAuthNotice('Choose a password with at least 6 characters.')
      return
    }

    const path = authMode === 'signup' ? '/auth/signup' : '/auth/login'
    const payload =
      authMode === 'signup'
        ? { name: trimmedName, email: trimmedEmail, password }
        : { email: trimmedEmail, password }

    setIsAuthSubmitting(true)

    apiRequest<{ user: AccountProfile; token: string }>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      null,
    )
      .then(async (result) => {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, result.token)
        window.localStorage.setItem(SESSION_STORAGE_KEY, result.user.email)
        setCurrentUser(result.user)
        setIsOrdersLoading(true)
        const ordersResult = await apiRequest<{ orders: OrderRecord[] }>(
          '/orders/my',
          { method: 'GET' },
          result.token,
        )
        setOrders(ordersResult.orders)
        setAuthNotice(authMode === 'signup' ? 'Account created. You are signed in!' : 'Welcome back!')
        showToast('positive', authMode === 'signup' ? 'Account created.' : 'Logged in.')
        window.setTimeout(() => {
          closeAuthModal()
        }, 480)
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
        setAuthNotice(message)
        showToast('warning', message)
      })
      .finally(() => {
        setIsAuthSubmitting(false)
        setIsOrdersLoading(false)
        setAuthForm({ name: '', email: '', password: '' })
      })
  }

  const handleSignOut = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    setCurrentUser(null)
    setAuthForm({ name: '', email: '', password: '' })
    setAuthNotice('')
    setIsAuthModalOpen(false)
    showToast('positive', 'Signed out.')
  }

  const handleQuickAdd = (coffeeId: string, selectedBagSize: number) => {
    if (isRoastPromptOpen) {
      return
    }
    if (!currentUser) {
      openAuthModal('signup', 'Create an account or log in to add coffees straight to your cart.')
      return
    }

    const coffee = catalog.find((item) => item.id === coffeeId)
    const timestamp = Date.now()
    const blend: CartBlend[] = [
      {
        coffeeId,
        name: coffee?.name ?? 'Selected lot',
        weight: Number(selectedBagSize.toFixed(2)),
      },
    ]
    const basePrice = (coffee?.pricePerKg ?? 0) * selectedBagSize

    setPendingCartDraft({
      id: `cart-${timestamp}`,
      createdAt: timestamp,
      blend,
      basePrice: Number(basePrice.toFixed(2)),
      bagSize: selectedBagSize,
      quantity: 1,
      source: 'catalog',
    })
    setIsRoastPromptOpen(true)
    setBlendNotice({
      tone: 'positive',
      message: `Choose how we should prepare ${coffee?.name ?? 'this coffee'} (${formatKg(selectedBagSize)}) before it joins your cart.`,
    })
  }

  const navigateToBlendLab = () => {
    setHighlightBlend(true)
    navigate('/coffee')
    window.setTimeout(() => {
      document.getElementById('custom-order')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  // Order statuses are computed + persisted server-side.

  const handleAddToCart = () => {
    if (isRoastPromptOpen) {
      return
    }
    if (!currentUser) {
      openAuthModal('signup', 'Create an account or log in to save blends to your cart.')
      return
    }
    if (totalPercent === 0) {
      setHighlightBlend(true)
      setBlendNotice({ tone: 'warning', message: 'Start by allocating percentages to your bag.' })
      return
    }

    if (remainingPercent > 0.01) {
      setHighlightBlend(true)
      setBlendNotice({ tone: 'warning', message: 'Allocate 100% of the blend before continuing.' })
      return
    }

    if (remainingPercent < -0.01) {
      setHighlightBlend(true)
      setBlendNotice({ tone: 'warning', message: 'Reduce percentages so the blend totals 100%.' })
      return
    }

    if (!Number.isFinite(customTotalKg) || customTotalKg <= 0) {
      setHighlightBlend(true)
      setBlendNotice({ tone: 'warning', message: 'Choose how many kilograms you want to order.' })
      return
    }

    if (!bagQuantity.isExact || bagQuantity.exactCount <= 0) {
      setHighlightBlend(true)
      setBlendNotice({
        tone: 'warning',
        message: `The math won’t add up for ${formatKg(customTotalKg)} using ${formatKg(bagSize)} bags. Try ${formatKg(bagQuantity.nearestDownKg)} or ${formatKg(bagQuantity.nearestUpKg)}.`,
      })
      return
    }

    const timestamp = Date.now()
    const blend: CartBlend[] = blendRows
      .filter((row) => row.percent > 0)
      .map((row) => {
        const coffee = catalog.find((item) => item.id === row.coffeeId)
        const weightKg = bagSize * (Number(row.percent || 0) / 100)
        return {
          coffeeId: row.coffeeId,
          name: coffee?.name ?? 'Selected lot',
          weight: Number(weightKg.toFixed(2)),
        }
      })

    if (!blend.length) {
      setBlendNotice({ tone: 'warning', message: 'Allocate percentages before adding your blend.' })
      return
    }

    const basePrice = blend.reduce((sum, entry) => {
      const coffee = catalog.find((item) => item.id === entry.coffeeId)
      if (!coffee) {
        return sum
      }
      return sum + coffee.pricePerKg * entry.weight
    }, 0)

    setPendingCartDraft({
      id: `cart-${timestamp}`,
      createdAt: timestamp,
      blend,
      basePrice: Number(basePrice.toFixed(2)),
      bagSize,
      quantity: bagQuantity.exactCount,
      source: 'custom',
    })

    setIsRoastPromptOpen(true)
    setBlendNotice({
      tone: 'positive',
      message: `${formatKg(customTotalKg)} = ${bagQuantity.exactCount} × ${formatKg(bagSize)} bags. Choose how you want them prepared.`,
    })
  }

  const finalizeCartWithRoast = (roastId: string) => {
    if (!pendingCartDraft) {
      return
    }

    const profile = roastProfiles.find((item) => item.id === roastId)
    const unitPrice = pendingCartDraft.basePrice + (profile?.extraCostPerKg ?? 0) * pendingCartDraft.bagSize
    const quantity = Math.max(1, Math.trunc(pendingCartDraft.quantity || 1))
    const itemsToAdd: CartItem[] = Array.from({ length: quantity }, (_, index) => ({
      id: `${pendingCartDraft.id}-${index + 1}`,
      createdAt: pendingCartDraft.createdAt + index,
      roastId,
      roastLabel: profile?.label ?? 'Selected roast',
      bagSize: pendingCartDraft.bagSize,
      blend: pendingCartDraft.blend,
      price: Number(unitPrice.toFixed(2)),
    }))

    setCartItems((items) => [...itemsToAdd, ...items])
    setPendingCartDraft(null)
    setIsRoastPromptOpen(false)
    setBlendNotice({ tone: 'positive', message: 'Added to cart — keep browsing or add another.' })
    showToast('positive', 'Added to cart.', { label: 'View cart', to: '/orders' })
    setCartPulse(true)
  }

  const cancelRoastSelection = () => {
    setPendingCartDraft(null)
    setIsRoastPromptOpen(false)
    setBlendNotice({ tone: 'warning', message: 'Roast selection cancelled. Blend not added.' })
    showToast('warning', 'Cancelled — not added to cart.')
  }

  const handleRemoveCartItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
    showToast('positive', 'Removed from cart.')
  }

  const handleCheckout = () => {
    if (!cartItems.length) {
      setBlendNotice({ tone: 'warning', message: 'Your cart is empty. Add a blend first.' })
      return
    }
    if (!currentUser) {
      openAuthModal('login', 'Log in to send your cart to the roastery queue.')
      return
    }

    const token = getStoredToken()
    if (!token) {
      openAuthModal('login', 'Log in to send your cart to the roastery queue.')
      return
    }

    apiRequest<{ orders: OrderRecord[] }>(
      '/orders/checkout',
      {
        method: 'POST',
        body: JSON.stringify({ cartItems }),
      },
      token,
    )
      .then((result) => {
        setOrders((existing) => [...result.orders, ...existing])
        setCartItems([])
        setBlendNotice({ tone: 'positive', message: 'Thanks! Your blends are queued for roasting.' })
        showToast('positive', 'Order placed. Roastery queue started.')
        cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Checkout failed. Please try again.'
        setBlendNotice({ tone: 'warning', message })
        showToast('warning', message)
      })
  }

  const renderTopNav = () => (
    <div className="top-nav">
      <Link className="top-nav__brand" to="/">
        {companyName}
      </Link>
      <button
        type="button"
        className="top-nav__toggle"
        aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileNavOpen}
        aria-controls="top-nav-menu"
        onClick={() => setIsMobileNavOpen((open) => !open)}
      >
        <span className="top-nav__toggleBars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <div className="top-nav__actions">
        <div
          id="top-nav-menu"
          className={`top-nav__menu ${isMobileNavOpen ? 'top-nav__menu--open' : ''}`}
        >
          <Link className="top-nav__cart" to="/coffee" onClick={() => setIsMobileNavOpen(false)}>
          Coffees
          </Link>
          {currentUser?.role === 'admin' ? (
            <Link className="top-nav__cart" to="/admin" onClick={() => setIsMobileNavOpen(false)}>
              Admin
            </Link>
          ) : null}
          {currentUser ? (
            <div className="top-nav__user">
              <span>
                Hi, {currentUser.name.split(' ')[0] || currentUser.name}
                {currentUser.role === 'admin' ? ' (Admin)' : ''}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false)
                  handleSignOut()
                }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="top-nav__user">
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false)
                  openAuthModal('login')
                }}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false)
                  openAuthModal('signup')
                }}
              >
                Create account
              </button>
            </div>
          )}
          <Link className="top-nav__cart" to="/orders" onClick={() => setIsMobileNavOpen(false)}>
          Cart ({cartItems.length})
          </Link>
        </div>
      </div>
    </div>
  )

  const renderSiteHeader = () => (
    <header className="site-header">
      {renderTopNav()}
    </header>
  )

  const renderSiteFooter = () => (
    <footer className="footer site-footer">
      <p>
        © {new Date().getFullYear()} {companyName} · Crafted in Ethiopia · Powered by traceable supply.
      </p>
    </footer>
  )

  const handleSendChat = async () => {
    const text = chatInput.trim()
    if (!text || isChatSending) return

    const nextMessages: ChatMessage[] = [...chatMessages, { role: 'user', content: text }]
    setChatMessages(nextMessages)
    setChatInput('')
    setIsChatSending(true)

    try {
      const result = await apiRequest<{ reply: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      })

      setChatMessages((existing) => [...existing, { role: 'assistant', content: result.reply }])
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : 'Chat failed. Please try again.'
      const status = (error as ApiError | null)?.status
      const message =
        raw === 'Failed to fetch'
          ? 'Chat service is unreachable. Start the API with npm run dev:api (or npm run dev:all), then refresh.'
          : status === 429
            ? 'OpenAI is rejecting requests due to quota/billing. Enable billing (or add credits) for your OpenAI project, then try again.'
            : status === 401
              ? 'The server OpenAI key is invalid. Re-check OPENAI_API_KEY in your server environment and restart the API.'
              : raw
      setChatMessages((existing) => [
        ...existing,
        {
          role: 'assistant',
          content: `Sorry — I couldn’t reach the chat service. ${message}`,
        },
      ])
    } finally {
      setIsChatSending(false)
      requestAnimationFrame(() => chatInputRef.current?.focus())
    }
  }

  const renderChatbot = () => (
    <div className={`chatbot ${isChatOpen ? 'chatbot--open' : ''}`}>
      <button
        type="button"
        className="chatbot__fab"
        onClick={() => setIsChatOpen((open) => !open)}
        aria-expanded={isChatOpen}
        aria-controls="chatbot-panel"
      >
        {isChatOpen ? 'Close chat' : 'Chat'}
      </button>
      {isChatOpen ? (
        <div className="chatbot__panel" id="chatbot-panel" role="dialog" aria-label="Chat with Abyssinia Beans">
          <div className="chatbot__header">
            <div className="chatbot__title">Abyssinia Beans chat</div>
            <button type="button" className="chatbot__close" onClick={() => setIsChatOpen(false)}>
              Close
            </button>
          </div>
          <div className="chatbot__messages" ref={chatScrollRef}>
            {chatMessages.map((m, idx) => (
              <div
                key={`${m.role}-${idx}`}
                className={`chatbot__message chatbot__message--${m.role}`}
              >
                <div className="chatbot__bubble">{m.content}</div>
              </div>
            ))}
            {isChatSending ? (
              <div className="chatbot__message chatbot__message--assistant">
                <div className="chatbot__bubble">Typing…</div>
              </div>
            ) : null}
          </div>
          <form
            className="chatbot__composer"
            onSubmit={(e) => {
              e.preventDefault()
              void handleSendChat()
            }}
          >
            <input
              ref={chatInputRef}
              className="chatbot__input"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about coffees, blends, roast & grind…"
              aria-label="Message"
            />
            <button className="chatbot__send" type="submit" disabled={!chatInput.trim() || isChatSending}>
              Send
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )

  return (
    <>
      {showBackgroundVideo ? (
        <div className="bg-video" aria-hidden="true">
          <video
            className="bg-video__media"
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={handleBackgroundVideoEnded}
            ref={backgroundVideoRef}
          >
            <source
              src={backgroundVideos[backgroundVideoIndex] ?? backgroundVideos[0]}
              type="video/mp4"
            />
          </video>
        </div>
      ) : null}
      <div className={pageClassName}>
        {renderSiteHeader()}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <header className="hero">
                  <div className="hero__badge">From farm to cup</div>
                  <h1 className="hero__title">Abyssinia coffee</h1>
                  <p className="hero__subtitle">
                    Discover what makes Ethiopian coffee unique—from careful cherry selection to roast profiles
                    tuned for sweetness and clarity. We work with premium lots, strict sorting, and small-batch
                    roasting standards so every bag tastes clean, vibrant, and consistent.
                    <br />
                    <br />
                    Head to the coffees page to browse micro-lots, build a custom blend by percentage, and choose it
                    as-is, roasted, or roasted & ground.
                  </p>
                  <div className="hero__actions">
                    <Link className="hero__cta" to="/coffee">
                      Browse coffees
                    </Link>
                    <Link className="hero__ghost" to="/coffee">
                      Place a custom order
                    </Link>
                    <Link className="hero__ghost hero__ghost--minimal" to="/orders">
                      Review cart
                    </Link>
                  </div>
                </header>

                <section className="section section--alt">
                  <div className="section__header">
                    <h2>Types of coffee available</h2>
                    <p>
                      Browse our Ethiopian lineup featuring Yirgacheffe, Sidamo, Guji, Harrar, Limu, Bench Maji,
                      and Kaffa. You'll find lots prepared as Washed, Natural, and traditional Forest Coffee—each
                      highlighting a different balance of florals, fruit, and sweetness.
                    </p>
                  </div>
                  <div className="details-grid">
                    <div className="details-card">
                      <h3>Natural</h3>
                      <p>Whole cherries dried for ripe fruit sweetness and a round, fuller body.</p>
                    </div>
                    <div className="details-card">
                      <h3>Washed</h3>
                      <p>Clean fermentation and rinsing for crisp florals, citrus lift, and tea-like clarity.</p>
                    </div>
                    <div className="details-card">
                      <h3>Forest coffee</h3>
                      <p>Traditionally collected from forest systems for a distinctive, heritage-driven profile.</p>
                    </div>
                    <div className="details-card">
                      <h3>Single origins</h3>
                      <p>Compare regions side-by-side: Yirgacheffe, Sidamo, Guji, Harrar, Limu, Bench Maji, and Kaffa.</p>
                    </div>
                  </div>
                </section>

                <section className="section">
                  <div className="section__header">
                    <h2>How it’s collected, roasted, and grounded</h2>
                    <p>Three steps, handled with care from farm to cup.</p>
                  </div>
                  <div className="details-grid">
                    <div className="details-card">
                      <h3>Collected</h3>
                      <p>
                        Our lots come from smallholders and washing stations across Ethiopia. Cherries are
                        handpicked at peak ripeness, floated and sorted, then processed the same day to preserve
                        sweetness, florals, and clean acidity.
                      </p>
                    </div>
                    <div className="details-card">
                      <h3>Roasted</h3>
                      <p>
                        We roast to order and cool quickly to lock in aromatics. Every batch is handled with care—
                        consistent charge temperatures, tracked development, and fast cooling—so the cup stays sweet
                        and expressive.
                        <br />
                        <br />
                        Profiles are adjusted for espresso or filter so you get balanced sweetness, sparkling acidity,
                        and a finish that stays clean.
                      </p>
                    </div>
                    <div className="details-card">
                      <h3>Grounded</h3>
                      <p>
                        Choose whole bean or roasted & ground. If you pick ground, we match it to your brew method
                        (espresso, pour-over, French press) so extraction stays even and the cup stays sweet.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="section section--alt">
                  <div className="section__header">
                    <h2>Fulfilment & future roadmap</h2>
                    <p>
                      We roast twice weekly from Addis Ababa, ship globally with cold-chain partners, and store
                      every blend profile for your next order.
                    </p>
                  </div>
                  <div className="details-grid">
                    <div className="details-card">
                      <h3>Dispatch cadence</h3>
                      <p>Mondays & Thursdays. Place custom blends 24 hours before to guarantee roast slots.</p>
                    </div>
                    <div className="details-card">
                      <h3>Upcoming mobile app</h3>
                      <p>
                        Mobile ordering launches next. Expect brew logging, subscription management, and push
                        alerts when micro-lots drop.
                      </p>
                    </div>
                    <div className="details-card">
                      <h3>Wholesale support</h3>
                      <p>
                        Dedicated account specialists, brew recipes, and telemetry exports for each roast
                        profile.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            }
          />

          <Route
            path="/coffee"
            element={
              <>
                <section className="section" id="catalog">
                  <div className="catalog">
                    {catalog.map((coffee) => (
                      <article className="coffee-card" key={coffee.id}>
                        <div className="coffee-card__image" aria-hidden="true">
                          <img
                            src={`/coffees/${coffee.id}.jpg`}
                            alt={coffee.name}
                            loading="lazy"
                            onError={handleCoffeeImageError}
                          />
                        </div>
                        <div className="coffee-card__meta">
                          <span className="coffee-card__process">{coffee.process}</span>
                          <span className="coffee-card__region">{coffee.region}</span>
                        </div>
                        <h3 className="coffee-card__title">{coffee.name}</h3>
                        <p className="coffee-card__story">{coffee.story}</p>
                        <ul className="coffee-card__notes">
                          {coffee.flavorNotes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                        <div className="coffee-card__footer">
                          <div>
                            <span className="coffee-card__altitude">{coffee.altitude}</span>
                            <span className="coffee-card__price">{formatCurrency(coffee.pricePerKg)} / kg</span>
                          </div>
                          <div className="coffee-card__buy">
                            <label className="coffee-card__qty" htmlFor={`qty-${coffee.id}`}>
                              <span>Quantity</span>
                              <select
                                id={`qty-${coffee.id}`}
                                value={catalogQuantities[coffee.id] ?? 1}
                                onChange={(event) =>
                                  setCatalogQuantities((current) => ({
                                    ...current,
                                    [coffee.id]: Number.parseFloat(event.target.value) || 1,
                                  }))
                                }
                              >
                                {bagSizeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <button
                              className="coffee-card__action"
                              type="button"
                              onClick={() => handleQuickAdd(coffee.id, catalogQuantities[coffee.id] ?? 1)}
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  {isCatalogLoading ? (
                    <p className="section__hint">Loading products from the database…</p>
                  ) : null}
                </section>

                <section className="section" id="custom-order" ref={blendSectionRef}>
                  <div className="section__header">
                    <h2>Custom order</h2>
                    <p>Build your order by percentage, choose total kilograms and a bag size, and we’ll tell you how many bags that makes.</p>
                  </div>
                  <div className={`blend-card ${highlightBlend ? 'blend-card--pulse' : ''}`}>
                    <div className="blend-card__row">
                      <label>Order size</label>
                      <div className="blend-row__field">
                        <label htmlFor="customTotalKg">Total (kg)</label>
                        <input
                          id="customTotalKg"
                          type="number"
                          min={0.25}
                          step={0.25}
                          value={Number.isFinite(customTotalKg) ? customTotalKg : 1}
                          onChange={(event) => {
                            const next = Number.parseFloat(event.target.value)
                            setCustomTotalKg(Number.isFinite(next) && next > 0 ? next : 1)
                          }}
                          inputMode="decimal"
                        />
                      </div>
                      <div className="blend-row__field">
                        <label htmlFor="customBagSize">Bag size</label>
                        <select
                          id="customBagSize"
                          value={Number.isFinite(bagSize) ? bagSize : 1}
                          onChange={(event) => {
                            const next = Number.parseFloat(event.target.value)
                            setBagSize(Number.isFinite(next) && next > 0 ? next : 1)
                          }}
                        >
                          {bagSizeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {bagQuantity.isExact ? (
                        <div className="blend-card__notice">
                          {formatKg(customTotalKg)} = {bagQuantity.exactCount} × {formatKg(bagSize)} bags
                        </div>
                      ) : (
                        <div className="blend-card__notice blend-card__notice--warning">
                          The math won’t add up. Try {formatKg(bagQuantity.nearestDownKg)} or {formatKg(bagQuantity.nearestUpKg)}.
                        </div>
                      )}
                    </div>

                    <div className="blend-grid">
                      {blendRows.map((row) => (
                        <div className="blend-row" key={row.id}>
                          <div className="blend-row__field">
                            <label htmlFor={`coffee-${row.id}`}>Coffee</label>
                            <select
                              id={`coffee-${row.id}`}
                              value={row.coffeeId}
                              onChange={(event) => handleBlendChange(row.id, { coffeeId: event.target.value })}
                            >
                              {catalog.map((coffee) => (
                                <option key={coffee.id} value={coffee.id}>
                                  {coffee.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="blend-row__field">
                            <label htmlFor={`percent-${row.id}`}>Percent (%)</label>
                            <input
                              id={`percent-${row.id}`}
                              type="number"
                              min={0}
                              max={100}
                              step={1}
                              value={row.percent}
                              onChange={(event) =>
                                handleBlendChange(row.id, {
                                  percent: Number.parseFloat(event.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <button className="blend-row__remove" type="button" onClick={() => removeBlendRow(row.id)}>
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="blend-card__cta">
                      <div className="blend-card__actions">
                        <button className="blend-card__add" type="button" onClick={addBlendRow}>
                          Add another coffee
                        </button>
                        <button
                          className="blend-card__primary"
                          type="button"
                          onClick={handleAddToCart}
                          disabled={isRoastPromptOpen}
                        >
                          Finish custom order
                        </button>
                      </div>
                      <div className="blend-card__summary">
                        <span>Bag size: {formatKg(bagSize)}</span>
                        <span>Total order: {formatKg(customTotalKg)}</span>
                        <span>Total: {totalPercent.toFixed(0)}%</span>
                        <span>
                          {remainingPercent >= 0
                            ? `Remaining: ${remainingPercent.toFixed(0)}%`
                            : `Over by ${Math.abs(remainingPercent).toFixed(0)}%`}
                        </span>
                        <span>Estimated base: {formatCurrency(estimatedPrice)}</span>
                        <span>Preparation: choose after finishing</span>
                      </div>
                    </div>
                    {blendNotice ? (
                      <div className={`blend-card__notice blend-card__notice--${blendNotice.tone}`}>
                        {blendNotice.message}
                      </div>
                    ) : null}
                  </div>
                </section>

              </>
            }
          />

          <Route
            path="/orders"
            element={
              <>
                <div className="orders-header">
                  <div className="orders-header__intro">
                    <div className="hero__badge">Cart & orders</div>
                    <h1 className="hero__title">Cart and order history</h1>
                    <p className="hero__subtitle">
                      Review staged blends, send them to the roastery queue, and follow each batch to fulfilment.
                    </p>
                    <div className="orders-header__actions">
                        <Link className="hero__cta" to="/coffee">
                          Back to coffees
                        </Link>
                      <button className="hero__ghost" type="button" onClick={navigateToBlendLab}>
                        Custom order
                      </button>
                    </div>
                  </div>
                </div>

                <section className="section" id="cart" ref={cartSectionRef}>
                  <div className="section__header">
                    <h2>Cart</h2>
                    <p>Stage your custom bags before sending them to the roastery queue.</p>
                  </div>
                  <div className={`cart-panel ${cartPulse ? 'cart-panel--pulse' : ''}`}>
                    {isCartHydrating ? (
                      <div className="cart-empty">Loading your cart…</div>
                    ) : cartItems.length === 0 ? (
                      <div className="cart-empty">Your cart is empty. Head back to coffees to build a blend.</div>
                    ) : (
                      <div className="cart-grid">
                        {cartItems.map((item) => (
                          <article className="cart-item" key={item.id}>
                            <div className="cart-item__header">
                              <span className="cart-item__timestamp">
                                {dateFormatter.format(item.createdAt)} · {timeFormatter.format(item.createdAt)}
                              </span>
                              <span className="cart-item__meta">{formatKg(item.bagSize)} · {item.roastLabel}</span>
                            </div>
                            <ul className="cart-item__blend">
                              {item.blend.map((part) => (
                                <li key={`${item.id}-${part.coffeeId}`}>
                                  <span>{part.name}</span>
                                  <span>{part.weight.toFixed(2)} kg</span>
                                </li>
                              ))}
                            </ul>
                            <div className="cart-item__footer">
                              <span className="cart-item__price">{formatCurrency(item.price)}</span>
                              <button type="button" onClick={() => handleRemoveCartItem(item.id)}>
                                Remove
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    <div className="cart-actions">
                      <div className="cart-actions__meta">
                        <span>{cartItems.length} bag{cartItems.length === 1 ? '' : 's'} in cart</span>
                        <span>Cart total: {formatCurrency(cartTotal)}</span>
                      </div>
                      <button
                        className="cart-actions__checkout"
                        type="button"
                        onClick={handleCheckout}
                        disabled={!cartItems.length}
                      >
                        Send to roastery
                      </button>
                    </div>
                  </div>
                </section>

                <section className="section" id="orders">
                  <div className="section__header">
                    <h2>Order history</h2>
                    <p>Follow every batch as it moves from queue to roastery to fulfilment.</p>
                  </div>
                  {!currentUser ? (
                    <div className="history-empty">Log in to see your order history.</div>
                  ) : isOrdersLoading ? (
                    <div className="history-empty">Loading your order history…</div>
                  ) : orders.length === 0 ? (
                    <div className="history-empty">No orders yet—checkout a cart to start your history.</div>
                  ) : (
                    <div className="history-grid">
                      {orders.map((order) => (
                        <article className="order-card" key={order._id}>
                          <div className="order-card__header">
                            <span className="order-card__reference">{order.reference}</span>
                            <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="order-card__meta">
                            <span>{formatKg(order.bagSize)} · {order.roastLabel}</span>
                            <span>
                              {dateFormatter.format(order.createdAt)} · {timeFormatter.format(order.createdAt)}
                            </span>
                          </div>
                          <ul className="order-card__blend">
                            {order.blend.map((part) => (
                              <li key={`${order._id}-${part.coffeeId}`}>
                                <span>{part.name}</span>
                                <span>{part.weight.toFixed(2)} kg</span>
                              </li>
                            ))}
                          </ul>
                          <div className="order-card__footer">
                            <span className="order-card__price">{formatCurrency(order.price)}</span>
                            {order.fulfilledAt ? (
                              <span className="order-card__fulfilled">
                                Fulfilled {timeFormatter.format(order.fulfilledAt)}
                              </span>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

              </>
            }
          />

          <Route
            path="/admin"
            element={
              !authReady ? (
                <>
                  <div className="orders-header">
                    <div className="orders-header__intro">
                      <div className="hero__badge">Admin</div>
                      <h1 className="hero__title">Admin dashboard</h1>
                      <p className="hero__subtitle">Loading your account…</p>
                    </div>
                  </div>
                  <div className="history-empty">Loading…</div>
                </>
              ) : !currentUser || currentUser.role !== 'admin' ? (
                <Navigate to="/" replace />
              ) : (
                <>
                  <div className="orders-header">
                    <div className="orders-header__intro">
                      <div className="hero__badge">Admin</div>
                      <h1 className="hero__title">Admin dashboard</h1>
                      <p className="hero__subtitle">
                        Track signups and customer spend.
                      </p>
                    </div>
                  </div>

                  <section className="section" id="admin">
                    <div className="section__header">
                      <h2>Overview</h2>
                      <p>
                        {(adminSummary?.totalSignups ?? 0)} total sign-up
                        {(adminSummary?.totalSignups ?? 0) === 1 ? '' : 's'} · Total spent:{' '}
                        {formatCurrency(adminSummary?.totalSpent ?? 0)}
                      </p>
                    </div>

                    <div className="cart-panel">
                      {(() => {
                        if (isAdminLoading) {
                          return <div className="history-empty">Loading users…</div>
                        }
                        if (!adminSummary || adminSummary.users.length === 0) {
                          return <div className="history-empty">No users yet.</div>
                        }
                        const primaryCanPromote =
                          primaryAdminEmail && normaliseEmail(currentUser.email) === normaliseEmail(primaryAdminEmail)

                        return (
                          <div className="history-grid">
                            {adminSummary.users
                              .slice()
                              .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
                              .map((user) => {
                                const email = normaliseEmail(user.email)
                                const role = user.role
                                const totalSpent = user.totalSpent ?? 0
                                const canPromote =
                                  Boolean(primaryCanPromote) && role !== 'admin' && email !== normaliseEmail(primaryAdminEmail || '')

                                return (
                                  <article className="order-card" key={email}>
                                    <div className="order-card__header">
                                      <span className="order-card__reference">{user.name}</span>
                                      <span className={`status-badge status-badge--${role === 'admin' ? 'fulfilled' : 'queued'}`}>
                                        {role === 'admin' ? 'Admin' : 'Member'}
                                      </span>
                                    </div>
                                    <div className="order-card__meta">
                                      <span>{email}</span>
                                      <span>
                                        Joined {dateFormatter.format(user.createdAt ?? Date.now())} ·{' '}
                                        {timeFormatter.format(user.createdAt ?? Date.now())}
                                      </span>
                                    </div>
                                    <div className="order-card__footer">
                                      <span className="order-card__price">Total spent: {formatCurrency(totalSpent)}</span>
                                      {canPromote ? (
                                        <button
                                          type="button"
                                          className="cart-actions__checkout"
                                          onClick={() => {
                                            const token = getStoredToken()
                                            if (!token) {
                                              setBlendNotice({ tone: 'warning', message: 'Log in again to manage admins.' })
                                              showToast('warning', 'Log in again to manage admins.')
                                              return
                                            }
                                            apiRequest<{ ok: true }>(
                                              '/admin/promote',
                                              { method: 'POST', body: JSON.stringify({ email }) },
                                              token,
                                            )
                                              .then(() => apiRequest<AdminSummary>('/admin/users', { method: 'GET' }, token))
                                              .then((result) => {
                                                setAdminSummary(result)
                                                setBlendNotice({ tone: 'positive', message: `${email} is now an admin.` })
                                                showToast('positive', `${email} is now an admin.`)
                                              })
                                              .catch((error: unknown) => {
                                                const message =
                                                  error instanceof Error ? error.message : 'Unable to promote user.'
                                                setBlendNotice({ tone: 'warning', message })
                                                showToast('warning', message)
                                              })
                                          }}
                                        >
                                          Make admin
                                        </button>
                                      ) : null}
                                    </div>
                                  </article>
                                )
                              })}
                          </div>
                        )
                      })()}
                    </div>
                  </section>
                </>
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {renderSiteFooter()}

        {isAuthModalOpen ? (
          <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
            <div className="auth-modal__backdrop" onClick={closeAuthModal} />
            <div
              className="auth-modal__panel"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="auth-modal__header">
                <h2 className="auth-modal__title" id="auth-modal-title">
                  {authMode === 'signup' ? 'Create your account' : 'Log in to continue'}
                </h2>
                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="auth-modal__close"
                  disabled={isAuthSubmitting}
                >
                  Close
                </button>
              </header>
              <p className="auth-modal__subtitle">
                {authMode === 'signup'
                  ? 'Save custom blends, track orders, and revisit your cart anytime.'
                  : 'Enter your details to revisit saved blends and order history.'}
              </p>
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' ? (
                  <label className="auth-form__field" htmlFor="auth-name">
                    Name
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={authForm.name}
                      onChange={(event) => handleAuthInputChange('name', event.target.value)}
                      disabled={isAuthSubmitting}
                      required
                    />
                  </label>
                ) : null}
                <label className="auth-form__field" htmlFor="auth-email">
                  Email
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={authForm.email}
                    onChange={(event) => handleAuthInputChange('email', event.target.value)}
                    disabled={isAuthSubmitting}
                    required
                  />
                </label>
                <label className="auth-form__field" htmlFor="auth-password">
                  Password
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                    value={authForm.password}
                    onChange={(event) => handleAuthInputChange('password', event.target.value)}
                    disabled={isAuthSubmitting}
                    required
                  />
                </label>
                {authNotice ? <div className="auth-form__notice">{authNotice}</div> : null}
                <button className="auth-form__submit" type="submit" disabled={isAuthSubmitting}>
                  {isAuthSubmitting ? (
                    <span className="auth-form__submitContent">
                      <span className="app-spinner" aria-hidden="true" />
                      {authMode === 'signup' ? 'Creating…' : 'Logging in…'}
                    </span>
                  ) : (
                    (authMode === 'signup' ? 'Create account' : 'Log in')
                  )}
                </button>
              </form>
              <p className="auth-form__switch">
                {authMode === 'signup' ? 'Already have an account?' : 'Need an account?'}{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal(authMode === 'signup' ? 'login' : 'signup')}
                  disabled={isAuthSubmitting}
                >
                  {authMode === 'signup' ? 'Log in instead' : 'Create one'}
                </button>
              </p>
            </div>
          </div>
        ) : null}

        {isBootLoading || isAuthSubmitting ? (
          <div className="app-loading" aria-live="polite" aria-busy="true">
            <div className="app-loading__panel">
              <div className="app-spinner" aria-hidden="true" />
              <div className="app-loading__text">
                {isAuthSubmitting ? 'Signing you in…' : 'Loading your account…'}
              </div>
            </div>
          </div>
        ) : null}

        {toastNotice ? (
          <div className="app-toast" aria-live="polite">
            <div className={`app-toast__panel app-toast__panel--${toastNotice.tone}`}>
              <span className="app-toast__message">{toastNotice.message}</span>
              <div className="app-toast__actions">
                {toastNotice.action ? (
                  <button
                    type="button"
                    className="app-toast__action"
                    onClick={() => handleToastAction(toastNotice.action!)}
                  >
                    {toastNotice.action.label}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="app-toast__close"
                  onClick={() => setToastNotice(null)}
                  aria-label="Dismiss message"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {renderChatbot()}
      </div>

      {pendingCartDraft && isRoastPromptOpen ? (
        <div className="prompt-overlay" role="dialog" aria-modal="true">
          <div className="prompt-card roast-prompt">
            <p className="roast-prompt__title">
              {pendingCartDraft.source === 'custom'
                ? 'How should we prepare this custom blend?'
                : 'How should we prepare this bag?'}
            </p>
            <div className="roast-prompt__options">
              {roastProfiles.map((profile) => {
                const unitPrice =
                  pendingCartDraft.basePrice + profile.extraCostPerKg * pendingCartDraft.bagSize
                const quantity = Math.max(1, Math.trunc(pendingCartDraft.quantity || 1))
                const price = unitPrice * quantity
                return (
                  <button
                    key={profile.id}
                    type="button"
                    className="roast-prompt__option"
                    onClick={() => finalizeCartWithRoast(profile.id)}
                  >
                    <span className="roast-prompt__label">{profile.label}</span>
                    <span className="roast-prompt__text">{profile.blurb}</span>
                    <span className="roast-prompt__price">{formatCurrency(price)}</span>
                  </button>
                )
              })}
            </div>
            <button className="roast-prompt__cancel" type="button" onClick={cancelRoastSelection}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

    </>
  )
}

export default App
