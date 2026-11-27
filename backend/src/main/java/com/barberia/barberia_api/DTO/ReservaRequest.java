package com.barberia.barberia_api.model.DTO;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaRequest(
        @NotNull(message = "es obligatorio") Long clienteId,
        @NotNull(message = "es obligatorio") Long barberoId,
        @NotBlank(message = "es obligatorio")
        @Size(max = 100, message = "admite maximo 100 caracteres") String servicio,
        @NotNull(message = "es obligatoria")
        @FutureOrPresent(message = "no puede estar en el pasado") LocalDate fecha,
        @NotNull(message = "es obligatoria") LocalTime hora
) {
}