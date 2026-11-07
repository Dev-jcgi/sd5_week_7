# PixPro en vivo · DS5 Semana 7 · WebSockets

Clase de 120 minutos sobre WebSockets con PixPro como caso. **La propia clase es un sistema en tiempo real**: los celulares de los estudiantes quedan conectados por WebSocket a un servidor Java y por esa conexión reciben un videojuego (*Caza de píxeles*), el avance de un lote de PixPro y las preguntas de las actividades.

| Parte | Dónde | Qué es |
|---|---|---|
| Sitio (presentación + páginas en vivo) | `src/` → GitHub Pages | Presentación 2D (reveal.js), página del estudiante `#/vivo`, página del profesor `#/profesor`, simulación Polling/SSE/WebSocket |
| Servidor WebSocket | [`servidor/`](servidor/README.md) → Render | Java 21 + [Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket) (sin Spring). Juego, lote, preguntas, seguridad y 11 pruebas JUnit |
| Ejercicio | [`ejercicio/`](ejercicio/README.md) | Cliente WebSocket en Java puro (solo el JDK) con 4 TODO y su solución |
| Diagramas | `archify/*.json` → `public/diagramas/*.html` | 9 diagramas hechos con [Archify](https://archify.si) |

## Temas

1. WebSocket vs. REST: diferencias clave
2. Conceptos básicos de la comunicación en tiempo real (+ *Caza de píxeles* + lote en vivo)
3. Configuración de un servidor WebSocket (Java + Render)
4. Protección de las conexiones WebSocket
5. Prueba y depuración de las API de WebSocket

## Rutas del sitio

- `#/` portada · `#/vivo` estudiante · `#/profesor` profesor (clave) · `#/presentacion` repaso · `#/ejercicio`
- `?ws=ws://localhost:8080` en cualquier ruta usa otro servidor (se recuerda en ese navegador).

## Puesta en marcha (una sola vez)

### 1. Servidor en Render (gratis)

1. En [render.com](https://render.com): **New → Blueprint** → elige este repositorio. Render lee `render.yaml` y crea el servicio `pixpro-vivo` (Docker, plan gratis).
2. Te pedirá **PROFESOR_CLAVE**: escribe la clave con la que entrarás a `#/profesor`. No se guarda en GitHub.
3. En el servicio → **Environment → Secret Files** → nombre `preguntas.json` → pega el contenido de las preguntas reales (están en el documento privado del profesor). Sin este archivo se usan las preguntas de ejemplo.
4. Anota la URL del servicio, por ejemplo `https://pixpro-vivo.onrender.com`. El sitio se conecta a `wss://pixpro-vivo.onrender.com`.

> El plan gratis duerme el servidor tras 15 minutos sin tráfico y tarda cerca de 1 minuto en despertar. **Abre `#/profesor` unos minutos antes de la clase** para despertarlo.

### 2. Sitio en GitHub Pages

1. **Settings → Pages → Source: GitHub Actions.**
2. Si la URL de Render **no** es `pixpro-vivo.onrender.com`: **Settings → Secrets and variables → Actions → Variables** → `VITE_WS_URL` = `wss://<tu-servicio>.onrender.com`.
3. **Actions → Publicar en GitHub Pages → Run workflow**.
4. Si el sitio queda en otro dominio que no sea `jcgi.lat` o `dev-jcgi.github.io`, agrégalo a `ORIGENES_PERMITIDOS` en Render.

## En clase

1. Profesor: abre `#/profesor`, escribe la clave y presenta. **C** abre el panel en vivo; **Esc** vuelve a la presentación.
2. Estudiantes: escanean el QR (`#/vivo`) y escriben su nombre.
3. En las columnas de actividad aparece **Lanzar actividad N** → **Revelar respuesta** → **Siguiente pregunta**.
4. En el tema 2: **Iniciar Caza de píxeles** y **Iniciar lote en vivo**. En el cierre: **Mostrar podio**.

## Desarrollo local

```bash
# servidor
cd servidor && mvn package && PROFESOR_CLAVE=prueba java -jar target/pixpro-vivo.jar
# sitio (otra terminal)
npm install && npm run dev
# abre http://localhost:5173/#/profesor?ws=ws://localhost:8080
```
