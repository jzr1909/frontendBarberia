package com.barberia.barberia_api.Service;

import com.barberia.barberia_api.DTO.ReservaPatchRequest;
import com.barberia.barberia_api.DTO.ReservaRequest;
import com.barberia.barberia_api.DTO.ReservaResponse;
import com.barberia.barberia_api.excepcion.ConflictoException;
import com.barberia.barberia_api.excepcion.RecursoNoEncontradoException;
import com.barberia.barberia_api.model.EstadoReserva;
import com.barberia.barberia_api.model.Reserva;
import com.barberia.barberia_api.model.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository repository;

    public ReservaService(ReservaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> listar(EstadoReserva estado, Long barberoId,
                                        Long clienteId, LocalDate fecha) {
        return repository.buscar(estado, barberoId, clienteId, fecha).stream()
                .map(ReservaResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReservaResponse obtener(Long id) {
        return ReservaResponse.desde(buscarPorId(id));
    }

    @Transactional
    public ReservaResponse crear(ReservaRequest req) {
        validarDisponibilidad(req.barberoId(), req.fecha(), req.hora(), null);

        Reserva reserva = new Reserva();
        reserva.setClienteId(req.clienteId());
        reserva.setBarberoId(req.barberoId());
        reserva.setServicio(req.servicio());
        reserva.setFecha(req.fecha());
        reserva.setHora(req.hora());
        reserva.setEstado(EstadoReserva.PENDIENTE);

        return ReservaResponse.desde(repository.save(reserva));
    }

    @Transactional
    public ReservaResponse actualizar(Long id, ReservaRequest req) {
        Reserva reserva = buscarPorId(id);
        validarModificable(reserva);
        validarDisponibilidad(req.barberoId(), req.fecha(), req.hora(), id);

        reserva.setClienteId(req.clienteId());
        reserva.setBarberoId(req.barberoId());
        reserva.setServicio(req.servicio());
        reserva.setFecha(req.fecha());
        reserva.setHora(req.hora());

        return ReservaResponse.desde(repository.save(reserva));
    }

    @Transactional
    public ReservaResponse actualizarParcial(Long id, ReservaPatchRequest patch) {
        Reserva reserva = buscarPorId(id);
        validarModificable(reserva);

        LocalDate fecha = patch.fecha() != null ? patch.fecha() : reserva.getFecha();
        LocalTime hora = patch.hora() != null ? patch.hora() : reserva.getHora();

        boolean cambiaHorario = !fecha.equals(reserva.getFecha()) || !hora.equals(reserva.getHora());
        if (cambiaHorario) {
            validarDisponibilidad(reserva.getBarberoId(), fecha, hora, id);
        }

        reserva.setFecha(fecha);
        reserva.setHora(hora);
        if (patch.servicio() != null && !patch.servicio().isBlank()) {
            reserva.setServicio(patch.servicio());
        }
        if (patch.estado() != null) {
            reserva.setEstado(patch.estado());
        }

        return ReservaResponse.desde(repository.save(reserva));
    }

    // DELETE = cancelar (RF22): la reserva no se borra, cambia a CANCELADA
    @Transactional
    public void cancelar(Long id) {
        Reserva reserva = buscarPorId(id);
        reserva.setEstado(EstadoReserva.CANCELADA);
        repository.save(reserva);
    }

    private Reserva buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No existe una reserva con id " + id));
    }

    private void validarModificable(Reserva reserva) {
        if (reserva.getEstado() == EstadoReserva.CANCELADA) {
            throw new ConflictoException("No se puede modificar una reserva cancelada");
        }
    }

    private void validarDisponibilidad(Long barberoId, LocalDate fecha, LocalTime hora, Long idExcluir) {
        boolean ocupado = (idExcluir == null)
                ? repository.existsByBarberoIdAndFechaAndHoraAndEstadoNot(
                barberoId, fecha, hora, EstadoReserva.CANCELADA)
                : repository.existsByBarberoIdAndFechaAndHoraAndEstadoNotAndIdNot(
                barberoId, fecha, hora, EstadoReserva.CANCELADA, idExcluir);

        if (ocupado) {
            throw new com.barberia.barberia_api.model.Service.ConflictoException("El barbero ya tiene una reserva en esa fecha y hora");
        }
    }
}