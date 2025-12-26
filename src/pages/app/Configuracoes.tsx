import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
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
  { id: 'help', label: 'Ajuda', icon: HelpCircle },
];

const Configuracoes = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const { theme, setTheme } = useTheme();

  return (
    <AppLayout>
      <div className="space-y-6">
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
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="joao@email.com" 
                      disabled 
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                  </div>
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
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium">Alterar Senha</p>
                      <p className="text-sm text-muted-foreground">Última alteração há 3 meses</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">Desativado</span>
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