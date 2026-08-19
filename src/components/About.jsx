import { motion } from 'framer-motion'

const points = [
  {
    title: 'We Come to You',
    body: 'Fully mobile setup — we bring every tool needed right to your home or office. Please have a water source and a standard electrical outlet accessible at the service location.',
    icon: (
      <path
        d="M3 13l1.5-5A2 2 0 0 1 6.4 6.5h11.2a2 2 0 0 1 1.9 1.5L21 13m-18 0v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-5m-18 0h18M7 16.5h.01M17 16.5h.01"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Careful, Thorough Work',
    body: 'Every vehicle gets the same attention to detail, whether it is a daily driver or a weekend car.',
    icon: (
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zm-3.5 9.5l2 2 4.5-4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: 'Flexible Scheduling',
    body: 'Evenings and weekends available. Book a time that actually fits your schedule.',
    icon: (
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-14v5l3.5 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export default function About() {
  return (
    <section id="about" className="relative bg-black py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-electric text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              About Us
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Built for people who care about their car
            </h2>
            <p className="mt-6 text-white/55 leading-relaxed">
              MV Auto Detailing is a Minnesota-based mobile detailing service built on one
              simple idea: your car should look and feel its best without you having to
              rearrange your day for it. We show up on time, work with care, and treat
              every vehicle like our own.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, staggerChildren: 0.12 }}
            className="space-y-4"
          >
            {points.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="glass glow-hover rounded-xl p-5 flex gap-4 items-start"
              >
                <div className="h-11 w-11 shrink-0 rounded-full bg-electric/10 border border-electric/20 text-electric flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    {point.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{point.title}</h3>
                  <p className="mt-1 text-sm text-white/55 leading-relaxed">{point.body}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
