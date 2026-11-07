import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import json from 'highlight.js/lib/languages/json';
import http from 'highlight.js/lib/languages/http';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import QRCode from 'qrcode';
import { TEMA } from '../data/temas.js';

hljs.registerLanguage('java', java);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('http', http);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('dockerfile', dockerfile);
const BASE = import.meta.env.BASE_URL;

/** Encabezado de diapositiva: etiqueta del tema + título. */
export function T({ tema, eti, children, sub }) {
  const t = tema ? TEMA[tema] : null;
  return (
    <header className="d-head">
      <p className="d-eti" style={{ color: t?.color }}>{t ? `${t.n} · ${t.corto}` : ''}{eti ? `${t ? ' · ' : ''}${eti}` : ''}</p>
      <h2>{children}</h2>
      {sub && <p className="d-sub">{sub}</p>}
    </header>
  );
}

/** Portada de cada tema (columna). */
export function Portada({ tema, pregunta }) {
  const t = TEMA[tema];
  return (
    <div className="d-portada" style={{ '--c': t.color }}>
      <p className="d-num">{String(t.n).padStart(2, '0')}</p>
      <p className="d-eti">Tema {t.n} de 5 · {t.min} min</p>
      <h1>{t.titulo}</h1>
      <p className="d-preg">{pregunta}</p>
      <p className="d-nav mono">↓ profundizar · → siguiente tema</p>
    </div>
  );
}

/** Diagrama de Archify (se carga cuando la diapositiva está cerca). */
export function Arch({ src, h = 520, nota }) {
  return (
    <figure className="d-arch">
      <iframe data-src={`${BASE}diagramas/${src}.html`} title={`Diagrama ${src}`} style={{ height: h }} loading="lazy" />
      {nota && <figcaption>{nota} · <a href={`${BASE}diagramas/${src}.html`} target="_blank" rel="noreferrer">abrir en pantalla completa ↗</a></figcaption>}
    </figure>
  );
}

/** Código resaltado (Java por defecto). Si una línea no cabe, reduce la letra hasta que quepa (mínimo 12 px). */
export function Code({ children, small, lang = 'java', titulo }) {
  const html = hljs.highlight(children.trim(), { language: lang }).value;
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const fit = () => {
      if (!el.clientWidth) return;
      el.style.fontSize = '';
      let f = parseFloat(getComputedStyle(el).fontSize);
      while ((el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1) && f > 12) { f -= 0.5; el.style.fontSize = `${f}px`; }
    };
    const ro = new ResizeObserver(fit); ro.observe(el); fit();
    return () => ro.disconnect();
  }, []);
  return (
    <div className="d-codebox">
      {titulo && <p className="d-codetit mono">{titulo}</p>}
      <pre className={`d-code ${small ? 'sm' : ''}`}><code ref={ref} className="hljs" dangerouslySetInnerHTML={{ __html: html }} /></pre>
    </div>
  );
}

export function Cards({ cols = 2, children }) {
  return <div className="d-cards" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>{children}</div>;
}
export function Card({ t, c = '#C6F33A', children, frag }) {
  return <div className={`d-card ${frag ? 'fragment' : ''}`} style={{ borderTopColor: c }}><h3>{t}</h3><div>{children}</div></div>;
}

/** "¿Y en PixPro?": situaciones (izquierda) y lo que haría el equipo (derecha, fragmento). */
export function YPixPro({ tema, items, cierre }) {
  return (
    <>
      <T tema={tema} eti="¿Y en PixPro?">Llévalo a la arquitectura de PixPro</T>
      <div className="d-ypix">
        {items.map(([q, a], i) => (
          <div key={i} className="d-ypix-row">
            <div className="q"><span className="mono">¿Qué pasaría si…?</span>{q}</div>
            <div className="a fragment"><span className="mono">En PixPro…</span>{a}</div>
          </div>
        ))}
      </div>
      {cierre && <p className="d-capstone fragment"><b>Idea clave:</b> {cierre}</p>}
    </>
  );
}

/** Código QR de una URL del sitio. */
export function QR({ ruta, size = 260 }) {
  const url = `${location.origin}${location.pathname}${ruta}`;
  const [src, setSrc] = useState('');
  useEffect(() => { QRCode.toDataURL(url, { width: size * 2, margin: 1, color: { dark: '#0A0B10', light: '#FFFFFF' } }).then(setSrc).catch(() => {}); }, [url]);
  return <div className="qr" style={{ width: size, height: size }}>{src && <img src={src} width={size} height={size} alt={`Código QR para abrir ${ruta}`} />}</div>;
}
