import { useEffect, useMemo, useRef, useState } from 'react';
import { conectar, desconectar, enviar, useClase, useConexion, CODIGOS } from '../lib/conexion.js';
import { celebrate } from '../lib/fx.js';
import Deck from '../deck/Deck.jsx';
import { COLS } from '../deck/contenido.jsx';
import { TEMA } from '../data/temas.js';
import ArenaCanvas from './ArenaCanvas.jsx';
import Mensajes, { EstadoConexion } from './Mensajes.jsx';
import { BarraLote, useCuenta } from './Vivo.jsx';

/* Página del PROFESOR: la presentación + el control de la clase en vivo.
   Todo lo que hace este panel es mandar mensajes JSON al servidor Java por la MISMA conexión WebSocket. */
const LETRAS = ['A', 'B', 'C', 'D'];

function Login({ onEntrar, error }) {
  const [clave, setClave] = useState('');
  return (
    <form className="panel narrow" onSubmit={(e) => { e.preventDefault(); if (clave) onEntrar(clave); }}>
      <p className="eyebrow">Acceso del profesor</p>
      <h1 className="h-lg">Iniciar la clase en vivo</h1>
      <p className="exp">La clave se revisa en el servidor Java (variable de entorno PROFESOR_CLAVE en Render). No está escrita en el código de esta página.</p>
      <div className="field"><label htmlFor="clave">Clave del profesor</label><input id="clave" type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} /></div>
      <button className="btn" disabled={!clave}>Conectar</button>
      {error && <p className="note bad" role="alert">{error}</p>}
      <p className="note"><a href="#/">← Volver al inicio</a></p>
      <p className="note">Si el servidor de Render estaba dormido, la primera conexión puede tardar hasta un minuto: la página reintenta sola.</p>
    </form>
  );
}

function PreguntaGrande({ p, conteo, conectados }) {
  const resta = useCuenta(p.recibidaEn, p.segundos);
  return (
    <div className="qcard big">
      <div className="qhead"><span className="chip">Actividad {p.actividad}</span><span className="chip mono">{resta > 0 ? `${resta} s` : 'Tiempo'}</span>
        <span className="chip mono">{conteo?.respondieron || 0}/{conectados} respondieron</span></div>
      <div className="timer"><i style={{ transform: `scaleX(${resta / p.segundos})` }} /></div>
      <h2 className="qtext">{p.texto}</h2>
      <div className="tiles">{p.opciones.map((o, i) => <div key={i} className={`tile t${LETRAS[i]}`}><span className="L">{LETRAS[i]}</span><span>{o}</span></div>)}</div>
      <p className="note center-t">Responde en tu celular · {location.origin + location.pathname}#/vivo</p>
    </div>
  );
}

function Resultado({ p, r }) {
  const n = r.votos.reduce((a, b) => a + b, 0);
  return (
    <div className="qcard big reveal">
      <div className="qhead"><span className="chip">Actividad {p.actividad}</span><span className="chip mono">{n} respuestas · {r.votos[r.correcta]} correctas</span></div>
      <h2 className="qtext small">{p.texto}</h2>
      <div className="dist">
        {p.opciones.map((o, i) => (
          <div key={i} className={`dbar ${i === r.correcta ? 'right' : ''}`}>
            <span className="mono">{LETRAS[i]}</span>
            <div className="tr"><i style={{ width: `${n ? (r.votos[i] * 100) / n : 0}%`, background: `var(--tile${LETRAS[i]})` }} /><span className="lbl">{o}</span></div>
            <span className="mono">{r.votos[i]}{i === r.correcta ? ' ✓' : ''}</span>
          </div>
        ))}
      </div>
      <p className="exp">{r.explicacion}</p>
    </div>
  );
}

export function Podio({ top, titulo = 'Podio de la clase' }) {
  const slots = [[1, 'var(--tileB)', 170], [0, 'var(--tileC)', 230], [2, 'var(--tileA)', 130]];
  return (
    <div className="qcard">
      <h2 className="center-t">{titulo}</h2>
      <div className="podium">{slots.map(([k, bg, h]) => <div key={k} className="pod" style={{ background: bg, height: h }}>{top[k] ? <><span className="p mono">{k + 1}</span><span>{top[k].nombre}</span><span className="mono">{top[k].puntos}</span></> : <span className="mono">—</span>}</div>)}</div>
      <div className="board">{top.slice(3, 10).map((x, i) => <div key={x.nombre} className="lrow"><span className="r mono">#{i + 4}</span><span className="nm">{x.nombre}</span><span className="s mono">{x.puntos}</span></div>)}</div>
    </div>
  );
}

function Reacciones({ lista }) {
  return <div className="flota" aria-hidden="true">{lista.slice(-14).map((r) => <span key={r.id} style={{ left: `${10 + ((r.id * 1000) % 80)}%` }}>{r.emoji}<small>{r.de}</small></span>)}</div>;
}

export default function Profesor() {
  const con = useConexion();
  const [c] = useClase();
  const [entrando, setEntrando] = useState(false);
  const [escena, setEscena] = useState(null); // null | 'pregunta' | 'resultado' | 'juego' | 'ranking'
  const [panel, setPanel] = useState(false);
  const [pos, setPos] = useState({ h: 0, v: 0 });
  const deck = useRef(null);

  const dentro = c.yo?.rol === 'profesor'; // si se cae la red, se queda en la clase y reconecta solo
  const errorLogin = con.cierre?.codigo === 1008 ? 'Clave incorrecta (el servidor cerró con 1008).' : null;
  useEffect(() => () => desconectar(), []);
  useEffect(() => { if (c.resultado) celebrate(); }, [c.resultado]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest('input,textarea')) return;
      if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setPanel((x) => !x); } // C = control (V, B y . pausan reveal.js)
      if (e.key === 'Escape') setEscena(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const porAct = useMemo(() => {
    const g = {};
    c.preguntas.forEach((p) => { (g[p.actividad] ||= []).push(p); });
    return g;
  }, [c.preguntas]);

  if (!dentro) {
    return (
      <div className="page center-page">
        <Login error={entrando && errorLogin} onEntrar={(clave) => { setEntrando(true); conectar({ tipo: 'hola', rol: 'profesor', clave }); }} />
        {entrando && !errorLogin && <p className="note center-t"><EstadoConexion /> {con.url}</p>}
      </div>
    );
  }

  const col = COLS[pos.h];
  const act = col?.act;
  const p = c.pregunta;
  const lista = p ? porAct[p.actividad] || [] : [];
  const iSig = p ? lista.findIndex((x) => x.id === p.id) + 1 : 0;
  const jugando = c.juego?.estado === 'jugando';

  const lanzar = (id) => { enviar({ tipo: 'lanzar', id }); setEscena('pregunta'); setPanel(false); };
  const revelar = () => { enviar({ tipo: 'revelar' }); setEscena('resultado'); };
  const juego = (on) => { enviar({ tipo: on ? 'iniciarJuego' : 'detenerJuego' }); setEscena('juego'); setPanel(false); };
  const podio = () => { enviar({ tipo: 'ranking' }); setEscena('ranking'); };
  const finalizar = () => {
    if (!confirm('¿Finalizar la sesión? Se desconecta a todos los estudiantes, cada uno ve su resultado final y los puntos se reinician.')) return;
    enviar({ tipo: 'finalizar' }); setEscena('fin'); setPanel(false);
  };
  const salir = () => { desconectar(); document.exitFullscreen?.().catch(() => {}); location.hash = '#/'; };

  let over = null;
  if (escena === 'pregunta' && p && !(c.resultado && c.resultado.id === p.id)) over = <PreguntaGrande p={p} conteo={c.conteo} conectados={c.conectados} />;
  else if ((escena === 'resultado' || escena === 'pregunta') && p && c.resultado?.id === p.id) over = <Resultado p={p} r={c.resultado} />;
  else if (escena === 'juego') {
    over = (
      <div className="escena-juego">
        <div className="juego-h"><h2>Caza de píxeles</h2><span className="mono">{c.mundo?.jugadores.length || 0} jugadores · 15 fotos del mundo por segundo</span>
          {c.juego?.estado === 'terminado' && <b className="ok">{c.juego.ganador ? `¡Ganó ${c.juego.ganador}!` : 'Terminado'}</b>}</div>
        <ArenaCanvas mundo={c.mundo} grande />
        <p className="note mono">Entra en {location.origin + location.pathname}#/vivo · el servidor decide las posiciones; los celulares solo mandan flechas</p>
      </div>
    );
  } else if (escena === 'ranking') over = <Podio top={c.ranking} />;
  else if (escena === 'fin') over = (
    <div className="fin-sesion">
      <Podio top={c.fin?.top || c.ranking} titulo="Sesión finalizada · podio final" />
      <p className="note center-t">Todos los estudiantes recibieron su resultado y se cerraron sus conexiones (código 1000). Los puntos ya se reiniciaron.</p>
    </div>
  );

  return (
    <div className="presenter">
      <div className="pin-badge"><EstadoConexion /><span className="mono">👥 {c.conectados}</span></div>
      <div className="present-area">
        <div className="host-stage"><Deck ref={deck} start={{ h: 0, v: 0 }} onChange={setPos} active={!over && !panel} /></div>
        {over && <div className="host-game">{over}</div>}
        {c.lote && !over && <div className="lote-flota"><BarraLote lote={c.lote} /></div>}
        <Reacciones lista={c.reacciones} />
      </div>

      <nav className="ctrl" aria-label="Controles del profesor">
        {!over && <span className="mono cnum">{col?.tema ? `Tema ${TEMA[col.tema].n} · ${TEMA[col.tema].corto}` : col?.titulo} · {pos.h + 1}.{pos.v + 1}</span>}
        {!over && act && porAct[act] && <button className="btn" onClick={() => lanzar(porAct[act][0].id)}>Lanzar actividad {act}</button>}
        {!over && col?.lote && <button className="btn" onClick={() => enviar({ tipo: 'iniciarLote', fotos: 450 })}>Iniciar lote en vivo</button>}
        {!over && col?.juego && <button className="btn" onClick={() => juego(true)}>Iniciar Caza de píxeles</button>}
        {!over && col?.podio && <button className="btn" onClick={podio}>Mostrar podio</button>}
        {escena === 'pregunta' && p && c.resultado?.id !== p.id && <><span className="mono cnum">{c.conteo?.respondieron || 0}/{c.conectados} respondieron</span><button className="btn" onClick={revelar}>Revelar respuesta</button></>}
        {p && c.resultado?.id === p.id && over && (iSig < lista.length
          ? <button className="btn" onClick={() => lanzar(lista[iSig].id)}>Siguiente pregunta</button>
          : <button className="btn" onClick={() => setEscena(null)}>Volver a la presentación</button>)}
        {escena === 'juego' && (jugando ? <button className="btn danger" onClick={() => juego(false)}>Terminar juego</button> : <button className="btn" onClick={() => juego(true)}>Jugar otra vez</button>)}
        {over && escena !== 'fin' && <button className="cbtn" onClick={() => setEscena(null)}>Presentación (Esc)</button>}
        {escena === 'fin' && <button className="btn" onClick={salir}>Salir</button>}
        <span className="grow" />
        {escena !== 'fin' && <button className="cbtn fin-btn" onClick={finalizar}>Finalizar sesión</button>}
        <button className="cbtn" onClick={() => setPanel(!panel)} aria-expanded={panel}>Panel en vivo (C)</button>
        <button className="cbtn" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})} aria-label="Pantalla completa">⛶</button>
      </nav>

      {panel && (
        <aside className="drawer">
          <div className="drawer-h"><h3>Panel en vivo</h3><button className="cbtn" onClick={() => setPanel(false)}>Cerrar</button></div>
          <p className="note mono">{con.url} · {c.conectados} estudiantes conectados</p>
          <p className="eyebrow">Demostraciones</p>
          <div className="row-btns">
            <button className="btn" onClick={() => enviar({ tipo: 'iniciarLote', fotos: 450 })}>Iniciar lote (450 fotos)</button>
            <button className="btn" onClick={() => juego(!jugando)}>{jugando ? 'Terminar Caza de píxeles' : 'Iniciar Caza de píxeles'}</button>
            <button className="btn ghost" onClick={podio}>Podio</button>
          </div>
          {c.lote && <BarraLote lote={c.lote} />}
          <p className="eyebrow">Preguntas (las respuestas están solo en el servidor)</p>
          {Object.entries(porAct).map(([a, ps]) => (
            <div key={a} className="jump"><b className="mono">Actividad {a}</b>{ps.map((x) => <button key={x.id} className="qbtn" onClick={() => lanzar(x.id)}>{x.id} · {x.texto.slice(0, 70)}{x.texto.length > 70 ? '…' : ''}</button>)}</div>
          ))}
          {!c.preguntas.length && <p className="note bad">El servidor no tiene preguntas cargadas (falta el Secret File preguntas.json).</p>}
          <p className="eyebrow">Lo que mandan los estudiantes (trazas)</p>
          <div className="msglog">{c.trazas.map((t, i) => <div key={t.t + '-' + i} className="msg up"><span className="mono dir">{t.de}</span><code>{JSON.stringify(t.mensaje)}</code></div>)}
            {!c.trazas.length && <p className="note">Aún nada.</p>}</div>
          <p className="eyebrow">Mensajes de esta pestaña</p>
          <Mensajes max={20} />
          <div className="row-btns">
            <button className="btn danger" onClick={() => { if (confirm('¿Borrar todos los puntos de la clase?')) enviar({ tipo: 'reiniciar' }); }}>Reiniciar puntos</button>
          </div>
          <p className="note mono">Códigos de cierre: {Object.entries(CODIGOS).map(([k, v]) => `${k} ${v}`).join(' · ')}</p>
        </aside>
      )}
    </div>
  );
}
