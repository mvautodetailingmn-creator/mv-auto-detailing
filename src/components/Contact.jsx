import { useState } from 'react'
import { motion } from 'framer-motion'

const BUSINESS_EMAIL = 'mvautodetailingmn@gmail.com'

const inputClass =
  'w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-electric/60 focus:bg-white/[0.07]'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // No backend is wired up yet — this opens a pre-filled email as a placeholder.
    const subject = encodeURIComponent(`Detailing request from ${form.name || 'website visitor'}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`
    )
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  return (
    <section id="contact" className="relative bg-black py-28 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[420px] w-[800px] rounded-full bg-electric/10 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-electric text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            Get In Touch
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Get a Free Quote
          </h2>
          <p className="mt-4 text-white/55 max-w-md leading-relaxed">
            Tell us about your vehicle and what you're looking for. We'll get back to you
            with pricing and available times.
          </p>

          <div className="mt-10 space-y-4">
            {[
              ['Email', <a href={`mailto:${BUSINESS_EMAIL}`} className="hover:text-white transition-colors">{BUSINESS_EMAIL}</a>],
              ['Service Area', 'Twin Cities Metro, Minnesota'],
              ['Hours', 'Mon–Sat, 8am–6pm'],
            ].map(([label, value]) => (
              <div key={label} className="glass rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-white/70">
                <span className="text-electric font-medium w-28 shrink-0">{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="glass rounded-2xl p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              required
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <input
            type="email"
            name="email"
            required
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className={inputClass}
          />
          <textarea
            name="message"
            rows={4}
            placeholder="Tell us about your vehicle and what you need"
            value={form.message}
            onChange={handleChange}
            className={inputClass}
          />

          <button
            type="submit"
            className="w-full rounded-full bg-electric text-black btn-glow hover:brightness-110 transition-all px-8 py-3.5 font-semibold"
          >
            Send Request
          </button>

          {submitted && (
            <p className="text-sm text-white/45">
              Opening your email client to send this request to {BUSINESS_EMAIL}...
            </p>
          )}
        </motion.form>
      </div>
    </section>
  )
}
