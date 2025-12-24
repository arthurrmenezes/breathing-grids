const testimonials = [
  {
    quote: "tMoney finally gave me the clarity I needed. I went from constantly stressing about money to actually enjoying managing my finances.",
    author: "Marina Silva",
    role: "Product Designer",
    avatar: "MS",
  },
  {
    quote: "The recurring payment detection is a game-changer. I discovered R$400 in subscriptions I'd forgotten about.",
    author: "Ricardo Oliveira",
    role: "Software Engineer",
    avatar: "RO",
  },
  {
    quote: "As a freelancer with variable income, tMoney helps me plan ahead and always know where I stand financially.",
    author: "Juliana Costa",
    role: "Freelance Writer",
    avatar: "JC",
  },
  {
    quote: "The family plan transformed how we handle household finances. Everyone's on the same page now.",
    author: "Carlos & Ana Santos",
    role: "Parents of 2",
    avatar: "CS",
  },
  {
    quote: "Beautiful interface, powerful features. It's rare to find both in a financial app.",
    author: "Pedro Almeida",
    role: "Startup Founder",
    avatar: "PA",
  },
  {
    quote: "I've tried dozens of finance apps. tMoney is the first one that actually stuck.",
    author: "Fernanda Lima",
    role: "Teacher",
    avatar: "FL",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 mb-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-micro uppercase tracking-widest text-accent mb-4 block">
            Testimonials
          </span>
          <h2 className="text-h1 mb-4">
            Loved by thousands
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Join the community of people who've taken control of their finances.
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
