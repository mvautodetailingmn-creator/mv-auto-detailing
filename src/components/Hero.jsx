import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
}

const badges = ['Fully Insured', 'Mobile & On-Demand', 'Satisfaction Guaranteed']

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-black text-white">
      {/* Layered glow + grid background */}
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[900px] rounded-full bg-electric/20 blur-[140px]" />
      <div className="absolute top-40 left-10 h-64 w-64 rounded-full bg-electric/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-40 pb-28 text-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-electric opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-electric" />
          </span>
          <span className="text-xs font-medium tracking-wide text-white/80 uppercase">
            Mobile Auto Detailing &middot; Minnesota
          </span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.05]"
        >
          Your Car, Detailed
          <br />
          to{' '}
          <span className="text-electric text-glow">Perfection.</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 text-white/60 text-lg max-w-xl mx-auto leading-relaxed"
        >
          Professional interior and exterior detailing, brought straight to your
          driveway. Book a time that works for you — we handle the rest.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#booking"
            className="w-full sm:w-auto rounded-full bg-electric text-black btn-glow hover:brightness-110 transition-all px-9 py-3.5 font-semibold"
          >
            Book Your Detail
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto rounded-full glass glow-hover transition-all px-9 py-3.5 font-medium text-white/90"
          >
            View Services
          </a>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3"
        >
          {badges.map((badge) => (
            <span
              key={badge}
              className="glass rounded-full px-4 py-2 text-xs font-medium text-white/70"
            >
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
