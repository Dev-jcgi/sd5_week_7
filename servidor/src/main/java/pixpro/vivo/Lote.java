package pixpro.vivo;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import org.json.JSONObject;

/**
 * Simula lo que en PixPro llega desde el broker (lote.events):
 *   LoteSubido → ImagenProcesada (muchas veces) → LoteCompletado | LoteCancelado
 * Cada evento se reenvía a TODOS los navegadores conectados (broadcast).
 */
class Lote {
    private final Consumer<JSONObject> broadcast;
    private final ScheduledExecutorService reloj = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "reloj-" + getClass().getSimpleName());
        t.setDaemon(true); // no impide que el programa termine
        return t;
    });
    private ScheduledFuture<?> tarea;
    private int numero = 1041;
    private String id;
    private int total, hechas;

    Lote(Consumer<JSONObject> broadcast) { this.broadcast = broadcast; }

    synchronized boolean activo() { return tarea != null; }

    synchronized void iniciar(int fotos) {
        if (activo()) return;
        id = "L-" + (++numero);
        total = fotos;
        hechas = 0;
        broadcast.accept(evento("LoteSubido", null));
        // El Digester procesa en tandas: cada 250 ms avisa cuántas fotos lleva (unos 10 s en total).
        int tanda = Math.max(1, total / 40);
        tarea = reloj.scheduleAtFixedRate(() -> avanzar(tanda), 250, 250, TimeUnit.MILLISECONDS);
    }

    private synchronized void avanzar(int tanda) {
        if (!activo()) return;
        hechas = Math.min(total, hechas + tanda);
        if (hechas < total) {
            broadcast.accept(evento("ImagenProcesada", null));
        } else {
            detener();
            broadcast.accept(evento("LoteCompletado", null));
        }
    }

    synchronized void cancelar(String quien) {
        if (!activo()) return;
        detener();
        broadcast.accept(evento("LoteCancelado", quien));
    }

    synchronized JSONObject estado() { return evento("ImagenProcesada", null); }

    private void detener() { tarea.cancel(false); tarea = null; }

    private JSONObject evento(String nombre, String por) {
        JSONObject m = Mensajes.de("lote").put("evento", nombre).put("loteId", id).put("hechas", hechas).put("total", total);
        if (por != null) m.put("por", por);
        return m;
    }
}
