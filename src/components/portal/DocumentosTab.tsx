import { motion } from 'framer-motion';
import { FileText, Download, FileCheck, FileClock, File, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface Documento {
  id: string;
  nombre: string;
  tipo: 'archivo_clinico' | 'consentimiento';
  url?: string | null;
  fecha: string;
  estado?: string;
  version?: string;
}

interface DocumentosTabProps {
  documentos: Documento[];
  isLoading: boolean;
}

const getIconForType = (tipo: string) => {
  if (tipo === 'consentimiento') return <ShieldCheck className="h-4 w-4 text-primary" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
};

const getTypeLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    'archivo_clinico': 'Archivo clínico',
    'consentimiento': 'Consentimiento',
    'receta': 'Receta',
    'radiografia': 'Radiografía',
    'informe': 'Informe',
  };
  return labels[tipo] || 'Documento';
};

const DocumentosTab = ({ documentos, isLoading }: DocumentosTabProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const consentimientos = documentos.filter(d => d.tipo === 'consentimiento');
  const archivos = documentos.filter(d => d.tipo !== 'consentimiento');

  if (documentos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Sin documentos</h3>
          <p className="text-muted-foreground">
            Aún no tienes documentos disponibles para descargar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consentimientos informados */}
      {consentimientos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Consentimientos informados
              </CardTitle>
              <CardDescription>
                Documentos de consentimiento firmados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {consentimientos.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getIconForType(doc.tipo)}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {doc.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.fecha).toLocaleDateString('es-CL', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                          {doc.version && <span className="ml-2">· v{doc.version}</span>}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileCheck className="h-3 w-3" />
                      Firmado
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Archivos clínicos */}
      {archivos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                Archivos clínicos
              </CardTitle>
              <CardDescription>
                Recetas, radiografías e informes de tu ficha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {archivos.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getIconForType(doc.tipo)}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {doc.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.fecha).toLocaleDateString('es-CL', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {doc.url ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.url!, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <FileClock className="h-3 w-3" />
                        Disponible en clínica
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default DocumentosTab;
