export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-white">
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/Logo_Nova.png" 
              alt="Nova Logo" 
              className="h-8 w-auto"
            />
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="/privacy" className="hover:text-primary-600 transition-colors">
              Politique de confidentialité
            </a>
            <a href="/terms" className="hover:text-primary-600 transition-colors">
              Conditions d'utilisation
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-border text-center text-sm text-gray-500">
          © {currentYear} Christopher PEREZ
        </div>
      </div>
    </footer>
  )
}

/* Footer.tsx */