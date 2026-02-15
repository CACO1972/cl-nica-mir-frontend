

## Destacar tarjetas de servicio con enlace

### Problema actual
Las tarjetas de la seccion "Tratamientos Exclusivos" (Bento Grid) no tienen enlaces ni indicacion visual de que se puede hacer clic. Los textos son pequenos y un usuario no tecnico no sabe que debe interactuar con ellas.

### Solucion

**1. Asignar enlaces a las tarjetas que correspondan**

Mapeo de servicios a rutas existentes:
- "Evaluacion Miro IA" (diagnostic) --> `/evaluation`
- "IA Predictiva" (ai) --> `/evaluation`
- "Agenda Inteligente" (scheduling) --> `/evaluation` (o WhatsApp/contacto)

Las tarjetas sin ruta (Estetica Dental, Prevencion, Atencion Integral) se mantienen sin enlace.

**2. Cambios visuales para tarjetas con enlace**

- Aumentar el tamano de los titulos en tarjetas con link (de `text-lg` a `text-xl lg:text-2xl` en normales, y de `text-2xl` a `text-3xl lg:text-4xl` en featured)
- Agregar un CTA visible al pie de la tarjeta: texto "Conocer mas -->" o "Iniciar evaluacion -->" con estilo `editorial-link` y color dorado
- Agregar `cursor-pointer` y un efecto hover sutil (borde dorado o elevacion con sombra)
- Envolver la tarjeta completa en un componente `<Link>` de react-router-dom

**3. Tarjetas sin enlace**

Se mantienen identicas, sin CTA ni efecto hover especial, para que el contraste visual deje claro cuales son interactivas.

### Detalles tecnicos

**Archivo a modificar:** `src/components/ServicesBento.tsx`

- Agregar propiedad `link` y `ctaLabel` opcionales al array `services`
- Importar `Link` de `react-router-dom`
- Condicionar el wrapper: si tiene `link`, usar `<Link to={...}>`, si no, usar `<div>`
- Agregar traducciones para los CTA labels (ej: `"services.diagnostic.cta": "Iniciar evaluacion"`)
- Aplicar clases diferenciadas: tarjetas con link reciben `hover:border-gold/60 hover:shadow-lg transition-all cursor-pointer` y un icono de flecha junto al CTA
