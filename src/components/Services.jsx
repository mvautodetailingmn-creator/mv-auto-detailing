import { motion } from 'framer-motion'

const services = [
  {
    name: 'Interior Detail',
    price: 'from $99',
    description:
      'Deep vacuum, steam cleaning, leather/upholstery conditioning, and streak-free glass.',
    features: ['Full vacuum & shampoo', 'Dash & console detail', 'Odor treatment'],
  },
  {
    name: 'Exterior Detail',
    price: 'from $89',
    description:
      'Hand wash, clay bar treatment, wheel & tire cleaning, and a protective wax finish.',
    features: ['Hand wash & dry', 'Clay bar treatment', 'Wax & sealant'],
  },
  {
    name: 'Full Detail Package',
    price: 'from $169',
    description:
      'The complete interior + exterior package for a showroom-ready finish, bumper to bumper.',
    features: ['Everything included', 'Engine bay wipe-down', 'Priority scheduling'],
    highlight: true,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const card = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export default function Services() {
  return (
    <section id="services" className="relative bg-black py-28">
      <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_50%,black,transparent)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-electric text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Pricing
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Detailing Packages
          </h2>
          <p className="mt-4 text-white/55">
            Straightforward pricing, no surprises. Every package can be tailored to your vehicle.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-8 md:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div
              key={service.name}
              variants={card}
              whileHover={{ y: -6 }}
              className={`relative rounded-2xl p-8 flex flex-col glass glow-hover transition-shadow ${
                service.highlight ? 'border-electric/30 shadow-[0_0_60px_-20px_rgba(125,249,255,0.35)]' : ''
              }`}
            >
              {service.highlight && (
                <span className="absolute -top-3 left-8 rounded-full bg-electric text-black text-[11px] font-semibold px-3 py-1 tracking-wide uppercase">
                  Most Popular
                </span>
              )}

              <h3 className="font-display text-xl font-semibold text-white">{service.name}</h3>
              <p className="mt-1 text-2xl font-semibold text-electric text-glow">{service.price}</p>
              <p className="mt-4 text-sm text-white/55 leading-relaxed">{service.description}</p>

              <ul className="mt-6 space-y-3 flex-1">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-white/75">
                    <svg
                      className="text-electric shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-8 inline-flex justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                  service.highlight
                    ? 'bg-electric text-black btn-glow hover:brightness-110'
                    : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                }`}
              >
                Book This Package
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
