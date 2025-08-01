-- Inserción de roles
INSERT INTO roles (id, nombre) VALUES
    (1, 'Administrador'),
    (2, 'Guardia');

-- Inserción de áreas
INSERT INTO areas (id, nombre) VALUES
    (1, 'Administración'),
    (2, 'Seguridad'),
    (3, 'Recepción');

-- Aplicacion de restricciones para que cedula o pasaporte no sean nulos
-- Esto asegura que al menos uno de los dos campos debe tener un valor
    ALTER TABLE visitantes
ADD CONSTRAINT chk_cedula_o_pasaporte
CHECK (
  cedula IS NOT NULL OR pasaporte IS NOT NULL
);

