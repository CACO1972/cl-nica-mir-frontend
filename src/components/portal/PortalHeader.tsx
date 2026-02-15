import { useNavigate } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import logoPortal from '@/assets/logo-clinica-miro-portal.svg';

interface PortalHeaderProps {
  title?: string;
}

const PortalHeader = ({ title = "Portal Paciente" }: PortalHeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="flex items-center">
            <img src={logoPortal} alt="Clínica Miró" className="h-14 md:h-18 w-auto" />
          </button>
          <span className="text-sm text-muted-foreground hidden sm:inline">{title}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PortalHeader;
