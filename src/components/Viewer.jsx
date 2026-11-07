import { useState } from 'react';
import Deck from '../deck/Deck.jsx';
import { COLS, TEMA_COL } from '../deck/contenido.jsx';
import { TEMA } from '../data/temas.js';

/* Presentación para repasar (sin conexión en vivo). ?t=t3 abre un tema. */
export default function Viewer() {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const [start] = useState(() => ({ h: TEMA_COL[params.get('t')] ?? 0, v: 0 }));
  const [pos, setPos] = useState(start);
  const col = COLS[pos.h];
  return (
    <div className="viewer">
      <div className="viewer-stage"><Deck start={start} onChange={setPos} /></div>
      <nav className="ctrl">
        <span className="mono cnum">{col?.tema ? `Tema ${TEMA[col.tema].n} · ${TEMA[col.tema].titulo}` : col?.titulo} · {pos.h + 1}.{pos.v + 1}</span>
        <span className="grow" />
        <a className="cbtn" href="#/vivo">Ir a En vivo</a>
        <button className="cbtn" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} aria-label="Pantalla completa">⛶</button>
      </nav>
    </div>
  );
}
