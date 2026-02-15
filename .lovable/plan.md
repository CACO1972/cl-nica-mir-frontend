
## Agregar flecha de retroceso en el header de todas las paginas internas

### Problema
Las paginas `/evaluation`, `/segunda-opinion`, `/regional` y `/portal` no tienen un boton visible para volver atras. Solo esta el logo, pero no es intuitivo para todos los usuarios.

### Solucion
Agregar un icono de flecha (`ArrowLeft` de Lucide) a la izquierda del logo en el header de todas las paginas internas. Al hacer clic, navega a la pagina anterior o al inicio (`/`).

### Paginas a modificar

1. **`src/pages/Evaluation.tsx`** - Tiene 2 headers (uno para el wizard activo, otro para la pagina principal). Agregar flecha en ambos.
2. **`src/pages/SecondOpinion.tsx`** - Mismo patron, 2 headers.
3. **`src/pages/Regional.tsx`** - Mismo patron, 2 headers.
4. **`src/components/portal/PortalHeader.tsx`** - Header del portal paciente.

### Implementacion

- Importar `ArrowLeft` de `lucide-react` y `useNavigate` (donde no exista)
- Colocar el icono antes del logo, dentro del mismo `flex` container
- Estilo: `text-muted-foreground hover:text-gold transition-colors` para mantener la estetica editorial
- Accion: `navigate(-1)` para volver a la pagina anterior (comportamiento natural de navegacion)
- Tamano del icono: `h-5 w-5` para que sea visible sin ser invasivo

### Detalles tecnicos

Ejemplo del cambio en cada header:

```text
Antes:  [Logo]                    [EN] [Night] [Menu]
Despues: [<-] [Logo]              [EN] [Night] [Menu]
```

La flecha usa `navigate(-1)` del hook `useNavigate` de react-router-dom, lo que permite volver a la pagina desde donde se llego (no siempre al inicio).
