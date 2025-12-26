import { useState } from 'react';
import { AppLayout } from '@/components/app/AppLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { 
  User, 
  Bell, 
  Lock, 
  Palette, 
  HelpCircle,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const { user, updateUser } = useAuth();

  // Profile state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const response = await authService.updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      if (response.error) {
        toast.error(response.error);
      } else if (response.data) {
        updateUser({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
        });
        toast.success('Perfil atualizado com sucesso');
      }
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success('Senha alterada com sucesso');
        setChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (error) {
      toast.error('Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input 
                      id="firstName" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input 
                      id="lastName" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="accent" 
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar Alterações
                  </Button>
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

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3">Canais de Notificação</h4>
                  <p className="text-sm text-muted-foreground mb-4">Escolha por onde deseja receber as notificações</p>
                  <div className="space-y-3">
                    <NotificationToggle
                      title="Email"
                      description="Receba notificações por email"
                      defaultChecked={true}
                    />
                    <NotificationToggle
                      title="SMS"
                      description="Receba notificações por SMS"
                      defaultChecked={false}
                    />
                    <NotificationToggle
                      title="WhatsApp"
                      description="Receba notificações pelo WhatsApp"
                      defaultChecked={false}
                    />
                  </div>
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
                  <button 
                    onClick={() => setChangePasswordOpen(true)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/30 transition-colors cursor-pointer"
                  >
                    <div className="text-left">
                      <p className="font-medium">Alterar Senha</p>
                      <p className="text-sm text-muted-foreground">Atualize sua senha de acesso</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                  
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

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha para atualizar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setChangePasswordOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="accent" 
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || !newPassword || !confirmNewPassword}
            >
              {changingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
