import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const PHONE_NUMBER = '612-272-3123'
const INSTAGRAM_HANDLE = 'mvautodetailingmn'

const faqs = [
  {
    question: 'How far ahead should I book?',
    answer: 'At least 24 hours in advance.',
  },
  {
    question: 'Can I cancel or reschedule?',
    answer: (
      <>
        Yes, up to 24 hours before your appointment —{' '}
        <a href="/manage-booking" className="text-electric hover:underline">
          manage your booking here
        </a>
        .
      </>
    ),
  },
  {
    question: 'How do I pay?',
    answer: 'We accept Venmo, Zelle, Cash App, and cash.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section id="faq" className="relative bg-black py-28">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <p className="text-electric text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            FAQ
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Common Questions
          </h2>
          <p className="mt-4 text-white/55">
            Anything else? Reach out by{' '}
            <a href={`tel:${PHONE_NUMBER}`} className="text-white/75 hover:text-electric transition-colors">
              phone
            </a>{' '}
            or{' '}
            <a
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/75 hover:text-electric transition-colors"
            >
              Instagram
            </a>
            .
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, staggerChildren: 0.08 }}
          className="mt-10 space-y-3"
        >
          {faqs.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium text-white">{item.question}</span>
                  <span
                    className={`shrink-0 h-7 w-7 rounded-full border border-white/15 text-white/60 flex items-center justify-center transition-transform duration-300 ${
                      isOpen ? 'rotate-45 border-electric/40 text-electric' : ''
                    }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm text-white/55 leading-relaxed">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
