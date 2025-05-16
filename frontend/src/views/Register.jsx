import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importa Link
import ListaPaises from '../controllers/ListaPaises';

const Register = () => {
  const [countries, setCountries] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    userName: '',
    correo: '',
    password: '',
    pais: '', // Solo nombre del país para mostrar en la UI
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/pais');
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error al obtener los países:', error);
      }
    };

    fetchCountries();
  }, []);

  const handleSelect = (selectedOption) => {
    setFormData(prevData => ({
      ...prevData,
      pais: selectedOption
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Encuentra el ID del país basado en el nombre seleccionado
      const selectedCountry = countries.find(country => country.nombre === formData.pais);
      const pais_id = selectedCountry ? selectedCountry.id_pais : null;
  
      console.log('Selected Country:', selectedCountry);
      console.log('Pais ID:', pais_id);
  
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre_usuario: formData.userName,
          contrasena: formData.password,
          nombre_completo: formData.fullName,
          correo: formData.correo,
          pais_id
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log('Registro exitoso:', result);
        setRegistrationSuccess(true); // Marca el registro como exitoso
      } else {
        console.error('Error al registrar usuario:', result);
      }
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
    }
  };
  

  return (
    <div className="extend">
      {!registrationSuccess ? (
        <>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName">Nombre Completo:</label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="userName">Usuario:</label>
            <input
              type="text"
              id="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="correo">Correo:</label>
            <input
              type="email"
              id="correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Contraseña:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="pais">País:</label>
            <ListaPaises 
              options={countries.map(country => country.nombre)} 
              onSelect={handleSelect} 
            />
          </div>
          <button type="submit">Registrar</button>
        </form>
        <Link to="/login" className="button-link">Cancelar</Link>
        </>
      ) : (
        <div>
          <h2>Registro exitoso</h2>
          <p>Tu registro ha sido exitoso. Puedes iniciar sesión <Link to="http://localhost:5173">aquí</Link>.</p>
        </div>
      )}
    </div>
  );
};

export default Register;