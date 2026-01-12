import { Link } from "react-router-dom";

const footerLinks = {
  product: [
    { label: "Funcionalidades", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ],
  company: [
    { label: "Sobre", href: "#about" },
    { label: "Blog", href: "#blog" },
  ],
};

export const Footer = () => {
  return (
    <footer className="py-12 lg:py-16 border-t border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-semibold text-sm">t</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">tMoney</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm">
              Clareza financeira para todos. Tome controle do seu dinheiro com ferramentas inteligentes.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-medium mb-4">Website</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-medium mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">© 2026 tMoney. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
