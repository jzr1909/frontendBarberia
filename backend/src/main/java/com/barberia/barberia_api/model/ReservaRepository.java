package com.barberia.barberia_api.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Filtros opcionales para @RequestParam: los parametros null se ignoran
    @Query("""
            SELECT r FROM Reserva r
            WHERE (:estado IS NULL OR r.estado = :estado)
              AND (:barberoId IS NULL OR r.barberoId = :barberoId)
              AND (:clienteId IS NULL OR r.clienteId = :clienteId)
              AND (:fecha IS NULL OR r.fecha = :fecha)
            ORDER BY r.fecha, r.hora
            """)
    List<Reserva> buscar(@Param("estado") EstadoReserva estado,
                         @Param("barberoId") Long barberoId,
                         @Param("clienteId") Long clienteId,
                         @Param("fecha") LocalDate fecha);

    // RF20: horario ocupado al crear (ignora reservas canceladas)
    boolean existsByBarberoIdAndFechaAndHoraAndEstadoNot(Long barberoId,
                                                         LocalDate fecha,
                                                         LocalTime hora,
                                                         EstadoReserva estado);

    // RF20: horario ocupado al modificar (excluye la propia reserva)
    boolean existsByBarberoIdAndFechaAndHoraAndEstadoNotAndIdNot(Long barberoId,
                                                                 LocalDate fecha,
                                                                 LocalTime hora,
                                                                 EstadoReserva estado,
                                                                 Long id);
}