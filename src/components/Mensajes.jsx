import { useEffect, useState } from 'react';
import { useConexion, CODIGOS } from '../lib/conexion.js';

/* Lista de mensajes enviados (↑) y recibidos (↓), como la pestaña Messages de DevTools. */
export default function Mensajes({ max = 30 }) {
  const c = useConexion();
  return (
    <div className="msglog">
      <p className="mono msglog-h">{c.url} · {c.fase}{c.cierre ? ` · último cierre ${c.cierre.codigo} (${CODIGOS[c.cierre.codigo] || c.cierre.razon || '—'})` : ''}</p>
      {c.log.slice(0, max).map((m, i) => (
        <div key={m.t + '-' + i} className={`msg ${m.dir === '↑' ? 'up' : 'down'}`}>
          <span className="mono dir">{m.dir}</span><code>{m.texto}</code>
        </div>
      ))}
      {!c.log.length && <p className="note">Todavía no hay mensajes.</p>}
    </div>
  );
}

/** Indicador del estado de la conexión. */
export function EstadoConexion() {
  const c = useConexion();
  const [, tic] = useState(0);
  useEffect(() => { if (c.fase !== 'esperando') return; const id = setInterval(() => tic((x) => x + 1), 500); return () => clearInterval(id); }, [c.fase]);
  const txt = { terminada: 'Clase terminada', conectado: 'Conectado', conectando: 'Conectando…', reconectando: 'Reconectando…', desconectado: 'Desconectado',
    esperando: `Sin conexión · reintento en ${Math.max(0, Math.ceil(((c.siguienteEn || 0) - Date.now()) / 1000))} s` }[c.fase];
  return <span className={`estado mono ${c.fase}`} title={c.url}><i />{txt}</span>;
}
