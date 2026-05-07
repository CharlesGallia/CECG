import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="mt-16 sm:mt-24 border-t border-or/15 bg-noir"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 text-center font-sans">
        <div className="text-or/70 font-cinzel text-xs tracking-imperial uppercase">
          Association GIFTER · SIREN 533&nbsp;624&nbsp;649
        </div>
        <div className="mt-2 text-texte-muet text-xs tracking-wider">
          8 Route du Minerai, Menestreau · <span className="italic font-cormorant text-or-pale">Gallia Aeterna</span>
        </div>
        <nav className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-texte-muet text-xs uppercase tracking-imperial-tight">
          <Link to="/mentions-legales" className="hover:text-or transition-colors">Mentions légales</Link>
          <span aria-hidden className="text-or-terne">·</span>
          <Link to="/confidentialite" className="hover:text-or transition-colors">Confidentialité</Link>
          <span aria-hidden className="text-or-terne">·</span>
          <Link to="/cgv" className="hover:text-or transition-colors">CGV</Link>
          <span aria-hidden className="text-or-terne">·</span>
          <Link to="/contact" className="hover:text-or transition-colors">Contact</Link>
        </nav>
        <div className="mt-6 text-or-terne text-[10px] uppercase tracking-imperial-tight">
          © {new Date().getFullYear()} Imperio Gallorum Sociatis · Funnel Titulus Civilis
        </div>
      </div>
    </footer>
  )
}
