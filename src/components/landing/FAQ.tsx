import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "O tMoney é gratuito?",
    answer:
      "Sim! O tMoney oferece um plano gratuito com todas as funcionalidades essenciais para você organizar suas finanças.",
  },
  {
    question: "Posso usar o tMoney no celular?",
    answer:
      "Sim! O tMoney foi desenvolvido para funcionar perfeitamente em qualquer dispositivo - computador, tablet ou celular.",
  },
  {
    question: "Como funcionam os lembretes de contas?",
    answer:
      "Você cadastra suas contas recorrentes e o tMoney te avisa antes do vencimento. Nunca mais pague juros por esquecimento!",
  },
  {
    question: "Como funciona o controle de categorias?",
    answer:
      "Você pode criar categorias personalizadas para organizar suas receitas e despesas da forma que fizer mais sentido para você, além de editá-las e criar novas quando quiser.",
  },
  {
    question: "Posso compartilhar minha conta com minha família?",
    answer:
      "Em breve! Estamos desenvolvendo para que você possa convidar membros da família para gerenciar as finanças juntos.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-12 lg:py-16 relative bg-background">
      <div className="absolute inset-0 grid-pattern opacity-20 dark:opacity-10" />

      <div className="container relative mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-micro uppercase tracking-widest text-accent mb-4 block">Dúvidas Frequentes</span>
          <h2 className="text-h1 mb-4">
            Perguntas <span className="text-gradient">Frequentes</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">Tudo que você precisa saber sobre o tMoney</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-card-hover transition-all duration-300"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-lg font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
