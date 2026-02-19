import { useEffect, useRef } from "react";

/**
 * DataGridCanvas
 * ──────────────────────────────────────────────────────────────────────────────
 * Un canvas de fondo que renderiza:
 *  1. Una grilla de puntos uniformes que pulsan suavemente
 *  2. Unas pocas partículas flotantes que se conectan entre sí con líneas tenues
 *
 * Completamente CSS-token-aware: lee --gold y --foreground del root para mantenerse
 * coherente con el design system en ambos modos (light / dark).
 * ──────────────────────────────────────────────────────────────────────────────
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  size: number;
  pulseOffset: number;
}

const DataGridCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Leer colores del design system ─────────────────────────────────────
    const rootStyles = getComputedStyle(document.documentElement);
    const goldRaw = rootStyles.getPropertyValue("--gold").trim(); // "38 45% 50%"
    // Construimos los colores que necesitamos
    // gold con baja opacidad para la grilla
    const gridColor = `hsla(${goldRaw}, 0.18)`;
    const particleColor = `hsla(${goldRaw}, 0.55)`;
    const lineColor = `hsla(${goldRaw}, 0.08)`;

    // ── Configuración ──────────────────────────────────────────────────────
    const GRID_SPACING = 52;   // px entre puntos de la grilla
    const DOT_RADIUS = 0.9;    // radio base del punto
    const PARTICLE_COUNT = 18;
    const LINE_DIST = 160;     // distancia máxima para conectar partículas
    const CONNECT_HERO = true; // conectar también las partículas con los dots más cercanos

    // ── Estado ─────────────────────────────────────────────────────────────
    let particles: Particle[] = [];
    let W = 0;
    let H = 0;
    let t = 0;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const initParticles = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.18,
        opacity: 0.3 + Math.random() * 0.5,
        size: 1.2 + Math.random() * 1.4,
        pulseOffset: Math.random() * Math.PI * 2,
      }));
    };

    const drawGrid = () => {
      const cols = Math.ceil(W / GRID_SPACING) + 1;
      const rows = Math.ceil(H / GRID_SPACING) + 1;

      // Offset suave en el tiempo para que la grilla "respire"
      const breathe = Math.sin(t * 0.0008) * 0.3 + 0.7; // 0.4 → 1.0

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GRID_SPACING;
          const y = r * GRID_SPACING;

          // Pulso individual por dot usando su posición como semilla
          const phase = (c * 7 + r * 13) % (Math.PI * 2);
          const pulse = Math.sin(t * 0.0012 + phase) * 0.4 + 0.6;

          const alpha = pulse * breathe * 0.22;
          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${goldRaw}, ${alpha})`;
          ctx.fill();
        }
      }
    };

    const drawParticles = () => {
      // Actualizar posiciones
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Rebotar en bordes con margen
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
      });

      // Dibujar conexiones entre partículas
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < LINE_DIST) {
            const alpha = (1 - dist / LINE_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `hsla(${goldRaw}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Dibujar cada partícula
      particles.forEach((p) => {
        const pulse = Math.sin(t * 0.0015 + p.pulseOffset) * 0.3 + 0.7;
        const alpha = p.opacity * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${goldRaw}, ${alpha * 0.7})`;
        ctx.fill();
      });
    };

    const loop = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawParticles();
      rafRef.current = requestAnimationFrame(loop);
    };

    // ── Init ───────────────────────────────────────────────────────────────
    resize();
    initParticles();
    rafRef.current = requestAnimationFrame(loop);

    const handleResize = () => {
      resize();
      initParticles();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.9 }}
      aria-hidden
    />
  );
};

export default DataGridCanvas;
