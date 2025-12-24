import { Shield, Lock, Award, CheckCircle2 } from 'lucide-react';

const badges = [
  { icon: Shield, label: 'Segurança Bancária' },
  { icon: Lock, label: 'Criptografia AES-256' },
  { icon: Award, label: 'Certificado ISO 27001' },
  { icon: CheckCircle2, label: 'Compatível com LGPD' },
];

export const SocialProof = () => {
  return (
    <section className="py-16 border-y border-border bg-secondary/30">
      <div className="container mx-auto px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-widest mb-8">
          Segurança de nível empresarial em que você pode confiar
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-300 group"
            >
              <badge.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};