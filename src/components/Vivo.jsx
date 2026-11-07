import { useEffect, useRef, useState } from 'react';
import { conectar, desconectar, enviar, rafaga, useClase, useConexion, CODIGOS } from '../lib/conexion.js';
import { store, celebrate } from '../lib/fx.js';
import ArenaCanvas from './ArenaCanvas.jsx';
import Mensajes, { EstadoConexion } from './Mensajes.jsx';

/* Página del ESTUDIANTE: el celular queda conectado por WebSocket al servidor Java de la clase. */
const LETRAS = ['A', 'B', 'C', 'D'];
const EMOJIS = ['👍', '🔥', '🤯', '❓', '🚀'];

export function useCuenta(desde, segundos) {
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setAhora(Date.now()), 250); return () => clearInterval(id); }, [desde]);
  return Math.max(0, Math.ceil(segundos - (ahora - desde) / 1000));
}

export function BarraLote({ lote, onCancelar }) {
  if (!lote) return null;
  const pct = lote.total ? Math.round((lote.hechas * 100) / lote.total) : 0;
  const fin = lote.evento === 'LoteCompletado' || lote.evento === 'LoteCancelado';
  return (
    <div className={`lote ${lote.evento}`}>
      <div className="lote-h"><b className="mono">{lote.loteId}</b><span className="mono">{lote.evento}{lote.por ? ` por ${lote.por}` : ''}</span></div>
      <div className="lote-barra"><i style={{ width: `${pct}%` }} /></div>
      <p className="mono">{lote.hechas} / {lote.total} fotos procesadas por el Digester · {pct} %</p>
      {!fin && onCancelar && <button className="btn danger" onClick={onCancelar}>Cancelar lote</button>}
    </div>
  );
}

function Pregunta({ p, onResponder, mia }) {
  const resta = useCuenta(p.recibidaEn, p.segundos);
  return (
    <div className="qcard">
      <div className="qhead"><span className="chip">Actividad {p.actividad}</span><span className="chip mono">{resta > 0 ? `${resta} s` : 'Tiempo'}</span></div>
      <h2 className="qtext">{p.texto}</h2>
      <div className="tiles">
        {p.opciones.map((o, i) => (
          <button key={i} className={`tile t${LETRAS[i]} ${mia === i ? 'picked' : mia != null ? 'dim' : ''}`} disabled={mia != null || resta === 0} onClick={() => onResponder(i)}>
            <span className="L">{LETRAS[i]}</span><span>{o}</span>
          </button>
        ))}
      </div>
      {mia != null && <p className="note center-t">Respuesta enviada. Espera a que el profesor la revele.</p>}
    </div>
  );
}

function Control({ yo }) {
  const dir = useRef('0,0');
  const mover = (dx, dy) => { const k = `${dx},${dy}`; if (k === dir.current) return; dir.current = k; enviar({ tipo: 'mover', dx, dy }); };
  useEffect(() => {
    const K = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    const down = (e) => { if (K[e.key]) { e.preventDefault(); mover(...K[e.key]); } };
    const up = (e) => { if (K[e.key]) mover(0, 0); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
  const B = ({ dx, dy, children, cls }) => (
    <button className={`pad ${cls}`} aria-label={children} onPointerDown={(e) => { e.preventDefault(); mover(dx, dy); }}
      onPointerUp={() => mover(0, 0)} onPointerLeave={() => mover(0, 0)} onPointerCancel={() => mover(0, 0)} onContextMenu={(e) => e.preventDefault()}>{children}</button>
  );
  return (
    <div className="control">
      <p className="note center-t">Mantén presionada una flecha. Tu celular solo envía la <b>intención</b>; el servidor mueve tu punto ({yo}).</p>
      <div className="dpad"><B dx={0} dy={-1} cls="up">▲</B><B dx={-1} dy={0} cls="left">◀</B><B dx={1} dy={0} cls="right">▶</B><B dx={0} dy={1} cls="down">▼</B></div>
    </div>
  );
}

export default function Vivo() {
  const [nombre, setNombre] = useState(() => store.get('pixpro7-nombre') || '');
  const [dentro, setDentro] = useState(false);
  const [c, setC] = useClase();
  const con = useConexion();
  const [verMsgs, setVerMsgs] = useState(false);

  const entrar = (e) => {
    e?.preventDefault();
    const n = nombre.trim().slice(0, 20);
    if (!n) return;
    store.set('pixpro7-nombre', n);
    setDentro(true);
    conectar({ tipo: 'hola', rol: 'estudiante', nombre: n });
  };
  useEffect(() => { if (store.get('pixpro7-nombre')) entrar(); return () => desconectar(); }, []);
  useEffect(() => { if (c.acerto && c.resultado) celebrate(); }, [c.resultado]);
  useEffect(() => { if (c.atrapado && c.atrapado.nombre === c.yo?.nombre) celebrate(); }, [c.atrapado]);

  if (!dentro) {
    return (
      <div className="page center-page">
        <form className="panel narrow" onSubmit={entrar}>
          <p className="eyebrow">PixPro en vivo · DS5 Semana 7</p>
          <h1 className="h-lg">Conéctate a la clase</h1>
          <p className="exp">Tu celular abrirá una conexión WebSocket con el servidor Java de la clase y se quedará abierta.</p>
          <div className="field"><label htmlFor="nom">Tu nombre o apodo</label><input id="nom" maxLength={20} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="p. ej. Digester_Ninja" autoFocus /></div>
          <button className="btn" disabled={!nombre.trim()}>Conectarme</button>
        </form>
      </div>
    );
  }

  const p = c.pregunta, r = c.resultado;
  const jugando = c.juego?.estado === 'jugando';
  const rechazado = con.fase === 'desconectado' && con.cierre?.codigo === 1008;
  let cuerpo;
  if (rechazado) {
    cuerpo = <div className="qcard center-t"><p className="big bad">1008</p><h2>El servidor cerró tu conexión</h2><p className="exp">{con.cierre.razon || CODIGOS[1008]}. Así se protege el servidor de un cliente que se porta mal.</p><button className="btn" onClick={entrar}>Volver a conectarme</button></div>;
  } else if (p && r && r.id === p.id) {
    cuerpo = (
      <div className="qcard">
        <p className={`big ${c.acerto ? 'ok' : 'bad'}`}>{c.acerto ? '¡Correcto!' : c.miRespuesta == null ? 'Sin respuesta' : 'Esta vez no'}</p>
        <h2 className="qtext small">{p.texto}</h2>
        <p className="ok"><b>Respuesta: {LETRAS[r.correcta]} · {p.opciones[r.correcta]}</b></p>
        <p className="exp">{r.explicacion}</p>
        <p className="note mono">Tu total: {c.puntos} pts</p>
      </div>
    );
  } else if (p) {
    cuerpo = <Pregunta p={p} mia={c.miRespuesta} onResponder={(i) => { if (enviar({ tipo: 'respuesta', id: p.id, opcion: i })) setC((s) => ({ ...s, miRespuesta: i })); }} />;
  } else if (jugando) {
    cuerpo = <><ArenaCanvas mundo={c.mundo} yo={c.yo?.nombre} /><Control yo={c.yo?.nombre} /></>;
  } else if (c.juego?.estado === 'terminado') {
    cuerpo = <div className="qcard center-t"><p className="eyebrow">Caza de píxeles terminó</p><h2>{c.juego.ganador ? `Ganó ${c.juego.ganador}` : 'Nadie atrapó un píxel'}</h2><p className="exp">Mira la pantalla del salón.</p></div>;
  } else {
    cuerpo = <div className="qcard center-t"><p className="eyebrow">Conectado y esperando</p><h2>Mira la pantalla del salón</h2><p className="exp">Cuando el profesor lance algo (un lote, el juego o una pregunta) te llegará aquí al instante, sin recargar.</p></div>;
  }

  return (
    <div className="page student vivo">
      <header className="sbar">
        <EstadoConexion />
        <span className="who">{c.yo?.nombre || nombre}</span>
        <span className="chip mono">{c.puntos} pts</span>
        <span className="chip mono">👥 {c.conectados}</span>
      </header>
      <main className="sbody">
        {c.error && <p className="note bad" role="alert">Servidor: {c.error}</p>}
        {cuerpo}
        {c.lote && !jugando && <BarraLote lote={c.lote} onCancelar={() => enviar({ tipo: 'cancelarLote' })} />}
        <div className="reacciones">
          {EMOJIS.map((e) => <button key={e} onClick={() => enviar({ tipo: 'reaccion', emoji: e })} aria-label={`Reaccionar ${e}`}>{e}</button>)}
        </div>
        <div className="row-btns">
          <button className="btn ghost" onClick={() => setVerMsgs(!verMsgs)}>{verMsgs ? 'Ocultar mensajes' : 'Ver mensajes (como DevTools)'}</button>
        </div>
        {verMsgs && <Mensajes />}
        <details className="lab">
          <summary>Laboratorio de seguridad (tema 4)</summary>
          <p className="exp">Simula un cliente tramposo: manda 30 mensajes en el mismo instante. El servidor permite 15 por segundo.</p>
          <button className="btn danger" onClick={() => rafaga(30)}>Enviar 30 mensajes de golpe</button>
        </details>
      </main>
    </div>
  );
}
