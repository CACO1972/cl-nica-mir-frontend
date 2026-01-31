import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-secondary pt-16 pb-8" id="contacto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">M</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-secondary leading-tight">
                  Clínica Miró
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  Odontología Predictiva
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transformamos la odontología con tecnología predictiva avanzada para 
              cuidar tu salud dental de forma preventiva.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-secondary mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/evaluacion-premium" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Evaluación Premium
                </Link>
              </li>
              <li>
                <a href="#servicios" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Política de Privacidad
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-secondary mb-4">Servicios</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Evaluación Premium
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Odontología Preventiva
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Estética Dental
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Implantes
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-secondary mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Av. Providencia 1234, Of. 501<br />
                  Providencia, Santiago
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="tel:+56912345678" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  +56 9 1234 5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:contacto@clinicamiro.cl" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  contacto@clinicamiro.cl
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Lun - Vie: 9:00 - 19:00<br />
                  Sáb: 9:00 - 14:00
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Clínica Miró. Todos los derechos reservados.
            </p>
            <p className="text-sm text-muted-foreground">
              Desarrollado con tecnología dental de vanguardia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
