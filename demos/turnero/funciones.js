// await fetch('https://api.jsonbin.io/v3/b', {method: 'POST', body: '{"":""}', headers: {'Content-Type': 'application/json', 'X-Bin-Private': false, 'X-Bin-Name':'turnos', 'X-Master-Key': '$2b$10$e9hka2uXqiI51ffQjR2zj.x.RW11VhFa7yJ5Ydu4x0z58ap1MKsLi'}});

async function consultar(){
    let data = await fetch('https://api.jsonbin.io/v3/b/6201d77669b72261be544170', {headers: {'X-Bin-Meta':false}});
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
        'https://api.jsonbin.io/v3/b/6201d77669b72261be544170',
        {
            method: 'PUT', 
            body: data, 
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key':'$2b$10$e9hka2uXqiI51ffQjR2zj.x.RW11VhFa7yJ5Ydu4x0z58ap1MKsLi',
                'X-Bin-Versioning':false
            }
        }
    );

    if( f.status === 200 ){ await actualizar_turno_actual(); }
}

async function llamar_siguiente(){
    btn_llamar_siguiente.disabled = true;
    btn_llamar_siguiente.innerText = 'Espere...';

    data = await consultar();
    n = data.numero + 1;
    if( n > 999 ){ n = 0; }
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
    if( n < 0 ){ n = 999; }
    await cambiar(n);

    setTimeout(() => {
        btn_llamar_anterior.disabled = false;
        btn_llamar_anterior.innerText = 'Llamar al número anterior';
    }, 3000);
}

async function llamar_otro(){
    if( numero.value < 0 || numero.value > 999 ){ return; }
    
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
