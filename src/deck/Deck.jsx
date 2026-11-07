import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import Reveal from 'reveal.js';
import 'reveal.js/dist/reveal.css';
import { COLS } from './contenido.jsx';

/* Presentación 2D estilo slides.com (reveal.js): una columna por tema (→) y profundidad hacia abajo (↓).
   - onChange({h, v, f}) cada vez que cambia la diapositiva o un fragmento.
   - readOnly: el estudiante solo sigue al profesor (pos = {h, v, f}).
   - ref.go(h, v, f) para saltar desde el mapa.
   - M (mapa) lo maneja la página que contiene la presentación. */
export const COL_INDEX = Object.fromEntries(COLS.map((c, i) => [c.id, i]));

const Deck = forwardRef(function Deck({ onChange, readOnly = false, pos, start, active = true }, ref) {
  const host = useRef(null);
  const deck = useRef(null);
  const cb = useRef(onChange); cb.current = onChange;

  useImperativeHandle(ref, () => ({
    go: (h, v = 0, f) => deck.current?.slide(h, v, f),
    layout: () => deck.current?.layout(),
    indices: () => deck.current?.getIndices(),
  }));

  useEffect(() => {
    const d = new Reveal(host.current, {
      embedded: true, hash: false, history: false, width: 1600, height: 900, margin: 0.03, minScale: 0.1, maxScale: 2,
      controls: !readOnly, controlsTutorial: false, progress: true, center: false, transition: 'slide', backgroundTransition: 'fade',
      keyboard: !readOnly && active, keyboardCondition: null, touch: !readOnly, overview: !readOnly,
      slideNumber: readOnly ? false : 'h.v', viewDistance: 2, preloadIframes: null, navigationMode: 'default',
    });
    deck.current = d;
    if (!readOnly) window.__reveal = d; // ayuda para pruebas automáticas
    const emit = () => { const i = d.getIndices(); cb.current?.({ h: i.h, v: i.v || 0, f: i.f ?? -1 }); };
    d.initialize().then(() => {
      if (start) d.slide(start.h, start.v || 0, start.f);
      d.on('slidechanged', emit); d.on('fragmentshown', emit); d.on('fragmenthidden', emit);
      emit();
    });
    // Recalcular la escala cuando el contenedor cambia de tamaño (p. ej. al dejar de estar oculto).
    const ro = new ResizeObserver(() => { if (d.isReady()) d.layout(); });
    ro.observe(host.current);
    return () => { ro.disconnect(); try { d.destroy(); } catch { /* ya destruido */ } deck.current = null; };
  }, []);

  // El teclado solo mueve la presentación cuando está visible (no con el mapa, una pregunta o el panel abiertos).
  useEffect(() => {
    const d = deck.current;
    if (!readOnly && d?.isReady?.()) d.configure({ keyboard: active });
  }, [active, readOnly]);

  // Seguir al profesor (modo estudiante).
  useEffect(() => {
    const d = deck.current;
    if (!readOnly || !pos || !d?.isReady?.()) return;
    const i = d.getIndices();
    if (i.h !== pos.h || (i.v || 0) !== pos.v || (i.f ?? -1) !== pos.f) d.slide(pos.h, pos.v, pos.f);
  }, [pos?.h, pos?.v, pos?.f, readOnly]);

  // Las diapositivas no se vuelven a renderizar: reveal.js administra sus clases.
  const slides = useMemo(() => COLS.map((c) => (
    <section key={c.id} data-col={c.id}>
      {c.slides.map((s, j) => (
        <section key={j} className={`dslide ${c.kind || ''}`} data-background-color={c.bg || '#0B0D13'}><div className="dbody">{s}</div></section>
      ))}
    </section>
  )), []);

  return (
    <div className="reveal deck" ref={host}>
      <div className="slides">{slides}</div>
    </div>
  );
});

export default Deck;
