package pixpro.vivo;

/** Lo que el servidor recuerda de cada conexión (se guarda con conn.setAttachment). */
class Cliente {
    Rol rol = Rol.ANONIMO;
    String nombre = "anónimo";
    final LimiteMensajes limite = new LimiteMensajes(15); // máximo 15 mensajes por segundo
}
