const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.listen(3000, () => {
  console.log("¡Servidor encendido!");  // Elevacion de servidor local con Express Js
});

app.use(express.json()); //Habilitacion del middleware para solicitudes

let canciones;

// Función para guardar las canciones en el archivo "repertorio.json"
function guardarCanciones() {
  const filePath = path.join(__dirname, 'repertorio.json');
  fs.writeFileSync(filePath, JSON.stringify(canciones), 'utf-8');
}

try {
  const filePath = path.join(__dirname, 'repertorio.json');
  const contenidoArchivo = fs.readFileSync(filePath, 'utf-8');

  if (contenidoArchivo.trim() === "") {
    canciones = [];
  } else {
    canciones = JSON.parse(contenidoArchivo);
  }
} catch (error) {
  console.error("Error al leer/parsear el archivo:", error.message);
  canciones = [];
}

// Ruta /canciones
app.get("/canciones", (req, res) => {
  res.json(canciones);  
});

// AGREGAR CANCIONES
app.post("/canciones", (req, res) => {
  const nuevaCancion = req.body;

  // Validación para verificar si el body se encuentra vacío o incompleto
  if (!nuevaCancion || Object.keys(nuevaCancion).length === 0) {
    return res.status(400).send("El body de la solicitud está vacío o incompleto.");  // Manipulacion del payload en consulta HTTP al servidor
  }

  // Validación para evitar la repetición de ID
  const existeId = canciones.some(c => c.id === nuevaCancion.id);
  if (existeId) {
    return res.status(400).send("El ID de la nueva canción ya existe. Debe ser único.");
  }

  canciones.push(nuevaCancion);
  guardarCanciones();
  res.send("Canción agregada con éxito!");  
});

// ACTUALIZACION DE CANCIONES
app.put("/canciones/:id", (req, res) => {
  const { id } = req.params;
  const cancionActualizada = req.body;
  const index = canciones.findIndex(c => c.id == id);
  if (index !== -1) {
    canciones[index] = cancionActualizada;
    guardarCanciones();
    res.send("Canción actualizada con éxito!");
  } else {
    res.status(404).send("No se encontró la canción con el ID especificado.");
  }
});

// ELIMINAR CANCIONES
app.delete("/canciones/:id", (req, res) => {
  const { id } = req.params;
  const filtrado = canciones.filter(c => c.id != id);
  if (canciones.length !== filtrado.length) {
    canciones = filtrado;
    guardarCanciones();
    res.send("Canción eliminada con éxito!");  
  } else {
    res.status(404).send("No se encontró la canción con el ID especificado.");
  }
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
