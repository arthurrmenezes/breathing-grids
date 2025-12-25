import { Github, Twitter, Linkedin, Instagram } from "lucide-react";
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
  resources: [
    { label: "Central de Ajuda", href: "#help" },
    { label: "Comunidade", href: "#community" },
  ],
  legal: [
    { label: "Privacidade", href: "#privacy" },
    { label: "Termos de Uso", href: "#terms" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
  { icon: Twitter, href: "#twitter", label: "Twitter" },
  { icon: Instagram, href: "#instagram", label: "Instagram" },
];

export const Footer = () => {
  return (
    <footer className="py-16 lg:py-24 border-t border-border">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-semibold text-sm">t</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">tMoney</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Clareza financeira para todos. Tome controle do seu dinheiro com ferramentas inteligentes projetadas para
              a era moderna.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
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

          {/* Resources */}
          <div>
            <h4 className="text-sm font-medium mb-4">Recursos</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-medium mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
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
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 tMoney. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
