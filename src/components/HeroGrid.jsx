import { useRef, useEffect } from "react";

export default function HeroGrid({ dark: d }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const SIZE = 64;
    const DURATION = 5.5; // seconds per ripple
    const PAUSE    = 1.2; // gap between ripples
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId, timeoutId;
    let ripple = null;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnRipple = () => {
      const COLS = Math.ceil(canvas.width  / SIZE);
      const ROWS = Math.ceil(canvas.height / SIZE);
      ripple = {
        col: Math.floor(Math.random() * COLS),
        row: Math.floor(Math.random() * ROWS),
        start: performance.now(),
      };
      timeoutId = setTimeout(spawnRipple, (DURATION + PAUSE) * 1000);
    };
    if (!reducedMotion) spawnRipple();

    const [cr, cg, cb] = d ? [0, 210, 115] : [0, 179, 105];

    const draw = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const COLS = Math.ceil(canvas.width / SIZE);
      const ROWS = Math.ceil(canvas.height / SIZE);

      // Grid lines
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${d ? 0.06 : 0.11})`;
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath(); ctx.moveTo(c * SIZE, 0); ctx.lineTo(c * SIZE, canvas.height); ctx.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx.beginPath(); ctx.moveTo(0, r * SIZE); ctx.lineTo(canvas.width, r * SIZE); ctx.stroke();
      }

      if (ripple) {
        const elapsed = (now - ripple.start) / 1000;
        const wave  = elapsed * 2.0;
        const fade  = Math.max(0, 1 - elapsed / DURATION);

        for (let row = 0; row < ROWS; row++) {
          for (let col = 0; col < COLS; col++) {
            const dist = Math.sqrt((col - ripple.col) ** 2 + (row - ripple.row) ** 2);

            // Ripple ring
            const diff = Math.abs(dist - wave);
            if (diff < 1.1) {
              const ring = (1 - diff / 1.1) ** 2;
              const a = ring * fade * (d ? 0.11 : 0.16);
              ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
              ctx.fillRect(col * SIZE + 1, row * SIZE + 1, SIZE - 1, SIZE - 1);
            }

            // Ambient occlusion — interior del anillo levemente oscurecido
            if (dist < wave - 0.5 && dist > 0.5) {
              const depth  = Math.min(1, dist / wave);
              const aoBase = (1 - depth) * 0.5 + 0.5 * depth;
              const ao = (1 - aoBase) * fade * (d ? 0.06 : 0.04);
              ctx.fillStyle = `rgba(0,0,0,${ao})`;
              ctx.fillRect(col * SIZE + 1, row * SIZE + 1, SIZE - 1, SIZE - 1);
            }
          }
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
      window.removeEventListener("resize", resize);
    };
  }, [d]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
