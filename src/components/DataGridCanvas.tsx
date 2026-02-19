import { useEffect, useRef } from "react";

/**
 * DataGridCanvas
 * ──────────────────────────────────────────────────────────────────────────────
 * Grandes líneas geométricas doradas que cruzan la pantalla con movimiento
 * lento y orgánico. Inspirado en charlesleclerc.com: formas GRANDES, visibles,
 * imposibles de ignorar. Zona central libre para texto.
 * ──────────────────────────────────────────────────────────────────────────────
 */

interface Beam {
  x1: number; y1: number;
  x2: number; y2: number;
  width: number;
  speed: number;
  offset: number;
  opacity: number;
  length: number;
}

const DataGridCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let t = 0;
    let beams: Beam[] = [];
    let dpr = 1;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initBeams = () => {
      beams = [];
      const count = W < 600 ? 5 : 8;

      for (let i = 0; i < count; i++) {
        const angle = -15 + Math.random() * 30; // slight diagonal
        const rad = (angle * Math.PI) / 180;
        const len = W * (0.3 + Math.random() * 0.5);
        const isTop = i % 2 === 0;
        
        // Position beams in periphery — top/bottom thirds
        let startX: number, startY: number;
        if (isTop) {
          startX = Math.random() * W * 1.2 - W * 0.1;
          startY = Math.random() * H * 0.28;
        } else {
          startX = Math.random() * W * 1.2 - W * 0.1;
          startY = H - Math.random() * H * 0.28;
        }

        beams.push({
          x1: startX,
          y1: startY,
          x2: startX + Math.cos(rad) * len,
          y2: startY + Math.sin(rad) * len,
          width: 1.5 + Math.random() * 3,
          speed: 0.0002 + Math.random() * 0.0004,
          offset: Math.random() * Math.PI * 2,
          opacity: 0.15 + Math.random() * 0.25,
          length: len,
        });
      }
    };

    // ── Draw a single glowing beam ──────────────────────────────────────
    const drawBeam = (beam: Beam) => {
      const pulse = Math.sin(t * beam.speed * 3 + beam.offset) * 0.3 + 0.7;
      const alpha = beam.opacity * pulse;

      // Drift position slowly
      const driftX = Math.sin(t * beam.speed + beam.offset) * 30;
      const driftY = Math.cos(t * beam.speed * 0.7 + beam.offset) * 15;

      const x1 = beam.x1 + driftX;
      const y1 = beam.y1 + driftY;
      const x2 = beam.x2 + driftX;
      const y2 = beam.y2 + driftY;

      // Outer glow (wide, soft)
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(38, 55%, 55%, ${alpha * 0.3})`;
      ctx.lineWidth = beam.width * 6;
      ctx.lineCap = "round";
      ctx.stroke();

      // Mid glow
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(38, 60%, 58%, ${alpha * 0.5})`;
      ctx.lineWidth = beam.width * 2.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Core line (bright, sharp)
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(38, 65%, 65%, ${alpha})`;
      ctx.lineWidth = beam.width;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    // ── Accent nodes at beam intersections ──────────────────────────────
    const drawAccentNodes = () => {
      // Place glowing dots at beam endpoints
      beams.forEach((beam) => {
        const pulse = Math.sin(t * 0.003 + beam.offset) * 0.4 + 0.6;
        const driftX = Math.sin(t * beam.speed + beam.offset) * 30;
        const driftY = Math.cos(t * beam.speed * 0.7 + beam.offset) * 15;

        [
          { x: beam.x1 + driftX, y: beam.y1 + driftY },
          { x: beam.x2 + driftX, y: beam.y2 + driftY },
        ].forEach((pt) => {
          // Skip if in center exclusion zone
          const cx = W / 2;
          const cy = H / 2;
          if (Math.abs(pt.x - cx) < W * 0.22 && Math.abs(pt.y - cy) < H * 0.2) return;

          // Outer glow
          const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 12);
          grad.addColorStop(0, `hsla(38, 60%, 60%, ${0.4 * pulse})`);
          grad.addColorStop(1, `hsla(38, 60%, 60%, 0)`);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(38, 65%, 70%, ${0.7 * pulse})`;
          ctx.fill();
        });
      });
    };

    // ── Subtle connecting lines between nearby endpoints ────────────────
    const drawConnections = () => {
      const points: { x: number; y: number }[] = [];
      beams.forEach((beam) => {
        const driftX = Math.sin(t * beam.speed + beam.offset) * 30;
        const driftY = Math.cos(t * beam.speed * 0.7 + beam.offset) * 15;
        points.push(
          { x: beam.x1 + driftX, y: beam.y1 + driftY },
          { x: beam.x2 + driftX, y: beam.y2 + driftY }
        );
      });

      ctx.lineWidth = 0.8;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            const strength = 1 - dist / 250;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.strokeStyle = `hsla(38, 50%, 50%, ${strength * 0.12})`;
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      beams.forEach(drawBeam);
      drawAccentNodes();
      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    initBeams();
    rafRef.current = requestAnimationFrame(loop);

    const handleResize = () => {
      resize();
      initBeams();
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
      style={{ opacity: 1 }}
      aria-hidden
    />
  );
};

export default DataGridCanvas;
