"use client"

import React, { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, TrendingUp, Clock, Users, BarChart3, Play, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollYProgress } = useScroll()
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  const showcaseRef = useRef<HTMLElement>(null)
  const showcaseScrollRef = useRef<HTMLDivElement>(null)
  const demoRef = useRef(null)
  const isHeroInView = useInView(heroRef, { once: false, amount: 0.3 })
  const isFeaturesInView = useInView(featuresRef, { once: true, amount: 0.2 })
  const isShowcaseInView = useInView(showcaseRef, { once: true, amount: 0.2 })
  const isDemoInView = useInView(demoRef, { once: true, amount: 0.3 })

  // Parallax transforms for floating cards
  const card1Y = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const card2Y = useTransform(scrollYProgress, [0, 0.3], [0, 50])
  const card3Y = useTransform(scrollYProgress, [0, 0.3], [0, -50])

  useEffect(() => {
    const scrollContainer = showcaseScrollRef.current
    if (!scrollContainer) return

    let scrollSpeed = 0.4 // Slower, more comfortable viewing speed
    let isPaused = false
    let animationFrameId: number
    let velocity = 0
    let targetScroll = 0

    const autoScroll = () => {
      if (!scrollContainer) return

      if (!isPaused) {
        scrollContainer.scrollLeft += scrollSpeed
      } else if (Math.abs(velocity) > 0.1) {
        // Apply momentum/inertia when manually scrolling
        scrollContainer.scrollLeft += velocity
        velocity *= 0.95 // Friction/deceleration
      }

      // Seamless infinite scroll: Reset to start when halfway through duplicated content
      const maxScroll = scrollContainer.scrollWidth / 2 // Since content is duplicated
      
      if (scrollContainer.scrollLeft >= maxScroll) {
        // Seamlessly jump back to the start of the original content
        scrollContainer.scrollLeft = 0
        targetScroll = 0
      } else if (scrollContainer.scrollLeft <= 0) {
        // If scrolling backwards, jump to the end of the original set
        scrollContainer.scrollLeft = maxScroll - 10
        targetScroll = maxScroll - 10
      }

      animationFrameId = requestAnimationFrame(autoScroll)
    }

    // Start auto-scrolling after a brief delay
    const startDelay = setTimeout(() => {
      animationFrameId = requestAnimationFrame(autoScroll)
    }, 500)

    // Pause on hover and enable manual scrolling
    const handleMouseEnter = () => {
      isPaused = true
      velocity = 0
    }

    const handleMouseLeave = () => {
      isPaused = false
      velocity = 0
    }

    // Handle manual wheel scrolling with smoother feel
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      
      // Reduce the scroll amount for finer control and add to velocity
      const scrollAmount = e.deltaY * 0.5 // Smoother, less jumpy
      velocity = scrollAmount
      scrollContainer.scrollLeft += scrollAmount
    }

    scrollContainer.addEventListener('mouseenter', handleMouseEnter)
    scrollContainer.addEventListener('mouseleave', handleMouseLeave)
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      clearTimeout(startDelay)
      cancelAnimationFrame(animationFrameId)
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      scrollContainer.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <div 
      className="light min-h-screen bg-[oklch(0.98_0_0)] text-[oklch(0.15_0_0)] overflow-x-hidden" 
      style={{ 
        colorScheme: 'light',
        // Force light theme CSS variables
        '--background': 'oklch(0.98 0 0)',
        '--foreground': 'oklch(0.15 0 0)',
        '--card': 'oklch(1 0 0)',
        '--card-foreground': 'oklch(0.15 0 0)',
        '--muted': 'oklch(0.96 0 0)',
        '--muted-foreground': 'oklch(0.45 0 0)',
        '--border': 'oklch(0.88 0 0)',
        '--primary': 'oklch(0.65 0.2 280)',
        '--primary-foreground': 'oklch(0.98 0 0)',
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20derno-1sUi8Fj2TJz0cauKBsQ5MEmdBm8vxw.png"
              alt="Derno"
              width={140}
              height={40}
              className="h-8 md:h-10 w-auto"
            />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-2 bg-transparent" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/auth/sign-up">Start Free</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-col gap-3">
              <Button variant="outline" className="w-full border-2" asChild>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button className="w-full" asChild>
                <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                  Start Free
                </Link>
              </Button>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="space-y-6 md:space-y-8 text-center lg:text-left"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="inline-block"
                >
                  <span className="inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold text-primary">
                    Free Forever • No Credit Card Required
                  </span>
                </motion.div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-balance">
                  Track sessions. Manage payments. Grow your tutoring.
          </h1>
                <p className="text-base sm:text-lg text-muted-foreground text-pretty max-w-2xl mx-auto lg:mx-0">
                  Streamline your tutoring business with powerful session logging, payment tracking, and analytics.
                  Focus on teaching while Derno handles the rest.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button size="lg" className="text-base w-full sm:w-auto" asChild>
                  <Link href="/auth/sign-up">Start for Free</Link>
            </Button>
                <Button size="lg" variant="outline" className="text-base bg-transparent w-full sm:w-auto" asChild>
                  <Link href="/auth/login">See Demo</Link>
            </Button>
          </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Join over 1,000+ tutors organizing their business with Derno
                </p>
                <p className="text-xs sm:text-sm font-medium text-primary">
                  ✓ Always free • ✓ No credit card • ✓ Setup in 2 minutes
                </p>
              </div>
            </motion.div>

            {/* Right: Floating Cards with Parallax */}
            <div className="relative h-[500px] lg:h-[600px] hidden lg:block">
              <motion.div
                style={{ y: card1Y }}
                className="absolute top-[10%] left-[10%] w-[280px] rounded-xl bg-card border border-border shadow-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Upcoming Sessions</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Math with Sarah</p>
                    <p className="text-sm font-medium text-muted-foreground">3:00 PM</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">History with David</p>
                    <p className="text-sm font-medium text-muted-foreground">4:30 PM</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Physics with Emma</p>
                    <p className="text-sm font-medium text-muted-foreground">6:00 PM</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ y: card2Y }}
                className="absolute top-[35%] right-[5%] w-[280px] rounded-xl bg-card border border-border shadow-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg">Recent Payments</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Jane D.</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">$50.00</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Michael B.</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">$75.00</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">Lisa K.</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">$60.00</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ y: card3Y }}
                className="absolute bottom-[10%] left-[15%] w-[280px] rounded-xl bg-card border border-border shadow-2xl p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="font-bold text-lg">This Month</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Total Sessions</p>
                    <p className="text-2xl font-bold">42</p>
            </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold">$2,450</p>
            </div>
            </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section ref={showcaseRef} className="py-12 sm:py-16 md:py-24 lg:py-32 overflow-hidden min-h-[80vh] sm:min-h-screen flex items-center">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isShowcaseInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4 px-4 md:px-6"
          >
            <span className="text-xs sm:text-sm font-bold text-primary tracking-widest uppercase">See It In Action</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance px-4">
              A beautiful interface designed for tutors
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
              Intuitive dashboards and powerful features that make managing your tutoring business effortless
            </p>
          </motion.div>

          {/* Horizontal scrolling showcase */}
          <div className="relative">
            <div
              ref={showcaseScrollRef}
              className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide pl-4 md:pl-6"
            >
              {/* Dashboard Preview */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isShowcaseInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex-shrink-0 w-[90%] md:w-[600px]"
              >
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Dashboard</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Welcome back, Alex!</h3>
                      <Button size="sm">New Session</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="text-sm text-muted-foreground mb-1">Today</p>
                        <p className="text-3xl font-bold">5</p>
                        <p className="text-xs text-muted-foreground">sessions</p>
                      </div>
                      <div className="rounded-lg bg-green-500/10 p-4">
                        <p className="text-sm text-muted-foreground mb-1">This Week</p>
                        <p className="text-3xl font-bold">$850</p>
                        <p className="text-xs text-muted-foreground">earned</p>
          </div>
                      <div className="rounded-lg bg-amber-500/10 p-4">
                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-xs text-muted-foreground">students</p>
          </div>
        </div>
                    <div className="h-32 rounded-lg bg-muted/50 flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sessions View */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isShowcaseInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex-shrink-0 w-[90%] md:w-[600px]"
              >
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Sessions</span>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Recent Sessions</h3>
                      <Button size="sm" variant="outline">
                        Filter
                      </Button>
                    </div>
                    {[
                      {
                        student: "Sarah Johnson",
                        subject: "Mathematics",
                        time: "2:00 PM - 3:00 PM",
                        status: "Completed",
                        amount: "$50",
                      },
                      {
                        student: "David Chen",
                        subject: "Physics",
                        time: "3:30 PM - 4:30 PM",
                        status: "Completed",
                        amount: "$60",
                      },
                      {
                        student: "Emma Wilson",
                        subject: "Chemistry",
                        time: "5:00 PM - 6:00 PM",
                        status: "Upcoming",
                        amount: "$55",
                      },
                    ].map((session, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                  <div>
                            <p className="font-semibold">{session.student}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.subject} • {session.time}
                            </p>
                  </div>
                </div>
                        <div className="text-right">
                          <p className="font-bold">{session.amount}</p>
                          <p className="text-xs text-muted-foreground">{session.status}</p>
                  </div>
                </div>
                    ))}
              </div>
            </div>
              </motion.div>

              {/* Payments View */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isShowcaseInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex-shrink-0 w-[90%] md:w-[600px]"
              >
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Payments</span>
                  </div>
                  <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Payment Tracking</h3>
                      <Button size="sm">Export</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Total Received</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">$3,240</p>
                        <p className="text-xs text-muted-foreground mt-1">This month</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">$420</p>
                        <p className="text-xs text-muted-foreground mt-1">3 pending</p>
                      </div>
                  </div>
                  <div className="space-y-3">
                      {[
                        { name: "Michael Brown", amount: "$75", status: "Paid", date: "Jan 15" },
                        { name: "Lisa Anderson", amount: "$60", status: "Paid", date: "Jan 14" },
                        { name: "James Taylor", amount: "$50", status: "Pending", date: "Jan 13" },
                      ].map((payment, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{payment.name}</p>
                              <p className="text-xs text-muted-foreground">{payment.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{payment.amount}</p>
                            <p
                              className={`text-xs ${payment.status === "Paid" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
                            >
                              {payment.status}
                            </p>
                      </div>
                    </div>
                      ))}
                      </div>
                    </div>
                  </div>
              </motion.div>

              {/* Analytics View */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={isShowcaseInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex-shrink-0 w-[90%] md:w-[600px]"
              >
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Analytics</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Growth Insights</h3>
                      <Button size="sm" variant="outline">
                        This Month
                      </Button>
                    </div>
                    <div className="h-48 rounded-lg bg-muted/50 flex items-center justify-center relative overflow-hidden">
                      <TrendingUp className="h-16 w-16 text-muted-foreground/20" />
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                        <p className="text-2xl font-bold">124.5</p>
                        <p className="text-xs text-green-600 dark:text-green-400">↑ 12% from last month</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Avg. Rate</p>
                        <p className="text-2xl font-bold">$52/hr</p>
                        <p className="text-xs text-green-600 dark:text-green-400">↑ 8% from last month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Duplicate set for seamless infinite scroll */}
              {/* Dashboard Preview - Duplicate */}
              <div className="flex-shrink-0 w-[90%] md:w-[600px]">
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Dashboard</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Welcome back, Alex!</h3>
                      <Button size="sm">New Session</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg bg-primary/10 p-4">
                        <p className="text-sm text-muted-foreground mb-1">Today</p>
                        <p className="text-3xl font-bold">5</p>
                        <p className="text-xs text-muted-foreground">sessions</p>
                      </div>
                      <div className="rounded-lg bg-green-500/10 p-4">
                        <p className="text-sm text-muted-foreground mb-1">This Week</p>
                        <p className="text-3xl font-bold">$850</p>
                        <p className="text-xs text-muted-foreground">earned</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 p-4">
                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                        <p className="text-3xl font-bold">12</p>
                        <p className="text-xs text-muted-foreground">students</p>
                      </div>
                    </div>
                    <div className="h-32 rounded-lg bg-muted/50 flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessions View - Duplicate */}
              <div className="flex-shrink-0 w-[90%] md:w-[600px]">
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Sessions</span>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Recent Sessions</h3>
                      <Button size="sm" variant="outline">
                        Filter
                      </Button>
                    </div>
                    {[
                      {
                        student: "Sarah Johnson",
                        subject: "Mathematics",
                        time: "2:00 PM - 3:00 PM",
                        status: "Completed",
                        amount: "$50",
                      },
                      {
                        student: "David Chen",
                        subject: "Physics",
                        time: "3:30 PM - 4:30 PM",
                        status: "Completed",
                        amount: "$60",
                      },
                      {
                        student: "Emma Wilson",
                        subject: "Chemistry",
                        time: "5:00 PM - 6:00 PM",
                        status: "Upcoming",
                        amount: "$55",
                      },
                    ].map((session, i) => (
                      <div
                        key={`dup-${i}`}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{session.student}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.subject} • {session.time}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{session.amount}</p>
                          <p className="text-xs text-muted-foreground">{session.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payments View - Duplicate */}
              <div className="flex-shrink-0 w-[90%] md:w-[600px]">
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Payments</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Payment Tracking</h3>
                      <Button size="sm">Export</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Total Received</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">$3,240</p>
                        <p className="text-xs text-muted-foreground mt-1">This month</p>
                      </div>
                      <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
                        <p className="text-sm text-muted-foreground mb-1">Outstanding</p>
                        <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">$420</p>
                        <p className="text-xs text-muted-foreground mt-1">3 pending</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: "Michael Brown", amount: "$75", status: "Paid", date: "Jan 15" },
                        { name: "Lisa Anderson", amount: "$60", status: "Paid", date: "Jan 14" },
                        { name: "James Taylor", amount: "$50", status: "Pending", date: "Jan 13" },
                      ].map((payment, i) => (
                        <div key={`dup-${i}`} className="flex items-center justify-between p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{payment.name}</p>
                              <p className="text-xs text-muted-foreground">{payment.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{payment.amount}</p>
                            <p
                              className={`text-xs ${payment.status === "Paid" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
                            >
                              {payment.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics View - Duplicate */}
              <div className="flex-shrink-0 w-[90%] md:w-[600px]">
                <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl">
                  <div className="bg-muted/50 p-4 border-b border-border flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm font-medium ml-4">Analytics</span>
                  </div>
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Growth Insights</h3>
                      <Button size="sm" variant="outline">
                        This Month
                      </Button>
                    </div>
                    <div className="h-48 rounded-lg bg-muted/50 flex items-center justify-center relative overflow-hidden">
                      <TrendingUp className="h-16 w-16 text-muted-foreground/20" />
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/20 to-transparent" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Total Hours</p>
                        <p className="text-2xl font-bold">124.5</p>
                        <p className="text-xs text-green-600 dark:text-green-400">↑ 12% from last month</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Avg. Rate</p>
                        <p className="text-2xl font-bold">$52/hr</p>
                        <p className="text-xs text-green-600 dark:text-green-400">↑ 8% from last month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section ref={demoRef} className="py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isDemoInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-2 sm:mb-4">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance px-4">
                Try Derno Right Now
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
                Explore the full application with live demo data. Add students, log sessions, and see how Derno
                simplifies your tutoring business—no sign-up required.
              </p>
              <p className="text-xs sm:text-sm text-primary font-semibold px-4">
                ✓ Fully interactive • ✓ All features unlocked • ✓ Changes don't persist
              </p>
            </div>

            {/* Embedded Demo iframe */}
            <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-primary/20 shadow-2xl bg-card">
              <div className="absolute top-0 left-0 right-0 h-10 sm:h-12 bg-muted/50 border-b border-border flex items-center px-3 sm:px-4 gap-2 z-10">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-background/80 px-2 sm:px-4 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                    <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
                    <span className="hidden xs:inline">Live Demo</span>
                    <span className="xs:hidden">Demo</span>
                  </div>
                </div>
              </div>
              <iframe
                src="/demo"
                className="w-full h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px] mt-10 sm:mt-12"
                title="Derno Demo Application"
                style={{ border: 'none' }}
              />
            </div>

            <div className="text-center px-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Like what you see? Create your own account to save your data and get started for real.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/auth/sign-up">Create Free Account</Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className="py-12 sm:py-16 md:py-24 lg:py-32 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4"
          >
            <span className="text-xs sm:text-sm font-bold text-primary tracking-widest uppercase">Everything You Need</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance px-4">
              Built for tutors who want to focus on teaching
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
              All the tools you need to run a successful tutoring business, in one simple platform
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Calendar,
                title: "Session Logging",
                description: "Quickly log every tutoring session with student details, duration, and notes.",
                delay: 0.1,
              },
              {
                icon: DollarSign,
                title: "Payment Tracking",
                description: "Track payments, outstanding balances, and generate invoices automatically.",
                delay: 0.2,
              },
              {
                icon: Clock,
                title: "Time Analytics",
                description: "See how much time you spend with each student and optimize your schedule.",
                delay: 0.3,
              },
              {
                icon: Users,
                title: "Student Management",
                description: "Keep all student information, progress notes, and history in one place.",
                delay: 0.4,
              },
              {
                icon: BarChart3,
                title: "Revenue Reports",
                description: "Visualize your earnings over time with beautiful charts and insights.",
                delay: 0.5,
              },
              {
                icon: TrendingUp,
                title: "Growth Insights",
                description: "Understand your business trends and make data-driven decisions.",
                delay: 0.6,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isFeaturesInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="group relative rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-pretty">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-primary p-8 sm:p-12 md:p-16 text-center"
          >
            <div className="relative z-10 space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground text-balance px-4">
                Ready to organize your tutoring business?
              </h2>
              <p className="text-base sm:text-lg text-primary-foreground/90 max-w-2xl mx-auto text-pretty px-4">
                Join thousands of tutors who trust Derno to manage their sessions and payments
              </p>
              <p className="text-base sm:text-xl font-semibold text-primary-foreground/95 px-4">
                100% Free Forever • No Credit Card Required
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
                <Button size="lg" variant="secondary" className="text-base w-full sm:w-auto" asChild>
                  <Link href="/auth/sign-up">Start for Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
                  className="text-base bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
              asChild
            >
                  <Link href="/auth/login">Launch Demo Account</Link>
            </Button>
          </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 sm:py-12">
        <div className="container max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <div className="flex items-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20derno-1sUi8Fj2TJz0cauKBsQ5MEmdBm8vxw.png"
                alt="Derno"
                width={120}
                height={32}
                className="h-6 sm:h-8 w-auto"
              />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">© 2025 Derno. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
