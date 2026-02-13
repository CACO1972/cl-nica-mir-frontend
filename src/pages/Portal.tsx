import { Link } from "react-router-dom";
import logoClinicaMiro from "@/assets/logo-clinica-miro.png";

const Portal = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6">
      <Link to="/" className="mb-12">
        <img src={logoClinicaMiro} alt="Clínica Miró" className="h-14 w-auto" />
      </Link>
      <h1 className="display-medium text-foreground mb-6">Portal Paciente</h1>
      <p className="body-large text-muted-foreground max-w-md text-center">
        Próximamente podrás acceder a tu ficha clínica, citas y resultados desde aquí.
      </p>
    </div>
  );
};

export default Portal;
