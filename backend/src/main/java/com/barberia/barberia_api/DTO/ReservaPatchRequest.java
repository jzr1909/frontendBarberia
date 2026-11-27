package com.barberia.barberia_api.DTO;

import com.barberia.barberia_api.model.EstadoReserva;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaPatchRequest(
        String servicio,
        LocalDate fecha,
        LocalTime hora,
        EstadoReserva estado
) { }