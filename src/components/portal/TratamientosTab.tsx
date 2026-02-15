import { motion } from 'framer-motion';
import { Stethoscope, CheckCircle2, Clock, AlertCircle, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Tratamiento {
  nombre: string;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  profesional?: string;
  descripcion?: string;
  piezas?: string;
}

interface TratamientosTabProps {
  tratamientos: Tratamiento[];
  isLoading: boolean;
}

const getEstadoConfig = (estado: string) => {
  const lower = estado.toLowerCase();
  if (lower.includes('complet') || lower.includes('termin') || lower.includes('finaliz'))
    return { label: 'Completado', variant: 'secondary' as const, icon: <CheckCircle2 className="h-3 w-3" /> };
  if (lower.includes('curso') || lower.includes('activ') || lower.includes('progress'))
    return { label: 'En curso', variant: 'default' as const, icon: <Activity className="h-3 w-3" /> };
  if (lower.includes('pend') || lower.includes('planific'))
    return { label: 'Planificado', variant: 'outline' as const, icon: <Clock className="h-3 w-3" /> };
  if (lower.includes('cancel'))
    return { label: 'Cancelado', variant: 'destructive' as const, icon: <AlertCircle className="h-3 w-3" /> };
  return { label: estado || 'Sin estado', variant: 'outline' as const, icon: <Clock className="h-3 w-3" /> };
};

const TratamientosTab = ({ tratamientos, isLoading }: TratamientosTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tratamientos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Sin tratamientos</h3>
          <p className="text-muted-foreground">
            Aún no tienes tratamientos registrados en tu ficha clínica
          </p>
        </CardContent>
      </Card>
    );
  }

  const enCurso = tratamientos.filter(t => {
    const lower = (t.estado || '').toLowerCase();
    return lower.includes('curso') || lower.includes('activ') || lower.includes('progress');
  });
  const otros = tratamientos.filter(t => !enCurso.includes(t));

  return (
    <div className="space-y-6">
      {enCurso.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">En curso</p>
          <div className="space-y-3">
            {enCurso.map((tto, index) => {
              const config = getEstadoConfig(tto.estado);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            {tto.nombre}
                          </CardTitle>
                          {tto.profesional && (
                            <CardDescription className="mt-1">
                              Dr. {tto.profesional}
                            </CardDescription>
                          )}
                        </div>
                        <Badge variant={config.variant} className="flex items-center gap-1">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {tto.descripcion && (
                        <p className="text-sm text-muted-foreground">{tto.descripcion}</p>
                      )}
                      {tto.piezas && (
                        <p className="text-xs text-muted-foreground mt-1">Piezas: {tto.piezas}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        {tto.fecha_inicio && (
                          <span>Inicio: {new Date(tto.fecha_inicio).toLocaleDateString('es-CL')}</span>
                        )}
                        {tto.fecha_fin && (
                          <span>Fin est.: {new Date(tto.fecha_fin).toLocaleDateString('es-CL')}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {otros.length > 0 && (
        <div>
          {enCurso.length > 0 && (
            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase mb-3">Historial</p>
          )}
          <div className="space-y-3">
            {otros.map((tto, index) => {
              const config = getEstadoConfig(tto.estado);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{tto.nombre}</CardTitle>
                        <Badge variant={config.variant} className="flex items-center gap-1">
                          {config.icon}
                          {config.label}
                        </Badge>
                      </div>
                      {tto.profesional && (
                        <CardDescription>Dr. {tto.profesional}</CardDescription>
                      )}
                    </CardHeader>
                    {(tto.descripcion || tto.piezas) && (
                      <CardContent className="pt-0">
                        {tto.descripcion && (
                          <p className="text-sm text-muted-foreground">{tto.descripcion}</p>
                        )}
                        {tto.piezas && (
                          <p className="text-xs text-muted-foreground mt-1">Piezas: {tto.piezas}</p>
                        )}
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TratamientosTab;
