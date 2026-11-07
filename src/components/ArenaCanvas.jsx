import { useEffect, useRef } from 'react';

/* Dibuja la "foto del mundo" que manda el servidor 15 veces por segundo en Caza de píxeles.
   Este componente NO calcula nada del juego: solo pinta lo que dice el servidor. */
export default function ArenaCanvas({ mundo, ancho = 1000, alto = 560, yo, grande = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, ancho, alto);
    // cuadrícula
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    for (let x = 0; x <= ancho; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, alto); ctx.stroke(); }
    for (let y = 0; y <= alto; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ancho, y); ctx.stroke(); }
    if (!mundo) return;
    // el píxel a cazar
    const [px, py] = mundo.pixel;
    ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = '#C6F33A'; ctx.shadowBlur = 24;
    ctx.fillRect(px - 12, py - 12, 24, 24); ctx.shadowBlur = 0;
    // jugadores: [nombre, x, y, color, atrapados]
    mundo.jugadores.forEach(([n, x, y, c, a]) => {
      ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, n === yo ? 20 : 16, 0, Math.PI * 2); ctx.fill();
      if (n === yo) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke(); }
      ctx.fillStyle = '#E8ECF2'; ctx.font = `600 ${grande ? 20 : 26}px "Space Grotesk", sans-serif`; ctx.textAlign = 'center';
      ctx.fillText(`${n} · ${a}`, x, y - 26);
    });
  }, [mundo, yo]);
  return <canvas ref={ref} width={ancho} height={alto} className={`arena-cv ${grande ? 'grande' : ''}`} aria-label="Arena de Caza de píxeles" />;
}
