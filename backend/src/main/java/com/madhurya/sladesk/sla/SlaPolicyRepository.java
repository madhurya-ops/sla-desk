package com.madhurya.sladesk.sla;

import com.madhurya.sladesk.ticket.Priority;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Priority> {}
