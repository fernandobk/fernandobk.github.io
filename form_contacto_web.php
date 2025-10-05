<?php
// ----------------------------------------
// CONFIGURACIÓN
// ----------------------------------------
$destinatario = "fernandobenitezkleinert@gmail.com"; // ← Cambiar por el correo que recibirá los mensajes
$asunto = "Nuevo mensaje desde fbk.ar";

// Permitir solo solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Método no permitido
    exit;
}

// Leer y decodificar el JSON recibido
$inputJSON = file_get_contents('php://input');
$datos = json_decode($inputJSON, true);

// Validar datos básicos
if (
    empty($datos['nombre']) ||
    empty($datos['correo']) ||
    empty($datos['mensaje']) ||
    !filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)
) {
    http_response_code(400); // Datos inválidos
    exit;
}

// Sanitizar los campos
$nombre  = htmlspecialchars(trim($datos['nombre']));
$correo  = htmlspecialchars(trim($datos['correo']));
$mensaje = htmlspecialchars(trim($datos['mensaje']));

// Construir el cuerpo del correo
$cuerpo = "Has recibido un nuevo mensaje desde el formulario de contacto:\n\n";
$cuerpo .= "Nombre: {$nombre}\n";
$cuerpo .= "Correo: {$correo}\n\n";
$cuerpo .= "Mensaje:\n{$mensaje}\n";

// Encabezados del correo
$headers  = "From: {$nombre} <{$correo}>\r\n";
$headers .= "Reply-To: {$correo}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Intentar enviar el correo
if (mail($destinatario, $asunto, $cuerpo, $headers)) {
    http_response_code(202); // Aceptado
} else {
    http_response_code(500); // Error del servidor
}
?>
