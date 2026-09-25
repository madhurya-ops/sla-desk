CREATE TABLE users (
                       id            BIGSERIAL PRIMARY KEY,
                       email         VARCHAR(120) NOT NULL UNIQUE,
                       password_hash VARCHAR(100) NOT NULL,
                       full_name     VARCHAR(100) NOT NULL,
                       role          VARCHAR(20)  NOT NULL CHECK (role IN ('AGENT','LEAD','MANAGER')),
                       team          VARCHAR(20)  CHECK (team IN ('INFRA','APPLICATION','ACCESS','BILLING')),
                       created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE sla_policies (
                              priority           VARCHAR(2) PRIMARY KEY CHECK (priority IN ('P1','P2','P3','P4')),
                              resolution_minutes INT NOT NULL CHECK (resolution_minutes > 0),
                              at_risk_percent    INT NOT NULL DEFAULT 80 CHECK (at_risk_percent BETWEEN 1 AND 99),
                              updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
                         id                 BIGSERIAL PRIMARY KEY,
                         title              VARCHAR(200) NOT NULL,
                         description        TEXT         NOT NULL,
                         priority           VARCHAR(2)   NOT NULL,
                         category           VARCHAR(20)  NOT NULL,
                         status             VARCHAR(20)  NOT NULL DEFAULT 'OPEN',
                         sla_state          VARCHAR(20)  NOT NULL DEFAULT 'ON_TRACK',
                         sla_minutes        INT          NOT NULL,      -- snapshot of the policy at creation
                         at_risk_percent    INT          NOT NULL,      -- snapshot of the policy at creation
                         created_by_id      BIGINT       NOT NULL REFERENCES users(id),
                         assignee_id        BIGINT       REFERENCES users(id),
                         escalated          BOOLEAN      NOT NULL DEFAULT FALSE,
                         created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
                         due_at             TIMESTAMPTZ  NOT NULL,
                         paused_at          TIMESTAMPTZ,                -- set while ON_HOLD
                         paused_seconds     BIGINT       NOT NULL DEFAULT 0, -- total time spent on hold
                         resolved_at        TIMESTAMPTZ,
                         ai_priority        VARCHAR(2),
                         ai_category        VARCHAR(20),
                         ai_confidence      DOUBLE PRECISION,
                         ai_business_impact DOUBLE PRECISION,
                         ai_frustration     DOUBLE PRECISION,
                         needs_triage       BOOLEAN      NOT NULL DEFAULT FALSE,
                         version            BIGINT       NOT NULL DEFAULT 0 -- optimistic locking
);
CREATE INDEX idx_tickets_status    ON tickets(status);
CREATE INDEX idx_tickets_sla_state ON tickets(sla_state);
CREATE INDEX idx_tickets_assignee  ON tickets(assignee_id);

CREATE TABLE ticket_events (
                               id         BIGSERIAL PRIMARY KEY,
                               ticket_id  BIGINT      NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
                               actor_id   BIGINT      REFERENCES users(id),  -- NULL means the system or the AI did it
                               type       VARCHAR(30) NOT NULL,
                               from_value VARCHAR(50),
                               to_value   VARCHAR(50),
                               message    TEXT,
                               created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_ticket ON ticket_events(ticket_id, created_at);