export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 text-white/40 text-sm py-8">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          &copy; {new Date().getFullYear()} <span className="text-white/60">MV Auto Detailing</span>. All rights reserved.
        </p>
        <p>Twin Cities Metro, Minnesota</p>
      </div>
    </footer>
  )
}
