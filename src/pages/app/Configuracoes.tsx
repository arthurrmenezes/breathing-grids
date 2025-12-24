import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  CreditCard, 
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Smartphone
} from 'lucide-react';

const settingsSections = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'security', label: 'Segurança', icon: Lock },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'billing', label: 'Assinatura', icon: CreditCard },
  { id: 'help', label: 'Ajuda', icon: HelpCircle },
];

const Configuracoes = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-h2">Configurações</h1>
          <p className="text-muted-foreground">Gerencie sua conta e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                    transition-colors duration-200
                    ${activeSection === section.id 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Informações do Perfil</h3>
                  <p className="text-sm text-muted-foreground">Atualize suas informações pessoais</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl font-medium text-accent">JD</span>
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Alterar Foto</Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG ou GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input id="firstName" defaultValue="João" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" defaultValue="da Silva" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="joao@email.com" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" type="tel" defaultValue="(11) 99999-9999" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="accent">Salvar Alterações</Button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Preferências de Notificação</h3>
                  <p className="text-sm text-muted-foreground">Escolha como deseja receber notificações</p>
                </div>

                <div className="space-y-4">
                  <NotificationToggle
                    title="Lembretes de Contas"
                    description="Receba alertas antes do vencimento das contas"
                    defaultChecked={true}
                  />
                  <NotificationToggle
                    title="Relatórios Semanais"
                    description="Resumo semanal dos seus gastos"
                    defaultChecked={true}
                  />
                  <NotificationToggle
                    title="Transações"
                    description="Notificações de novas transações"
                    defaultChecked={false}
                  />
                  <NotificationToggle
                    title="Metas Atingidas"
                    description="Celebre quando atingir uma meta"
                    defaultChecked={true}
                  />
                  <NotificationToggle
                    title="Dicas Financeiras"
                    description="Receba dicas personalizadas de economia"
                    defaultChecked={false}
                  />
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Segurança</h3>
                  <p className="text-sm text-muted-foreground">Proteja sua conta</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <div>
                      <p className="font-medium">Alterar Senha</p>
                      <p className="text-sm text-muted-foreground">Última alteração há 3 meses</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">Desativado</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <div>
                      <p className="font-medium">Sessões Ativas</p>
                      <p className="text-sm text-muted-foreground">Gerencie seus dispositivos conectados</p>
                    </div>
                    <span className="text-sm text-muted-foreground">2 dispositivos</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Aparência</h3>
                  <p className="text-sm text-muted-foreground">Personalize a aparência do app</p>
                </div>

                <div>
                  <Label className="mb-3 block">Tema</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('light')}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors
                        ${theme === 'light' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}
                      `}
                    >
                      <Sun className="w-6 h-6" />
                      <span className="text-sm font-medium">Claro</span>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors
                        ${theme === 'dark' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}
                      `}
                    >
                      <Moon className="w-6 h-6" />
                      <span className="text-sm font-medium">Escuro</span>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors
                        ${theme === 'system' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/30'}
                      `}
                    >
                      <Smartphone className="w-6 h-6" />
                      <span className="text-sm font-medium">Sistema</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'billing' && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Assinatura</h3>
                  <p className="text-sm text-muted-foreground">Gerencie seu plano e pagamentos</p>
                </div>

                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">PRO</span>
                      <p className="text-lg font-medium mt-2">Plano Pro</p>
                      <p className="text-sm text-muted-foreground">R$ 23/mês (anual)</p>
                    </div>
                    <Button variant="outline">Alterar Plano</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Próxima cobrança em 15 de Janeiro de 2025
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Histórico de Pagamentos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Dezembro 2024</p>
                        <p className="text-sm text-muted-foreground">Plano Pro Anual</p>
                      </div>
                      <span className="text-success">R$ 23,00</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div>
                        <p className="font-medium">Novembro 2024</p>
                        <p className="text-sm text-muted-foreground">Plano Pro Anual</p>
                      </div>
                      <span className="text-success">R$ 23,00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-1">Central de Ajuda</h3>
                  <p className="text-sm text-muted-foreground">Encontre respostas e suporte</p>
                </div>

                <div className="space-y-3">
                  <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <span className="font-medium">Perguntas Frequentes</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <span className="font-medium">Tutoriais em Vídeo</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <span className="font-medium">Falar com Suporte</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </a>
                  <a href="#" className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors">
                    <span className="font-medium">Reportar um Problema</span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const NotificationToggle = ({ 
  title, 
  description, 
  defaultChecked 
}: { 
  title: string; 
  description: string; 
  defaultChecked: boolean;
}) => {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`
          relative w-12 h-7 rounded-full transition-colors
          ${checked ? 'bg-accent' : 'bg-secondary'}
        `}
      >
        <div 
          className={`
            absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm
            transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
};

export default Configuracoes;