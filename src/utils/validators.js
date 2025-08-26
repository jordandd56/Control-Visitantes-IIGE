

// Generales 
export function validateName(v) {
  const value = (v ?? '').trim().replace(/\s+/g, ' ');
  if (!value) return 'El nombre es obligatorio';
  if (value.length < 2) return 'Mínimo 2 caracteres';
  if (value.length > 60) return 'Máximo 60 caracteres';
  const ok = (/^[\p{L} ]+$/u).test(value) || /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(value);
  if (!ok) return 'Solo letras y espacios';
  return '';
}

export function validatePassword(v) {
  const value = v ?? '';
  if (value.length < 8) return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(value)) return 'Incluye una mayúscula (A-Z)';
  if (!/[a-z]/.test(value)) return 'Incluye una minúscula (a-z)';
  if (!/[0-9]/.test(value)) return 'Incluye un número (0-9)';
  if (!/[^A-Za-z0-9]/.test(value)) return 'Incluye un símbolo (#$%&@...)';
  return '';
}

export function validateRole(v) {
  return v ? '' : 'Selecciona un rol';
}

export function validateUsername(v) {
  const value = (v ?? '').trim();
  if (!value) return 'Usuario obligatorio';
  if (value.length < 4) return 'Mínimo 4 caracteres';
  if (value.length > 20) return 'Máximo 20 caracteres';
  if (!/^[A-Za-z0-9._-]+$/.test(value)) return 'Solo letras, números, punto, guion y guion bajo';
  return '';
}

export function validateDigits(v, { min = 6, max = 12 } = {}) {
  const value = (v ?? '').trim();
  if (!/^\d+$/.test(value)) return 'Solo números';
  if (value.length < min) return `Mínimo ${min} dígitos`;
  if (value.length > max) return `Máximo ${max} dígitos`;
  return '';
}

export function allowOnlyLettersKeyDown(e) {
  const always = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (always.includes(e.key)) return;
  const letter = (/^[\p{L} ]$/u).test(e.key) || /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]$/.test(e.key);
  if (!letter) e.preventDefault();
}

// --------- Validaciones usadas en "Inicio" (visitas) ---------
export function validarCedulaEcuatoriana(cedula) {
  if (!/^\d{10}$/.test(cedula)) return false;
  const provincia = parseInt(cedula.substring(0, 2), 10);
  const tercerDigito = parseInt(cedula[2], 10);
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false;
  if (tercerDigito > 6) return false;

  const coef = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let v = parseInt(cedula[i], 10) * coef[i];
    if (v >= 10) v -= 9;
    suma += v;
  }
  const decena = Math.ceil(suma / 10) * 10;
  const dvCalc = decena - suma;
  const dvReal = parseInt(cedula[9], 10);
  return dvCalc === dvReal;
}

export const PASAPORTE_MIN = 6;
export const PASAPORTE_MAX = 10;

export function normalizarPasaporte(valor) {
  if (!valor) return '';
  return valor.toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function validarPasaporte(valor) {
  const v = normalizarPasaporte(valor);
  if (v.length < PASAPORTE_MIN || v.length > PASAPORTE_MAX) return false;
  return /^[A-Z0-9]+$/.test(v);
}

// Persona/visitantes
export function validarNombrePersona(v) {
  const value = (v ?? '').trim().replace(/\s+/g, ' ');
  if (!value) return 'Requerido';
  if (value.length < 2) return 'Mínimo 2 caracteres';
  if (value.length > 80) return 'Máximo 80 caracteres';
  const ok = (/^[\p{L} ]+$/u).test(value) || /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(value);
  if (!ok) return 'Solo letras y espacios';
  return '';
}

// Motivo (3–140)
export function validarMotivo(v) {
  const value = (v ?? '').trim();
  if (!value) return 'Requerido';
  if (value.length < 3) return 'Mínimo 3 caracteres';
  if (value.length > 140) return 'Máximo 140 caracteres';
  return '';
}

// Empresa 
export function validarEmpresa(v) {
  const value = (v ?? '').trim();
  if (!value) return 'Requerido';
  if (value.length < 2) return 'Mínimo 2 caracteres';
  if (value.length > 60) return 'Máximo 60 caracteres';
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9&.\- ]+$/.test(value)) return 'Caracteres no permitidos';
  return '';
}

// Emails
export function validarEmail(v) {
  const value = (v ?? '').trim();
  if (!value) return 'Requerido';
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
  return ok ? '' : 'Email inválido';
}
