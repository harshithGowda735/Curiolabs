import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF5EB] pt-8 sm:pt-12">
      {/* Espresso Capsule Footer with Rounded Top Corners */}
      <div className="w-full bg-[#221611] text-[#FAF5EB] rounded-t-[40px] sm:rounded-t-[54px] pt-16 sm:pt-20 px-6 sm:px-12 lg:px-20 overflow-hidden shadow-2xl border-t border-[#3A2820]">
        <div className="max-w-[1720px] mx-auto">
          {/* Main 4-Column Grid matching reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-[#3A2820]">
            {/* Column 1: Brand Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white leading-tight">
                  CURIOLABS<br />VIRTUAL LABS
                </h3>
                <p className="text-xs sm:text-sm text-[#D8CEBC] mt-5 leading-relaxed font-medium max-w-xs">
                  Zero-install WebAR hardware projection, real-time mathematical simulation engines, and automated AI viva evaluation.
                </p>
                <p className="text-xs text-[#A89886] mt-3 font-mono">
                  Bangalore, Karnataka, India
                </p>
              </div>

              <div className="mt-8">
                <a
                  href="mailto:contact@curiolabs.edu"
                  className="font-display font-black text-sm uppercase text-[#A4C93B] hover:text-white transition-colors tracking-wider"
                >
                  contact@curiolabs.edu
                </a>
              </div>
            </div>

            {/* Column 2: Navigation */}
            <div>
              <h4 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-white mb-6">
                NAVIGATION
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm font-bold text-[#E7DEC8]">
                <li>
                  <Link to="/catalog" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    All Workstations
                  </Link>
                </li>
                <li>
                  <Link to="/catalog/puc" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    PUC Sciences (+2)
                  </Link>
                </li>
                <li>
                  <Link to="/catalog/engineering" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    Engineering Tracks
                  </Link>
                </li>
                <li>
                  <Link to="/faculty" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    Faculty Console
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    Student Login
                  </Link>
                </li>
                <li>
                  <Link to="/electronics" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    WebAR Discrete Hardware
                  </Link>
                </li>
                <li>
                  <Link to="/cyber" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    Cyber Range Simulator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Socials */}
            <div>
              <h4 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-white mb-6">
                SOCIALS
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm font-bold text-[#E7DEC8]">
                <li>
                  <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    Discord Community
                  </a>
                </li>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#A4C93B] hover:translate-x-1 inline-block transition-all">
                    Twitter / X
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Newsletter Subscription */}
            <div>
              <h4 className="font-display font-black text-lg sm:text-xl uppercase tracking-wider text-white mb-3">
                STAY CURIOUS
              </h4>
              <p className="text-xs sm:text-sm text-[#D8CEBC] mb-5 leading-relaxed font-medium">
                Subscribe to our laboratory simulation updates, new curriculum modules & AI assessment releases.
              </p>

              <form onSubmit={e => e.preventDefault()} className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full bg-transparent border-2 border-[#FAF5EB]/30 focus:border-[#A4C93B] text-white rounded-full px-5 py-3 text-xs sm:text-sm placeholder-[#FAF5EB]/50 outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full bg-[#A4C93B] hover:bg-white text-[#221611] font-display font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:scale-105 shrink-0"
                >
                  SIGN UP
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* GIGANTIC BOTTOM WORDMARK matching THEOBROMA reference screenshot */}
        <div className="w-full overflow-hidden pt-8 select-none pointer-events-none text-center">
          <h1 className="font-display font-black text-[15vw] sm:text-[17vw] leading-[0.78] tracking-tighter text-[#FAF5EB] uppercase whitespace-nowrap opacity-95">
            CURIOLABS
          </h1>
        </div>
      </div>
    </footer>
  )
}
