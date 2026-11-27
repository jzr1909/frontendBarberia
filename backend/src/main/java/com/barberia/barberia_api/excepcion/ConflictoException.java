package com.barberia.barberia_api.model.Ecepcion;

public class ConflictoException extends RuntimeException {
    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}