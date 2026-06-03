export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border-default bg-background-card">
      <div className="px-6 py-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/Logo_Nova_V2.png" 
              alt="Nova Logo" 
              className="h-10 w-auto grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="/privacy" className="hover:text-primary-600 transition-colors">
              Politique de confidentialité
            </a>
            <a href="/terms" className="hover:text-primary-600 transition-colors">
              Conditions d'utilisation
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border-default text-center text-xs font-medium text-text-muted tracking-widest">
          © {currentYear} Nova - Christopher PEREZ
        </div>
      </div>
    </footer>
  )
}

/* Footer.tsx */