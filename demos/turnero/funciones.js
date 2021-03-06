// BD: https://jsonstorage.net/
const datauri = 'https://jsonstorage.net/api/items/530aa4b9-bf7d-40b0-86ee-d3d9ee0fbb47';

async function consultar(){
    let data = await fetch(datauri);
    if( data.status === 200 ){ return await data.json(); } else { return false; }
}

async function visor(){
    
    setInterval(async function(){
        if( window.visoroff === 1 ){ return; }
        let data = await consultar();
        //if( typeof window.turno === 'undefined' ){ window.turno = data }
        //else{ 
            if( JSON.stringify(window.turno) !== JSON.stringify(data) ){
                window.turno = data;
                numero.innerText = data.numero;
                puesto.innerText = data.puesto;
                nombre.innerText = data.nombre;
                dingdong.play();
            }
        //}
    }, 2500);
}

async function actualizar_turno_actual(){
    btn_turnoactual.disabled = true;
    btn_turnoactual.innerText = 'Espere...';

    let data = await consultar();
    if( !data ){ turnoactual.innerText = '--'; return; }
    turnoactual.innerText = data.numero + ' @ ' + data.puesto + ' : ' + data.nombre;

    numero.value = data.numero;
    
    btn_turnoactual.innerText = 'Actualizar turno actual';
    btn_turnoactual.disabled = false;
}

async function cambiar(n){

    progreso.value = 0;
    setInterval(() => {
        progreso.value = progreso.value + 0.01;
    }, 40);

    data = JSON.stringify( {
        numero: parseInt(n),
        puesto: parseInt(puesto.value),
        nombre: nombre.value,
        ref: Date.now()
    } );

    let f = await fetch(
        'https://jsonstorage.net/api/items/530aa4b9-bf7d-40b0-86ee-d3d9ee0fbb47',
        {
            method: 'PUT', 
            body: data, 
            headers: {'Content-Type': 'application/json'}
        }
    );

    if( f.status === 201 ){ await actualizar_turno_actual(); }
}

async function llamar_siguiente(){
    btn_llamar_siguiente.disabled = true;
    btn_llamar_siguiente.innerText = 'Espere...';

    data = await consultar();
    n = data.numero + 1;
    await cambiar(n);

    setTimeout(() => {
        btn_llamar_siguiente.disabled = false;
        btn_llamar_siguiente.innerText = 'Llamar a siguiente número';
    }, 3000);
}

async function llamar_anterior(){
    btn_llamar_anterior.disabled = true;
    btn_llamar_anterior.innerText = 'Espere...';

    data = await consultar();
    n = data.numero - 1;
    await cambiar(n);

    setTimeout(() => {
        btn_llamar_anterior.disabled = false;
        btn_llamar_anterior.innerText = 'Llamar al número anterior';
    }, 3000);
}

async function llamar_otro(){
    btn_llamar_otro.disabled = true;
    btn_llamar_otro.innerText = 'Espere...';

    n = numero.value;
    await cambiar(n);

    setTimeout(() => {
        btn_llamar_otro.disabled = false;
        btn_llamar_otro.innerText = 'Llamar a número específico';
        otro_numero.hidden = true;
    }, 3000);
}