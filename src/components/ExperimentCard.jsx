import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Clock } from 'lucide-react'

/**
 * ExperimentCard — Theobroma editorial card for individual experiments.
 */
export default function ExperimentCard({ 
  title, 
  description, 
  path, 
  icon = '🔬', 
  difficulty = 'Medium', 
  duration = '15 min', 
  completed = false, 
  hasAR = false 
}) {
  return (
    <Link
      to={path}
      className="group bg-white rounded-[28px] border-2 border-[#221611]/12 hover:border-[#221611] p-6 hover:shadow-[0_16px_32px_rgba(34,22,17,0.14)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF5EB] border-2 border-[#221611]/15 group-hover:border-[#221611] flex items-center justify-center text-2xl group-hover:rotate-6 group-hover:scale-105 transition-all shadow-xs shrink-0">
            {icon}
          </div>

          <div className="flex items-center gap-2">
            {hasAR && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#A4C93B] text-[#221611] shadow-2xs">
                WebAR 3D
              </span>
            )}
            {completed && (
              <span className="p-1 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle size={16} />
              </span>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="font-display font-black text-xl text-[#221611] group-hover:text-[#754F40] transition-colors uppercase tracking-tight mb-2 leading-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B564A] mb-5 leading-relaxed line-clamp-2 font-medium">
          {description}
        </p>
      </div>

      {/* Bottom Metadata & CTA */}
      <div className="pt-4 border-t border-[#E8DFC8] flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-[#754F40]">
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#221611]/10">
            {difficulty}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF5EB] border border-[#221611]/10">
            <Clock size={11} />
            {duration}
          </span>
        </div>

        <div className="w-8 h-8 rounded-full bg-[#221611] text-[#FAF5EB] group-hover:bg-[#A4C93B] group-hover:text-[#221611] flex items-center justify-center transition-all shadow-xs shrink-0">
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  )
}
