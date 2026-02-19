import { useEffect, useRef } from "react";

/**
 * DataGridCanvas
 * ──────────────────────────────────────────────────────────────────────────────
 * Red de constelación periférica con nodos gold metalizado.
 * Los nodos y líneas solo aparecen en los bordes del canvas,
 * dejando el centro libre para el texto del hero.
 * ──────────────────────────────────────────────────────────────────────────────
 */

interface Node {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  phase: number;
  driftSpeed: number;
  driftRadius: number;
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
    let nodes: Node[] = [];

    // ── Gold metallic palette ──────────────────────────────────────────────
    const GOLD_BRIGHT = "hsla(38, 60%, 58%, ";   // nodos brillantes
    const GOLD_LINE   = "hsla(38, 50%, 48%, ";    // líneas
    const GOLD_DOT    = "hsla(38, 40%, 45%, ";    // grid dots

    const GRID_SPACING = 64;
    const DOT_RADIUS = 0.6;
    const LINE_DIST = 200;
    const NODE_COUNT = 14;

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    // ── Place nodes only on edges (outside center text area) ──────────────
    const initNodes = () => {
      nodes = [];
      const cx = W / 2;
      const cy = H / 2;
      // Exclusion zone: center 50% width, 40% height
      const exW = W * 0.25;
      const exH = H * 0.2;

      for (let i = 0; i < NODE_COUNT; i++) {
        let x: number, y: number;
        let attempts = 0;
        do {
          // Bias towards edges
          const edge = Math.random();
          if (edge < 0.25) {
            // top strip
            x = Math.random() * W;
            y = Math.random() * H * 0.22;
          } else if (edge < 0.5) {
            // bottom strip
            x = Math.random() * W;
            y = H - Math.random() * H * 0.22;
          } else if (edge < 0.75) {
            // left strip
            x = Math.random() * W * 0.22;
            y = Math.random() * H;
          } else {
            // right strip
            x = W - Math.random() * W * 0.22;
            y = Math.random() * H;
          }
          attempts++;
        } while (
          Math.abs(x - cx) < exW && Math.abs(y - cy) < exH && attempts < 20
        );

        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: 1.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          driftSpeed: 0.0004 + Math.random() * 0.0006,
          driftRadius: 8 + Math.random() * 16,
        });
      }
    };

    // ── Subtle dot grid (very faint, periphery only) ─────────────────────
    const drawGrid = () => {
      const cols = Math.ceil(W / GRID_SPACING) + 1;
      const rows = Math.ceil(H / GRID_SPACING) + 1;
      const cx = W / 2;
      const cy = H / 2;
      const fadeW = W * 0.2;
      const fadeH = H * 0.18;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * GRID_SPACING;
          const y = r * GRID_SPACING;

          // Fade out towards center
          const dx = Math.abs(x - cx);
          const dy = Math.abs(y - cy);
          let fade = 1;
          if (dx < fadeW && dy < fadeH) {
            fade = Math.max(dx / fadeW, dy / fadeH);
            fade = fade * fade; // ease
          }

          const alpha = fade * 0.12;
          if (alpha < 0.01) continue;

          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = `${GOLD_DOT}${alpha})`;
          ctx.fill();
        }
      }
    };

    // ── Constellation network ────────────────────────────────────────────
    const drawNetwork = () => {
      // Update node positions (gentle orbital drift)
      nodes.forEach((n) => {
        n.x = n.baseX + Math.cos(t * n.driftSpeed + n.phase) * n.driftRadius;
        n.y = n.baseY + Math.sin(t * n.driftSpeed * 0.7 + n.phase) * n.driftRadius * 0.6;
      });

      // Draw connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < LINE_DIST) {
            const strength = 1 - dist / LINE_DIST;
            const alpha = strength * strength * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `${GOLD_LINE}${alpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw nodes with glow
      nodes.forEach((n) => {
        const pulse = Math.sin(t * 0.002 + n.phase) * 0.25 + 0.75;

        // Outer glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.size * 4);
        grad.addColorStop(0, `${GOLD_BRIGHT}${0.12 * pulse})`);
        grad.addColorStop(1, `${GOLD_BRIGHT}0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = `${GOLD_BRIGHT}${0.6 * pulse})`;
        ctx.fill();
      });
    };

    const loop = () => {
      t++;
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawNetwork();
      rafRef.current = requestAnimationFrame(loop);
    };

    resize();
    initNodes();
    rafRef.current = requestAnimationFrame(loop);

    const handleResize = () => {
      resize();
      initNodes();
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
      style={{ opacity: 0.85 }}
      aria-hidden
    />
  );
};

export default DataGridCanvas;
