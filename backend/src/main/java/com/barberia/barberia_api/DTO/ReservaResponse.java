package com.barberia.barberia_api.DTO;

import com.barberia.barberia_api.model.EstadoReserva;
import com.barberia.barberia_api.model.Reserva;   // solo en ReservaResponse
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaResponse(
        Long id,
        Long clienteId,
        Long barberoId,
        String servicio,
        LocalDate fecha,
        LocalTime hora,
        EstadoReserva estado
) {
    public static ReservaResponse desde(Reserva r) {
        return new ReservaResponse(r.getId(), r.getClienteId(), r.getBarberoId(),
                r.getServicio(), r.getFecha(), r.getHora(), r.getEstado());
    }
}
