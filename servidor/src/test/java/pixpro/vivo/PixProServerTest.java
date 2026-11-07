package pixpro.vivo;

import static org.junit.jupiter.api.Assertions.*;

import java.net.ServerSocket;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletionException;

import org.json.JSONObject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Pruebas de integración: levantan el servidor de verdad en un puerto libre
 * y se conectan como lo haría un navegador.
 */
class PixProServerTest {
    static final String ORIGEN = "https://jcgi.lat";
    PixProServer servidor;
    int puerto;

    @BeforeEach
    void arrancar() throws Exception {
        try (ServerSocket s = new ServerSocket(0)) { puerto = s.getLocalPort(); }
        List<JSONObject> preguntas = Preguntas.leer("""
            [{"id":"p1","actividad":1,"segundos":20,"texto":"¿2+2?","opciones":["3","4"],"correcta":1,"explicacion":"Cuatro"}]
            """);
        servidor = new PixProServer(puerto, "secreta", Set.of(ORIGEN), preguntas);
        servidor.start();
        Thread.sleep(300);
    }

    @AfterEach
    void detener() throws Exception { servidor.stop(500); }

    ClientePrueba estudiante(String nombre) throws Exception {
        ClientePrueba c = ClientePrueba.conectar(puerto, ORIGEN);
        c.enviar("{\"tipo\":\"hola\",\"rol\":\"estudiante\",\"nombre\":\"" + nombre + "\"}");
        c.esperar("bienvenida");
        return c;
    }

    ClientePrueba profesor() throws Exception {
        ClientePrueba c = ClientePrueba.conectar(puerto, ORIGEN);
        c.enviar("{\"tipo\":\"hola\",\"rol\":\"profesor\",\"clave\":\"secreta\"}");
        c.esperar("bienvenida");
        return c;
    }

    @Test
    void unEstudianteRecibeBienvenidaYElConteo() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        assertEquals(1, ana.esperar("conectados").getInt("total"));
    }

    @Test
    void unaReaccionLlegaATodos() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        ClientePrueba beto = estudiante("Beto");
        ana.enviar("{\"tipo\":\"reaccion\",\"emoji\":\"🔥\"}");
        JSONObject m = beto.esperar("reaccion");
        assertEquals("🔥", m.getString("emoji"));
        assertEquals("Ana", m.getString("de"));
    }

    @Test
    void seRechazaUnOrigenDesconocido() {
        CompletionException e = assertThrows(CompletionException.class, () -> ClientePrueba.conectar(puerto, "https://pagina-maliciosa.com"));
        assertNotNull(e.getCause());
    }

    @Test
    void unaClaveIncorrectaCierraConElCodigo1008() throws Exception {
        ClientePrueba c = ClientePrueba.conectar(puerto, ORIGEN);
        c.enviar("{\"tipo\":\"hola\",\"rol\":\"profesor\",\"clave\":\"adivinando\"}");
        assertEquals(1008, c.codigoDeCierre());
    }

    @Test
    void demasiadosMensajesCierranLaConexion() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        for (int i = 0; i < 30; i++) ana.enviar("{\"tipo\":\"reaccion\",\"emoji\":\"🚀\"}");
        assertEquals(1008, ana.codigoDeCierre());
    }

    @Test
    void unMensajeGiganteCierraConElCodigo1009() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        ana.enviar("{\"tipo\":\"reaccion\",\"emoji\":\"" + "x".repeat(20_000) + "\"}");
        assertEquals(1009, ana.codigoDeCierre());
    }

    @Test
    void laRespuestaCorrectaNoViajaHastaRevelar() throws Exception {
        ClientePrueba prof = profesor();
        ClientePrueba ana = estudiante("Ana");
        prof.enviar("{\"tipo\":\"lanzar\",\"id\":\"p1\"}");
        JSONObject pregunta = ana.esperar("pregunta");
        assertFalse(pregunta.has("correcta"));

        ana.enviar("{\"tipo\":\"respuesta\",\"id\":\"p1\",\"opcion\":1}");
        JSONObject conteo;
        do { conteo = prof.esperar("conteo"); } while (conteo.getInt("respondieron") == 0); // el primero llega al lanzar
        assertEquals(1, conteo.getInt("respondieron"));

        prof.enviar("{\"tipo\":\"revelar\"}");
        assertEquals(1, ana.esperar("resultado").getInt("correcta"));
        JSONObject puntos = ana.esperar("puntos");
        assertTrue(puntos.getBoolean("acerto"));
        assertTrue(puntos.getInt("total") > 500);
    }

    @Test
    void unEstudianteNoPuedeLanzarPreguntas() throws Exception {
        ClientePrueba ana = estudiante("Ana");
        ana.enviar("{\"tipo\":\"lanzar\",\"id\":\"p1\"}");
        assertTrue(ana.esperar("error").getString("mensaje").contains("Solo el profesor"));
    }

    @Test
    void cualquieraPuedeCancelarElLoteYTodosSeEnteran() throws Exception {
        ClientePrueba prof = profesor();
        ClientePrueba ana = estudiante("Ana");
        prof.enviar("{\"tipo\":\"iniciarLote\",\"fotos\":500}");
        assertEquals("LoteSubido", ana.esperar("lote").getString("evento"));
        ana.enviar("{\"tipo\":\"cancelarLote\"}");
        JSONObject m;
        do { m = prof.esperar("lote"); } while (!m.getString("evento").equals("LoteCancelado"));
        assertEquals("Ana", m.getString("por"));
    }

    @Test
    void enElJuegoElServidorMueveAlJugador() throws Exception {
        ClientePrueba prof = profesor();
        ClientePrueba ana = estudiante("Ana");
        prof.enviar("{\"tipo\":\"iniciarJuego\"}");
        ana.esperar("juego");
        ana.enviar("{\"tipo\":\"mover\",\"dx\":99,\"dy\":0}"); // 99 se recorta a 1: no hay trampa posible
        JSONObject mundo;
        do { mundo = ana.esperar("mundo"); } while (mundo.getJSONArray("jugadores").isEmpty());
        assertEquals("Ana", mundo.getJSONArray("jugadores").getJSONArray(0).getString(0));
    }
}
