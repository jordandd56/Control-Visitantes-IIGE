/* ------------------------------------------------------------------ */
/* 1.  Añadir columna estado (solo si aún no existe)                  */
/* ------------------------------------------------------------------ */
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   information_schema.columns
    WHERE  table_name = 'visitas'
      AND  column_name = 'estado'
  ) THEN
    ALTER TABLE visitas
      ADD COLUMN estado VARCHAR(15)
      DEFAULT 'ingreso'
      CHECK (estado IN ('ingreso','salida'));
  END IF;
END$$;

/* ------------------------------------------------------------------ */
/* 2.  Función trigger: auto‑set hora_ingreso / hora_salida           */
/* ------------------------------------------------------------------ */
CREATE OR REPLACE FUNCTION trg_visitas_set_horas()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
     IF NEW.estado = 'ingreso' AND NEW.hora_ingreso IS NULL THEN
        NEW.hora_ingreso := (clock_timestamp() AT TIME ZONE 'America/Guayaquil')::time;
     ELSIF NEW.estado = 'salida'  AND NEW.hora_salida IS NULL THEN
        NEW.hora_salida  := (clock_timestamp() AT TIME ZONE 'America/Guayaquil')::time;
     END IF;
     RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
     IF NEW.estado = 'ingreso'
        AND OLD.estado IS DISTINCT FROM NEW.estado
        AND NEW.hora_ingreso IS NULL
     THEN
        NEW.hora_ingreso := (clock_timestamp() AT TIME ZONE 'America/Guayaquil')::time;
     END IF;

     IF NEW.estado = 'salida'
        AND OLD.estado IS DISTINCT FROM NEW.estado
        AND NEW.hora_salida IS NULL
     THEN
        NEW.hora_salida  := (clock_timestamp() AT TIME ZONE 'America/Guayaquil')::time;
     END IF;
     RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

/* ------------------------------------------------------------------ */
/* 3.  Crear triggers                                                 */
/* ------------------------------------------------------------------ */
CREATE TRIGGER trg_visitas_bi_set_horas
BEFORE INSERT ON visitas
FOR EACH ROW
EXECUTE PROCEDURE trg_visitas_set_horas();

CREATE TRIGGER trg_visitas_bu_estado_horas
BEFORE UPDATE OF estado ON visitas
FOR EACH ROW
EXECUTE PROCEDURE trg_visitas_set_horas();