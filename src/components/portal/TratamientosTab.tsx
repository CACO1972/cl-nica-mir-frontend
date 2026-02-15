import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, Activity, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface PlanTratamiento {
  id: string | number;
  nombre: string;
  estado: string;
  progreso: number;
  estado_financiero: string | null;
  profesional: string | null;
  especialidad: string | null;
  ultima_cita: string | null;
  fecha_inicio: string | null;
  descripcion: string | null;
  presupuesto_total: number | null;
}

interface TratamientosTabProps {
  tratamientos: PlanTratamiento[];
  isLoading: boolean;
}

const getEstadoConfig = (estado: string) => {
  const lower = (estado || '').toLowerCase();
  if (lower.includes('ejecuci') || lower.includes('curso') || lower.includes('activ') || lower.includes('progress'))
    return { label: 'En ejecución', color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/20' };
  if (lower.includes('complet') || lower.includes('termin') || lower.includes('finaliz'))
    return { label: 'Completado', color: 'text-muted-foreground', bg: '' };
  if (lower.includes('pend') || lower.includes('planific') || lower.includes('diagnos') || lower.includes('presupuest'))
    return { label: 'Diagnóstico', color: 'text-blue-600', bg: 'bg-blue-500/5 border-blue-500/20' };
  if (lower.includes('cancel') || lower.includes('anulad'))
    return { label: 'Cancelado', color: 'text-destructive', bg: '' };
  return { label: estado || 'Otro', color: 'text-muted-foreground', bg: '' };
};

const formatCurrency = (amount: number | null) => {
  if (!amount) return null;
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(amount);
};

const TratamientosTab = ({ tratamientos, isLoading }: TratamientosTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  const enEjecucion = tratamientos.filter(t => {
    const lower = (t.estado || '').toLowerCase();
    return lower.includes('ejecuci') || lower.includes('curso') || lower.includes('activ');
  });
  const otros = tratamientos.filter(t => !enEjecucion.includes(t));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-gold" />
            Planes de tratamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tratamientos.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay planes de tratamiento registrados</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* En ejecución */}
              {enEjecucion.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-green-600 mb-3">En ejecución</h3>
                  <div className="space-y-3">
                    {enEjecucion.map((plan, index) => (
                      <PlanCard key={plan.id} plan={plan} index={index} />
                    ))}
                  </div>
                </div>
              )}
              {enEjecucion.length === 0 && (
                <div>
                  <h3 className="text-lg font-medium text-green-600 mb-3">En ejecución</h3>
                  <p className="text-sm text-muted-foreground italic">
                    El paciente no cuenta con tratamientos en ejecución
                  </p>
                </div>
              )}

              {/* Otros */}
              {otros.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-medium text-muted-foreground">Otros</h3>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-3">
                    {otros.map((plan, index) => (
                      <PlanCard key={plan.id} plan={plan} index={index} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function PlanCard({ plan, index }: { plan: PlanTratamiento; index: number }) {
  const config = getEstadoConfig(plan.estado);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`rounded-lg border p-4 ${config.bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-foreground">
          #{plan.id}: {plan.nombre}
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        {plan.profesional && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Profesional</p>
            <p className="font-medium flex items-center gap-1 mt-0.5">
              <User className="h-3 w-3" />
              {plan.profesional}
            </p>
            {plan.especialidad && (
              <p className="text-xs text-muted-foreground">({plan.especialidad})</p>
            )}
          </div>
        )}

        {plan.ultima_cita && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Última cita</p>
            <p className="font-medium flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3" />
              {new Date(plan.ultima_cita).toLocaleDateString('es-CL')}
            </p>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Progreso</p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={plan.progreso} className="h-2 flex-1" />
            <span className="text-xs font-mono">{plan.progreso}%</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Estado financiero</p>
          <p className={`font-medium mt-0.5 ${config.color}`}>
            {plan.estado_financiero || config.label}
          </p>
        </div>
      </div>

      {plan.presupuesto_total && (
        <p className="text-xs text-muted-foreground mt-2">
          Presupuesto: {formatCurrency(plan.presupuesto_total)}
        </p>
      )}
      {!plan.presupuesto_total && (
        <p className="text-xs text-muted-foreground mt-2 italic">Presupuesto vacío</p>
      )}
    </motion.div>
  );
}

export default TratamientosTab;
