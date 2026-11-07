# Ejercicio · Rastreador de lotes en Java puro

Cliente WebSocket de consola que se conecta al servidor de la clase, muestra el avance de los lotes de PixPro y puede cancelarlos. Solo usa el JDK (`java.net.http.WebSocket`, Java 11+); no hace falta Maven.

```bash
cd ejercicio/inicio
java RastreadorLote.java TuNombre ws://localhost:8080              # tu servidor local
java RastreadorLote.java TuNombre wss://pixpro-vivo.onrender.com   # el de la clase
```

Teclas: `c` cancela el lote · `r` manda una reacción 🚀 · `q` sale.

## Los 4 TODO

1. **Conectarse** (handshake): `HttpClient.newHttpClient().newWebSocketBuilder().buildAsync(servidor, new Oyente())`.
2. **Presentarse**: en `onOpen`, enviar `{"tipo":"hola","rol":"estudiante","nombre":"..."}`.
3. **Mostrar el lote**: en `mostrar`, cuando el tipo sea `lote`, imprimir `L-1042 [########............] 200/500 · ImagenProcesada`.
4. **Reconectar con espera creciente**: 1 s, 2 s, 4 s, 8 s… máximo 10 s.

La solución está en `solucion/RastreadorLote.java`.

## Entrega

Captura de tu consola con la barra de un lote y un lote cancelado desde tu cliente (`c`).

> En Windows, si ves signos raros en lugar de acentos o emojis: `chcp 65001` antes de ejecutar, o `java -Dstdout.encoding=UTF-8 RastreadorLote.java ...`.
