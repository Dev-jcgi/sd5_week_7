package pixpro.vivo;

/**
 * Protección contra abuso: cuenta los mensajes de una conexión en ventanas de 1 segundo.
 * Si en un segundo llegan más de "maximo", permitir() devuelve false y el servidor cierra la conexión (1008).
 */
class LimiteMensajes {
    private final int maximo;
    private long inicioVentana = System.currentTimeMillis();
    private int contador = 0;

    LimiteMensajes(int maximo) { this.maximo = maximo; }

    synchronized boolean permitir() {
        long ahora = System.currentTimeMillis();
        if (ahora - inicioVentana >= 1000) { inicioVentana = ahora; contador = 0; }
        contador++;
        return contador <= maximo;
    }
}
