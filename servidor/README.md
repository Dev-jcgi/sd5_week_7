# Servidor WebSocket de PixPro en vivo (Java 21)

Servidor de la clase hecho con [Java-WebSocket](https://github.com/TooTallNate/Java-WebSocket): se hereda `WebSocketServer` y se implementan cuatro métodos (`onOpen`, `onMessage`, `onClose`, `onError`). Para mandar a todos se usa `broadcast`.

| Clase | Tarea |
|---|---|
| `PixProServer` | Recibe las conexiones, revisa el `Origin`, decide qué hacer con cada mensaje |
| `Cliente` / `Rol` | Lo que se recuerda de cada conexión (nombre, rol, límite) |
| `LimiteMensajes` | Máximo 15 mensajes por segundo por conexión |
| `Lote` | Simula los eventos de `lote.events` (LoteSubido, ImagenProcesada, LoteCompletado, LoteCancelado) |
| `Arena` | *Caza de píxeles*: servidor autoritativo con 15 ticks por segundo |
| `Juego` | Preguntas, respuestas y puntos (las respuestas nunca viajan antes de revelar) |
| `Mensajes` | Todos los mensajes que envía el servidor (el protocolo) |
| `Preguntas` | Lee `preguntas.json` (Secret File de Render) |

## Variables de entorno

| Variable | Para qué |
|---|---|
| `PORT` | Puerto (Render pone 10000) |
| `PROFESOR_CLAVE` | Clave del profesor. Sin ella nadie entra como profesor |
| `ORIGENES_PERMITIDOS` | Páginas que pueden conectarse, separadas por comas. Vacío = cualquiera (solo para desarrollo) |

## Protección

`wss://` (TLS de Render) · `Origin` en el handshake · clave del profesor (1008) · 15 mensajes/s (1008) · 16 KB por mensaje (1009) · validación de nombre, emoji y movimiento · ping/pong cada 30 s.

## Comandos

```bash
mvn test                      # 10 pruebas de integración (levantan el servidor de verdad)
mvn package                   # target/pixpro-vivo.jar
PROFESOR_CLAVE=prueba java -jar target/pixpro-vivo.jar
```

`preguntas.json` está en `.gitignore`: tiene las respuestas. `preguntas.ejemplo.json` es público.
