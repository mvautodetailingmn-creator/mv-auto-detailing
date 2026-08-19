// Shared Tailwind class strings for the booking wizard, matching the input
// styling already used in Contact.jsx so the two forms feel identical.
export const inputClass =
  'w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-electric/60 focus:bg-white/[0.07]'

export const labelClass = 'block text-xs font-medium text-white/50 mb-1.5'

export const choiceCardClass = (active) =>
  `w-full text-left rounded-xl border px-5 py-4 transition-all cursor-pointer ${
    active
      ? 'border-electric/50 bg-electric/10 shadow-[0_0_0_1px_rgba(125,249,255,0.25)]'
      : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07]'
  }`

export const primaryButtonClass =
  'inline-flex justify-center items-center rounded-full bg-electric text-black btn-glow hover:brightness-110 transition-all px-8 py-3.5 font-semibold disabled:opacity-40 disabled:pointer-events-none cursor-pointer'

export const secondaryButtonClass =
  'inline-flex justify-center items-center rounded-full glass glow-hover transition-all px-8 py-3.5 font-medium text-white/80 cursor-pointer'
