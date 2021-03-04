function ahora(){
    // Generamos la propiedad ahora (objeto) dentro del objeto window de js
    let fecha = new Date();
    let r = new Object;

    fecha = fecha.toLocaleTimeString().toString().split(':').concat(fecha.toLocaleDateString().toString().split('/'));    

    r.hora = parseInt(fecha[0]);
    r.minuto = parseInt(fecha[1]);
    r.segundo = parseInt(fecha[2]);
    r.dia = parseInt(fecha[3]);
    r.mes = parseInt(fecha[4]);
    r.ano = parseInt(fecha[5]);

    return r;
}

function formato_fecha_hora(posix, fecha, hora){
    if((posix + '').length <= 10){posix = posix * 1000;}
    posix = new Date(posix);

    if(fecha){
        fecha = posix.toLocaleDateString().split('/');
        if(fecha[0].length === 1){fecha[0] = '0' + fecha[0];}
        if(fecha[1].length === 1){fecha[1] = '0' + fecha[1];}
        fecha = fecha.join('/');
    }else{
        fecha = '';
    }

    if(hora){hora = posix.toLocaleTimeString().split(':'); hora = hora[0] + ':' + hora[1];}else{hora = '';}

    posix = fecha + ' ' + hora;
    posix = posix.toString().trim();
    return posix;
}

function formato_dinero(monto, solonum){
    // Sanitizamos la variable recibida
    monto = monto.toString().replace(',','.');
    monto = parseFloat(monto);

    if(isFinite(monto)){
        monto = monto.toFixed(2);

        if(solonum){
            return parseFloat(monto);
        }else{
            monto = monto.replace('.', ',');
            monto = '$ ' + monto;
            return monto;
        }
    }else{
        return '$_error';
    }
}