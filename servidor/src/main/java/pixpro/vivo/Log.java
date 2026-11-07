package pixpro.vivo;

import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/** Bitácora mínima en la consola (en Render se ve en la pestaña Logs). */
final class Log {
    private Log() {}
    static void info(String texto) {
        System.out.println(LocalTime.now().truncatedTo(ChronoUnit.SECONDS) + "  " + texto);
    }
}
