'use strict';

async function contacto_enviar(){
    btn_enviar.disabled = true;
    btn_enviar.value = 'Espere...';

    let msj = {
        nombre: nombre.value,
        correo: correo.value,
        mensaje: mensaje.value
    }
    msj = JSON.stringify(msj);

    let f = await fetch('form_contacto_web.php',{
        method: 'POST',
        body: msj
    });

    if(f.status === 202){
        nombre.value = '';
        correo.value = '';
        mensaje.value = '';
        alert('Su mensaje de envió correctamente. Muchas gracias.');
    }else{
        console.info(f);
        alert('Hubo un problema enviando el mensaje. Por favor intente mas tarde, o visite el prefil de Github.')
    }

    btn_enviar.value = 'Enviar';
    btn_enviar.disabled = false;
}
