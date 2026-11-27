package com.barberia.barberia_api.Controller;

import com.barberia.barberia_api.DTO.ReservaPatchRequest;
import com.barberia.barberia_api.DTO.ReservaRequest;
import com.barberia.barberia_api.DTO.ReservaResponse;
import com.barberia.barberia_api.model.EstadoReserva;
import com.barberia.barberia_api.Service.ReserveService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReserveService service;

    public ReservaController(ReserveService service) {
        this.service = service;
    }

    // GET /api/reservas?estado=PENDIENTE&barberoId=1&clienteId=2&fecha=2026-12-10
    @GetMapping
    public ResponseEntity<List<ReservaResponse>> listar(
            @RequestParam(required = false) EstadoReserva estado,
            @RequestParam(required = false) Long barberoId,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(service.listar(estado, barberoId, clienteId, fecha));
    }

    // GET /api/reservas/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ReservaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtener(id));
    }

    // POST /api/reservas
    @PostMapping
    public ResponseEntity<ReservaResponse> crear(@Valid @RequestBody ReservaRequest request) {
        ReservaResponse creada = service.crear(request);
        URI ubicacion = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(creada.id())
                .toUri();
        return ResponseEntity.created(ubicacion).body(creada);
    }

    // PUT /api/reservas/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ReservaResponse> actualizar(@PathVariable Long id,
                                                      @Valid @RequestBody ReservaRequest request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    // PATCH /api/reservas/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<ReservaResponse> actualizarParcial(@PathVariable Long id,
                                                             @RequestBody ReservaPatchRequest request) {
        return ResponseEntity.ok(service.actualizarParcial(id, request));
    }

    // DELETE /api/reservas/{id}  (cancela la reserva)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        service.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}