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

const coffeeCatalog: Coffee[] = [
  {
    id: 'bona-zuira-natural',
    name: 'Bona Zuira Natural',
    process: 'Natural',
    region: 'Bona Zuria, Sidama',
    flavorNotes: ['strawberry compote', 'cacao nib', 'bergamot'],
    altitude: '1,960 - 2,100 m',
    pricePerKg: 900,
    story:
      'Smallholder lots dried on raised beds, bursting with layered fruit sweetness and silky texture.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'ayele-tulu-washed',
    name: 'Ayele Tulu Washed',
    process: 'Washed',
    region: 'Bensa, Sidama',
    flavorNotes: ['nectarine', 'orange blossom', 'black tea'],
    altitude: '1,900 - 2,050 m',
    pricePerKg: 900,
    story:
      'Ayele’s micro-mill produces sparkling washed coffees with jasmine aromatics and crisp structure.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'demeka-becha',
    name: 'Demeka Becha',
    process: 'Honey',
    region: 'Demeka Becha, Sidama',
    flavorNotes: ['mango', 'honeycomb', 'lime zest'],
    altitude: '2,000 - 2,150 m',
    pricePerKg: 900,
    story:
      'Extended honey processing preserves tropical sweetness while keeping a vibrant, lime-toned finish.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'bochessa-maleko',
    name: 'Bochessa Maleko',
    process: 'Natural',
    region: 'Shantawene, Sidama',
    flavorNotes: ['blueberry', 'dark honey', 'vanilla'],
    altitude: '1,850 - 2,000 m',
    pricePerKg: 900,
    story:
      'Bochessa’s family lot leans into classic blueberry natural character with a plush, velvety body.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'gowacho-sidama',
    name: 'Gowacho Sidama',
    process: 'Washed',
    region: 'Gowacho, Sidama',
    flavorNotes: ['white peach', 'jasmine', 'lemongrass'],
    altitude: '1,920 - 2,050 m',
    pricePerKg: 900,
    story:
      'A shimmering washed profile with delicate florals and a ginger-lime sparkle on the finish.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'baba-t-anaerobic',
    name: 'Baba T Anaerobic',
    process: 'Anaerobic Natural',
    region: 'Bona Zuria, Sidama',
    flavorNotes: ['pineapple', 'dark chocolate', 'hibiscus'],
    altitude: '1,950 - 2,100 m',
    pricePerKg: 900,
    story:
      'Anaerobic fermentation drives fruit complexity while preserving a balanced, syrupy structure.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'bona-zuira-honey',
    name: 'Bona Zuira Honey',
    process: 'Honey',
    region: 'Bona Zuria, Sidama',
    flavorNotes: ['honeydew', 'florals', 'toffee'],
    altitude: '1,940 - 2,080 m',
    pricePerKg: 900,
    story:
      'A collaborative lot that marries honey processing sweetness with sparkling florals.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'berra-xaddicho-natural',
    name: 'Berra Xaddicho Natural',
    process: 'Natural',
    region: 'Arbegona, Sidama',
    flavorNotes: ['candied raspberry', 'milk chocolate', 'rose'],
    altitude: '2,000 - 2,150 m',
    pricePerKg: 900,
    story:
      'Slow-dried cherries deliver vivid berry tones with a creamy, confectionary sweetness.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'teshale-bona-qeqe',
    name: 'Teshale Bona QeQe',
    process: 'Natural',
    region: 'Bona Zuria, Sidama',
    flavorNotes: ['papaya', 'molasses', 'hibiscus'],
    altitude: '1,980 - 2,120 m',
    pricePerKg: 900,
    story:
      'Sweet spice and tropical layers complement a syrupy cup with excellent structure for espresso.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'shantawene-sidama',
    name: 'Shantawene Sidama',
    process: 'Honey',
    region: 'Shantawene, Sidama',
    flavorNotes: ['blood orange', 'blackberry', 'nougat'],
    altitude: '1,900 - 2,050 m',
    pricePerKg: 900,
    story:
      'Transported from forest canopy to raised beds, this honey lot balances citrus and cocoa.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'yirgachefe-aricha-washed',
    name: 'Yirgachefe Aricha Washed',
    process: 'Washed',
    region: 'Aricha, Yirgachefe',
    flavorNotes: ['lemon zest', 'honeysuckle', 'white tea'],
    altitude: '1,950 - 2,100 m',
    pricePerKg: 900,
    story:
      'Classic Yirgachefe florals with a lifted acidity and crystalline sweetness.',
    imageSrc: '/coffee-placeholder.svg',
    imageAlt: 'Coffee beans placeholder illustration',
  },
  {
    id: 'tsegab-limited-edition',
    name: 'Tsegab Limited Edition',
    process: 'Anaerobic Honey',
    region: 'Gedeb, Gedeo',
    flavorNotes: ['passionfruit', 'vanilla bean', 'champagne grape'],
    altitude: '2,000 - 2,120 m',
    pricePerKg: 900,
    story:
      'A micro-lot reserved for our seasonal release with shimmering acidity and velvety finish.',
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
    extraCostPerKg: 60,
  },
  {
    id: 'roasted-ground',
    label: 'Roasted & Ground',
    blurb: 'Freshly ground to your brew method moments before packing for maximum aromatics.',
    extraCostPerKg: 110,
  },
]

const bagSizeOptions = [
  { value: 0.5, label: '0.5 kg Taster' },
  { value: 1, label: '1 kg House Bag' },
  { value: 2, label: '2 kg Pro Roast' },
]

const companyName = 'Abyssinia Beans'

const ACCOUNT_STORAGE_KEY = 'abyssinia-account'
const SESSION_STORAGE_KEY = 'abyssinia-session'
const ADMIN_STORAGE_KEY = 'abyssinia-admin-email'

type BlendRow = {
  id: string
  coffeeId: string
  weight: number
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
  reference: string
  status: 'Queued' | 'Roasting' | 'Fulfilled'
  fulfilledAt?: number
}

type AccountProfile = {
  name: string
  email: string
  password: string
  createdAt: number
  role: 'admin' | 'member'
}

type BlendNotice = {
  tone: 'positive' | 'warning'
  message: string
}

type PendingCartDraft = {
  id: string
  createdAt: number
  blend: CartBlend[]
  basePrice: number
  bagSize: number
  source: 'catalog' | 'custom'
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
  }).format(value)

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const showBackgroundVideo = location.pathname === '/'
  const [bagSize, setBagSize] = useState<number>(1)
  const [blendRows, setBlendRows] = useState<BlendRow[]>([
    {
      id: 'row-1',
      coffeeId: coffeeCatalog[0].id,
      weight: 0.5,
    },
    {
      id: 'row-2',
      coffeeId: coffeeCatalog[1].id,
      weight: 0.5,
    },
  ])
  const [highlightBlend, setHighlightBlend] = useState(false)
  const blendSectionRef = useRef<HTMLElement | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [orderHistory, setOrderHistory] = useState<OrderRecord[]>([])
  const [cartPulse, setCartPulse] = useState(false)
  const [blendNotice, setBlendNotice] = useState<BlendNotice | null>(null)
  const [currentUser, setCurrentUser] = useState<AccountProfile | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authNotice, setAuthNotice] = useState<string>('')
  const [pendingCartDraft, setPendingCartDraft] = useState<PendingCartDraft | null>(null)
  const [isRoastPromptOpen, setIsRoastPromptOpen] = useState(false)
  const [backgroundVideoIndex, setBackgroundVideoIndex] = useState(0)
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null)
  const cartSectionRef = useRef<HTMLElement | null>(null)
  const orderTimers = useRef<Record<string, { roasting?: number; fulfilled?: number }>>({})

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

  const totalWeight = useMemo(
    () => blendRows.reduce((sum, row) => sum + Number(row.weight || 0), 0),
    [blendRows],
  )

  const remainingWeight = useMemo(() => bagSize - totalWeight, [bagSize, totalWeight])

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
      const coffee = coffeeCatalog.find((item) => item.id === row.coffeeId)
      if (!coffee) {
        return sum
      }
      return sum + coffee.pricePerKg * (row.weight || 0)
    }, 0)
    return pricePerKg
  }, [blendRows])

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
    try {
      const storedAccount = window.localStorage.getItem(ACCOUNT_STORAGE_KEY)
      const storedSession = window.localStorage.getItem(SESSION_STORAGE_KEY)
      const adminEmail = window.localStorage.getItem(ADMIN_STORAGE_KEY)
      if (storedAccount) {
        const parsed = JSON.parse(storedAccount) as AccountProfile & { role?: 'admin' | 'member' }
        let role = parsed.role
        if (role !== 'admin' && role !== 'member') {
          if (adminEmail) {
            role = parsed.email === adminEmail ? 'admin' : 'member'
          } else {
            role = 'admin'
            window.localStorage.setItem(ADMIN_STORAGE_KEY, parsed.email)
          }
        } else if (!adminEmail && role === 'admin') {
          window.localStorage.setItem(ADMIN_STORAGE_KEY, parsed.email)
        }

        const normalised: AccountProfile = {
          name: parsed.name,
          email: parsed.email,
          password: parsed.password,
          createdAt: parsed.createdAt ?? Date.now(),
          role,
        }

        if (parsed.role !== role) {
          window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(normalised))
        }

        if (storedSession && normalised.email === storedSession) {
          setCurrentUser(normalised)
        }
      }
    } catch (error) {
      console.error('Unable to restore account session', error)
    }
  }, [])

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
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY)
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
        coffeeId: coffeeCatalog[rows.length % coffeeCatalog.length].id,
        weight: 0,
      },
    ])
  }

  const removeBlendRow = (id: string) => {
    setBlendRows((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows))
  }

  const openAuthModal = (mode: 'login' | 'signup', message?: string) => {
    setAuthMode(mode)
    setAuthForm({ name: '', email: '', password: '' })
    setAuthNotice(message ?? '')
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setAuthNotice('')
  }

  const handleAuthInputChange = (field: 'name' | 'email' | 'password', value: string) => {
    setAuthForm((form) => ({ ...form, [field]: value }))
  }

  const handleAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedEmail = authForm.email.trim().toLowerCase()
    const trimmedName = authForm.name.trim()
    const password = authForm.password.trim()

    if (!trimmedEmail || !password) {
      setAuthNotice('Enter both email and password to continue.')
      return
    }

    try {
      const storedAccount = window.localStorage.getItem(ACCOUNT_STORAGE_KEY)

      if (authMode === 'signup') {
        if (!trimmedName) {
          setAuthNotice('Add your name so we can personalize your experience.')
          return
        }
        if (password.length < 6) {
          setAuthNotice('Choose a password with at least 6 characters.')
          return
        }
        if (storedAccount) {
          const parsed: AccountProfile = JSON.parse(storedAccount)
          if (parsed.email === trimmedEmail) {
            setAuthNotice('An account already exists for this email. Try logging in instead.')
            return
          }
        }

        const existingAdminEmail = window.localStorage.getItem(ADMIN_STORAGE_KEY)
        const resolvedRole: 'admin' | 'member' = existingAdminEmail
          ? trimmedEmail === existingAdminEmail
            ? 'admin'
            : 'member'
          : 'admin'

        if (!existingAdminEmail) {
          window.localStorage.setItem(ADMIN_STORAGE_KEY, trimmedEmail)
        }

        const account: AccountProfile = {
          name: trimmedName,
          email: trimmedEmail,
          password,
          createdAt: Date.now(),
          role: resolvedRole,
        }

        window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(account))
        setCurrentUser(account)
        setAuthNotice('Account created. You are signed in!')
        setTimeout(() => {
          closeAuthModal()
        }, 480)
      } else {
        if (!storedAccount) {
          setAuthNotice('No account found yet. Create one to get started.')
          return
        }
        const parsed = JSON.parse(storedAccount) as AccountProfile & { role?: 'admin' | 'member' }
        if (parsed.email !== trimmedEmail || parsed.password !== password) {
          setAuthNotice('Incorrect email or password.')
          return
        }
        const adminEmail = window.localStorage.getItem(ADMIN_STORAGE_KEY)
        let role = parsed.role
        if (role !== 'admin' && role !== 'member') {
          if (adminEmail) {
            role = parsed.email === adminEmail ? 'admin' : 'member'
          } else {
            role = 'admin'
            window.localStorage.setItem(ADMIN_STORAGE_KEY, parsed.email)
          }
        } else if (!adminEmail && role === 'admin') {
          window.localStorage.setItem(ADMIN_STORAGE_KEY, parsed.email)
        }

        const normalised: AccountProfile = {
          name: parsed.name,
          email: parsed.email,
          password: parsed.password,
          createdAt: parsed.createdAt ?? Date.now(),
          role,
        }

        if (parsed.role !== role) {
          window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(normalised))
        }

        setCurrentUser(normalised)
        setAuthNotice('Welcome back!')
        setTimeout(() => {
          closeAuthModal()
        }, 480)
      }

      setAuthForm({ name: '', email: '', password: '' })
    } catch (error) {
      console.error('Auth handling failed', error)
      setAuthNotice('Something went wrong. Please try again.')
    }
  }

  const handleSignOut = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    setCurrentUser(null)
    setAuthForm({ name: '', email: '', password: '' })
    setAuthNotice('')
    setIsAuthModalOpen(false)
  }

  const handleQuickAdd = (coffeeId: string) => {
    if (isRoastPromptOpen) {
      return
    }
    if (!currentUser) {
      openAuthModal('signup', 'Create an account or log in to add coffees straight to your cart.')
      return
    }

    const coffee = coffeeCatalog.find((item) => item.id === coffeeId)
    const timestamp = Date.now()
    const blend: CartBlend[] = [
      {
        coffeeId,
        name: coffee?.name ?? 'Selected lot',
        weight: Number(bagSize.toFixed(2)),
      },
    ]
    const basePrice = (coffee?.pricePerKg ?? 0) * bagSize

    setPendingCartDraft({
      id: `cart-${timestamp}`,
      createdAt: timestamp,
      blend,
      basePrice: Number(basePrice.toFixed(2)),
      bagSize,
      source: 'catalog',
    })
    setIsRoastPromptOpen(true)
    setBlendNotice({
      tone: 'positive',
      message: `Choose how we should prepare ${coffee?.name ?? 'this coffee'} before it joins your cart.`,
    })
  }

  const navigateToOrders = () => {
    navigate('/orders')
    window.setTimeout(() => {
      cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  const navigateToBlendLab = () => {
    setHighlightBlend(true)
    navigate('/coffee')
    window.setTimeout(() => {
      document.getElementById('blend-lab')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  const scheduleOrderProgress = (orderId: string) => {
    const roastingTimer = window.setTimeout(() => {
      setOrderHistory((orders) =>
        orders.map((order) => (order.id === orderId ? { ...order, status: 'Roasting' } : order)),
      )
    }, 1600)

    const fulfilledTimer = window.setTimeout(() => {
      setOrderHistory((orders) =>
        orders.map((order) =>
          order.id === orderId ? { ...order, status: 'Fulfilled', fulfilledAt: Date.now() } : order,
        ),
      )
      delete orderTimers.current[orderId]
    }, 3600)

    orderTimers.current[orderId] = { roasting: roastingTimer, fulfilled: fulfilledTimer }
  }

  const handleAddToCart = () => {
    if (isRoastPromptOpen) {
      return
    }
    if (!currentUser) {
      openAuthModal('signup', 'Create an account or log in to save blends to your cart.')
      return
    }
    if (totalWeight === 0) {
      setHighlightBlend(true)
      setBlendNotice({ tone: 'warning', message: 'Start by allocating coffees to your bag.' })
      return
    }

    if (remainingWeight > 0.01) {
      setHighlightBlend(true)
      setBlendNotice({ tone: 'warning', message: 'Allocate the full bag weight before continuing.' })
      return
    }

    if (remainingWeight < -0.01) {
      setHighlightBlend(true)
      setBlendNotice({ tone: 'warning', message: 'Reduce weights so the blend fits your bag size.' })
      return
    }

    const timestamp = Date.now()
    const blend: CartBlend[] = blendRows
      .filter((row) => row.weight > 0)
      .map((row) => {
        const coffee = coffeeCatalog.find((item) => item.id === row.coffeeId)
        return {
          coffeeId: row.coffeeId,
          name: coffee?.name ?? 'Selected lot',
          weight: Number(row.weight.toFixed(2)),
        }
      })

    if (!blend.length) {
      setBlendNotice({ tone: 'warning', message: 'Allocate weights before adding your blend.' })
      return
    }

    const basePrice = blend.reduce((sum, entry) => {
      const coffee = coffeeCatalog.find((item) => item.id === entry.coffeeId)
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
      source: 'custom',
    })

    setIsRoastPromptOpen(true)
    setBlendNotice({
      tone: 'positive',
      message: 'Choose how you want your custom blend prepared.',
    })
  }

  const finalizeCartWithRoast = (roastId: string) => {
    if (!pendingCartDraft) {
      return
    }

    const profile = roastProfiles.find((item) => item.id === roastId)
    const price =
      pendingCartDraft.basePrice + (profile?.extraCostPerKg ?? 0) * pendingCartDraft.bagSize

    const cartItem: CartItem = {
      id: pendingCartDraft.id,
      createdAt: pendingCartDraft.createdAt,
      roastId,
      roastLabel: profile?.label ?? 'Selected roast',
      bagSize: pendingCartDraft.bagSize,
      blend: pendingCartDraft.blend,
      price: Number(price.toFixed(2)),
    }

    setCartItems((items) => [cartItem, ...items])
    setPendingCartDraft(null)
    setIsRoastPromptOpen(false)
    setBlendNotice({ tone: 'positive', message: 'Blend added to cart. Ready when you are.' })
    setCartPulse(true)
    navigateToOrders()
  }

  const cancelRoastSelection = () => {
    setPendingCartDraft(null)
    setIsRoastPromptOpen(false)
    setBlendNotice({ tone: 'warning', message: 'Roast selection cancelled. Blend not added.' })
  }

  const handleRemoveCartItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
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

    const timestamp = Date.now()
    const newOrders: OrderRecord[] = cartItems.map((item, index) => ({
      ...item,
      id: `order-${timestamp}-${index}`,
      reference: `ABY-${String(timestamp).slice(-6)}-${index + 1}`,
      status: 'Queued',
    }))

    setOrderHistory((orders) => [...newOrders, ...orders])
    setCartItems([])
    setBlendNotice({ tone: 'positive', message: 'Thanks! Your blends are queued for roasting.' })
    cartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    newOrders.forEach((order) => scheduleOrderProgress(order.id))
  }

  const renderTopNav = () => (
    <div className="top-nav">
      <Link className="top-nav__brand" to="/">
        {companyName}
      </Link>
      <div className="top-nav__actions">
        <Link className="top-nav__cart" to="/coffee">
          Coffees
        </Link>
        {currentUser ? (
          <div className="top-nav__user">
            <span>
              Hi, {currentUser.name.split(' ')[0] || currentUser.name}
              {currentUser.role === 'admin' ? ' (Admin)' : ''}
            </span>
            <button type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="top-nav__user">
            <button type="button" onClick={() => openAuthModal('login')}>
              Log in
            </button>
            <button type="button" onClick={() => openAuthModal('signup')}>
              Create account
            </button>
          </div>
        )}
        <Link className="top-nav__cart" to="/orders">
          Cart ({cartItems.length})
        </Link>
      </div>
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
      <div className={showBackgroundVideo ? 'page page--with-video' : 'page'}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <header className="hero">
                  {renderTopNav()}
                  <div className="hero__badge">From farm to cup</div>
                  <h1 className="hero__title">Abyssinia coffee</h1>
                  <p className="hero__subtitle">
                    Learn what makes Ethiopian coffee unique—how it is collected, how we roast it, and how we
                    grind it. Then head to the coffees page to browse lots and build your own blend.
                  </p>
                  <div className="hero__actions">
                    <Link className="hero__cta" to="/coffee">
                      Browse coffees
                    </Link>
                    <Link className="hero__ghost" to="/coffee">
                      Build a custom blend
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
                      We offer traceable Ethiopian coffees processed as Natural, Washed, Honey, and seasonal
                      fermentation lots—each changing the sweetness, acidity, and aroma in the cup.
                    </p>
                  </div>
                  <div className="details-grid">
                    <div className="details-card">
                      <h3>Natural</h3>
                      <p>Whole cherries dried on raised beds for jammy fruit and creamy body.</p>
                    </div>
                    <div className="details-card">
                      <h3>Washed</h3>
                      <p>Clean fermentation and rinsing for crisp florals and tea-like structure.</p>
                    </div>
                    <div className="details-card">
                      <h3>Honey</h3>
                      <p>Mucilage left on during drying for layered sweetness and bright finish.</p>
                    </div>
                    <div className="details-card">
                      <h3>Anaerobic / Experimental</h3>
                      <p>Controlled fermentations that amplify fruit complexity while staying balanced.</p>
                    </div>
                  </div>
                </section>

                <section className="section">
                  <div className="section__header">
                    <h2>How it is collected</h2>
                    <p>
                      Our lots are sourced from smallholders and washing stations. Cherries are handpicked at
                      peak ripeness, sorted, and processed the same day to preserve clarity.
                    </p>
                  </div>
                </section>

                <section className="section">
                  <div className="section__header">
                    <h2>How it is roasted</h2>
                    <p>
                      We roast to order and cool quickly to lock in aromatics. Different roast profiles are used
                      for espresso and filter to highlight sweetness and origin character.
                    </p>
                  </div>
                </section>

                <section className="section">
                  <div className="section__header">
                    <h2>How it is ground</h2>
                    <p>
                      Choose whole bean or roasted & ground. Grinding is matched to your brew method so the
                      extraction is consistent and the cup stays sweet.
                    </p>
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

                <footer className="footer">
                  <p>© {new Date().getFullYear()} {companyName} · Crafted in Ethiopia · Powered by traceable supply.</p>
                </footer>
              </>
            }
          />

          <Route
            path="/coffee"
            element={
              <>
                <div className="orders-header">
                  {renderTopNav()}
                  <div className="orders-header__intro">
                    <div className="hero__badge">Browse & build</div>
                    <h1 className="hero__title">Coffees & custom blends</h1>
                    <p className="hero__subtitle">
                      Explore our lineup, then build a custom bag by weight. When you finish, choose whether you
                      want it as-is, roasted, or roasted & ground.
                    </p>
                  </div>
                </div>

                <section className="section" id="catalog">
                  <div className="section__header">
                    <h2>Single origin lineup</h2>
                    <p>Choose a lot and add it to your cart with your preferred preparation.</p>
                  </div>
                  <div className="catalog">
                    {coffeeCatalog.map((coffee) => (
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
                          <button
                            className="coffee-card__action"
                            type="button"
                            onClick={() => handleQuickAdd(coffee.id)}
                          >
                            Add to cart
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="section" id="blend-lab" ref={blendSectionRef}>
                  <div className="section__header">
                    <h2>Custom blend lab</h2>
                    <p>Design blends by weight. When you’re done, we’ll ask how you want it prepared.</p>
                  </div>
                  <div className={`blend-card ${highlightBlend ? 'blend-card--pulse' : ''}`}>
                    <div className="blend-card__row">
                      <label htmlFor="bagSize">Bag size</label>
                      <div className="bag-size-select">
                        {bagSizeOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`bag-size-btn ${bagSize === option.value ? 'bag-size-btn--active' : ''}`}
                            type="button"
                            onClick={() => setBagSize(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
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
                              {coffeeCatalog.map((coffee) => (
                                <option key={coffee.id} value={coffee.id}>
                                  {coffee.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="blend-row__field">
                            <label htmlFor={`weight-${row.id}`}>Weight (kg)</label>
                            <input
                              id={`weight-${row.id}`}
                              type="number"
                              min={0}
                              max={bagSize}
                              step={0.1}
                              value={row.weight}
                              onChange={(event) =>
                                handleBlendChange(row.id, {
                                  weight: Number.parseFloat(event.target.value) || 0,
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
                          Finish & choose preparation
                        </button>
                      </div>
                      <div className="blend-card__summary">
                        <span>Total weight: {totalWeight.toFixed(2)} kg</span>
                        <span>
                          {remainingWeight >= 0
                            ? `Remaining: ${remainingWeight.toFixed(2)} kg`
                            : `Overweight by ${Math.abs(remainingWeight).toFixed(2)} kg`}
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

                <footer className="footer">
                  <p>© {new Date().getFullYear()} {companyName} · Crafted in Ethiopia · Powered by traceable supply.</p>
                </footer>
              </>
            }
          />

          <Route
            path="/orders"
            element={
              <>
                <div className="orders-header">
                  {renderTopNav()}
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
                        Build a custom bag
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
                    {cartItems.length === 0 ? (
                      <div className="cart-empty">Your cart is empty. Head back to coffees to build a blend.</div>
                    ) : (
                      <div className="cart-grid">
                        {cartItems.map((item) => (
                          <article className="cart-item" key={item.id}>
                            <div className="cart-item__header">
                              <span className="cart-item__timestamp">
                                {dateFormatter.format(item.createdAt)} · {timeFormatter.format(item.createdAt)}
                              </span>
                              <span className="cart-item__meta">{item.bagSize.toFixed(1)} kg · {item.roastLabel}</span>
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
                  {orderHistory.length === 0 ? (
                    <div className="history-empty">No orders yet—checkout a cart to start your history.</div>
                  ) : (
                    <div className="history-grid">
                      {orderHistory.map((order) => (
                        <article className="order-card" key={order.id}>
                          <div className="order-card__header">
                            <span className="order-card__reference">{order.reference}</span>
                            <span className={`status-badge status-badge--${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="order-card__meta">
                            <span>{order.bagSize.toFixed(1)} kg · {order.roastLabel}</span>
                            <span>
                              {dateFormatter.format(order.createdAt)} · {timeFormatter.format(order.createdAt)}
                            </span>
                          </div>
                          <ul className="order-card__blend">
                            {order.blend.map((part) => (
                              <li key={`${order.id}-${part.coffeeId}`}>
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

                <footer className="footer">
                  <p>© {new Date().getFullYear()} {companyName} · Crafted in Ethiopia · Powered by traceable supply.</p>
                </footer>
              </>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

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
                <button type="button" onClick={closeAuthModal} className="auth-modal__close">
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
                    required
                  />
                </label>
                {authNotice ? <div className="auth-form__notice">{authNotice}</div> : null}
                <button className="auth-form__submit" type="submit">
                  {authMode === 'signup' ? 'Create account' : 'Log in'}
                </button>
              </form>
              <p className="auth-form__switch">
                {authMode === 'signup' ? 'Already have an account?' : 'Need an account?'}{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal(authMode === 'signup' ? 'login' : 'signup')}
                >
                  {authMode === 'signup' ? 'Log in instead' : 'Create one'}
                </button>
              </p>
            </div>
          </div>
        ) : null}
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
                const price =
                  pendingCartDraft.basePrice + profile.extraCostPerKg * pendingCartDraft.bagSize
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
