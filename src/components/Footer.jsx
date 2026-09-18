import { FlaskConical } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-6 px-4 safe-bottom border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-teal-400" />
          <span className="font-display font-bold text-white tracking-wide">CurioLabs</span>
          <span className="text-slate-500 font-mono text-[11px]">OS</span>
        </div>
        <p className="text-slate-500 text-[11px] font-mono">
          © {new Date().getFullYear()} CurioLabs. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
