const testimonials = [
  {
    quote: "O tMoney finalmente me deu a clareza que eu precisava. Saí de estressar constantemente com dinheiro para realmente gostar de gerenciar minhas finanças.",
    author: "Marina Silva",
    role: "Designer de Produto",
    avatar: "MS",
  },
  {
    quote: "A detecção de pagamentos recorrentes é revolucionária. Descobri R$ 400 em assinaturas que tinha esquecido.",
    author: "Ricardo Oliveira",
    role: "Engenheiro de Software",
    avatar: "RO",
  },
  {
    quote: "Como freelancer com renda variável, o tMoney me ajuda a planejar com antecedência e sempre saber onde estou financeiramente.",
    author: "Juliana Costa",
    role: "Redatora Freelancer",
    avatar: "JC",
  },
  {
    quote: "O plano família transformou como lidamos com as finanças do lar. Agora todos estão na mesma página.",
    author: "Carlos & Ana Santos",
    role: "Pais de 2 filhos",
    avatar: "CS",
  },
  {
    quote: "Interface linda, funcionalidades poderosas. É raro encontrar ambos em um app de finanças.",
    author: "Pedro Almeida",
    role: "Fundador de Startup",
    avatar: "PA",
  },
  {
    quote: "Já tentei dezenas de apps de finanças. O tMoney é o primeiro que realmente usei de verdade.",
    author: "Fernanda Lima",
    role: "Professora",
    avatar: "FL",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-micro uppercase tracking-widest text-accent mb-4 block">
            Depoimentos
          </span>
          <h2 className="text-h1 mb-4">
            Amado por milhares
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Junte-se à comunidade de pessoas que tomaram controle de suas finanças.
          </p>
        </div>
      </div>

      {/* Infinite Marquee */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="flex animate-marquee">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard = ({
  quote,
  author,
  role,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  avatar: string;
}) => (
  <div className="flex-shrink-0 w-96 mx-3 bg-surface rounded-2xl border border-border p-6 shadow-card">
    <p className="text-foreground mb-6 leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
        <span className="text-sm font-medium text-accent">{avatar}</span>
      </div>
      <div>
        <p className="text-sm font-medium">{author}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  </div>
);