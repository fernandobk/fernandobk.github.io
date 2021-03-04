/* DOCUMENTACIÓN:
Propiedades de la clase: Estructura:
+ formasdepago: [array]
|- 0: [obj] 
|-- tipo [int]
|-- monto [int]
|- 1: [obj] 
|-- tipo [int]
|-- monto [int]
|-- nro_cheque [str]
|- 2: [obj]
|-- tipo [int]
|-- monto [int]
|-- nro_operacion [str]
|-- fecha_op_tranf [str]
|-- destino_tranf [str]

+ empleadores: [array]
|- 0: [obj]
|-- id [int]
|-- cuit [int]
|-- nombre [str]

+ operaciones: [array]
|- 0: [obj]
|-- periodo [str]
|-- monto [decimal]
|-- observaciones [str]
|-- detalles: [array]
|--- 0: [obj] 
|---- tipo [int]
|---- monto [int]
|--- 1: [obj] 
|---- tipo [int]
|---- monto [int]
|---- nro_cheque [str]
|--- 2: [obj]
|---- tipo [int]
|---- monto [int]
|---- nro_operacion [str]
|---- fecha_op_tranf [str]
|---- destino_tranf [str]
*/

class Recaudaciones{
    constructor(){
        // declaraciones
        this.id_recaudador = null;
        this.formasdepago = new Array; // Carga de detalles de pagos para despues volcarlos a Operaciones
        this.empleadores = null; // Arreglo con cuits y nombres de empleadores
        this.operaciones = new Array; // Arreglo que contiene muchos pagos y períodos
    }

    // --------- CARGA DE DATOS ----------
    async carga_init(){
        // Método que será llamado despues de instanciar la clase en la vista de carga de recaudación
        this.obt_empleadores(true);
        this.obt_ctacte(); // Cargamos las cuentas corrientes en el el selector de destino de transferencias
        // Escribimos el año actual en el campo Período
        // cargar Fecha de cobro
        this.cargar_fechas();
        this.calc_totales_modal();
    }

    async obt_empleadores(insertar){
        empleador_cargando.hidden = false;
        //Obtenemos lista de empleadores
        this.empleadores = 'recaudaciones_lsempleadores.json';
        //this.empleadores = this.empleadores + '&token=' + btoa(this.empleadores);
        this.empleadores = await fetch(this.empleadores);
        if(this.empleadores.status === 200){
            this.empleadores = await  this.empleadores.json();
        }else{
            alert('Ocurrió un error obteniendo datos.\nContactar a soporte técnico.');
            return;
        }
        
        // Cargamos lista de empleadores en la vista
        if(insertar){
            dl_empleador.innerHTML = null;
            this.empleadores.forEach( // DATALIST
                function(item, i){
                    item = item.cuit + ' - ' + item.nombre;
                    let opcion = document.createElement('option');
                        opcion.value = item;
                    dl_empleador.append(opcion);
                }
            );
        }

        empleador_cargando.hidden = true;
    }

    async obt_ctacte(){
        let obt = 'cuentas.json';
        //obt += '&token=' + btoa(obt);
        obt = await fetch(obt);
        if(obt.status === 200){
            obt = await obt.json();
            obt = obt.activos;
            obt.forEach(
                function(item){
                    if(item.rubro === 'cta_cte'){
                        sel_destino_transf.options[sel_destino_transf.options.length] = new Option(item.nombre, item.nombre);
                    }
                }
            );
        }else{
            console.error(obt);
            alert('Ocurrió un error obteniendo las cuentas corrientes');
            return;
        }
    }

    cargar_fechas(){
        let f = ahora();
        if(f.dia < 10){f.dia = '0' + f.dia;}
        if(f.mes < 10){f.mes = '0' + f.mes;}

        fecha_cobro.value = f.ano + '-' + f.mes + '-' + f.dia;

        // Fecha en el campo período
        periodo_año.value = f.ano;
        if(f.mes === '01'){
            periodo_año.value -= 1;
            periodo_mes.value = 12;
        }else{
            let m = f.mes - 1 + '';
            if(m.length === 1){m = '0' + m;}
            periodo_mes.value = m;
        }
    }

    validar_empleador(){
        if(empleador.value === ''){return false;}

        error_empleador.hidden = true;
        for(let i=0; i<this.empleadores.length; i++){
            // Si encuentra una conincidencia devuelve true y sale
            if(empleador.value === this.empleadores[i].cuit + ' - ' + this.empleadores[i].nombre){
                return true;
            }
        }
        
        // si no finalizó la funcion es porque no encontró coincidencias
        // o porque no se pudo validar el campo
        error_empleador.hidden = false;
        return false;
    }

    validar_monto(elem){
        let elem_error = elem.parentElement.children[2];

        if(elem.value === ''){return false;}

        if(elem.validity.valid){
            elem_error.hidden = true;
            elem.value = elem.value.replace(',', '.');
            elem.value = parseFloat(elem.value).toFixed(2);
            //elem.value = elem.value.replace('.', ',');
            elem.title = '';
            return true;
        }else{
            elem_error.hidden = false;
            console.info(elem.validationMessage);
            elem.title = elem.validationMessage;
            return false;
        }
    }

    traducir_empleador_a_id(){
        if(this.validar_empleador){
            for(let i=0; i<this.empleadores.length; i++){
                if(empleador.value === this.empleadores[i].cuit + ' - ' + this.empleadores[i].nombre){
                    return this.empleadores[i].id;
                }
            }

            // Si no encontró coincidencia devuelve false
            return false;
        }
    }

    carga_fp(t){ // t = tipo
        // Cargamos el objeto formasdepago declarado en el constructor de la instancia.
        switch(t){
            case 0: // Efectivo
                if(valor_pago_0.value > 0){
                    this.formasdepago.push(
                        {
                            "tipo": 0, 
                            "monto": parseFloat(valor_pago_0.value).toFixed(2)
                        }
                    );

                    valor_pago_0.value = null;
                }else{
                    alert('El valor a cargar no puede ser cero.');
                }
            break;
            case 1: // Cheque
                if(parseFloat(valor_pago_1.value) && nro_cheque.value){
                    // Cargamos al objeto formadepago
                    this.formasdepago.push(
                        {
                            "tipo":1,
                            "monto": parseFloat(valor_pago_1.value).toFixed(2),
                            "nro_cheque": nro_cheque.value,
                        }
                    );

                    // Restablecemos los campos
                    valor_pago_1.value = null;
                    nro_cheque.value = null;
                }
            break;
            case 2: // Transferencia
                if( valor_pago_2.value > 0
                    /*&& nro_operacion.value
                    && fecha_op_transf.value*/
                    && sel_destino_transf.selectedIndex
                ){
                    this.formasdepago.push({
                        "tipo":2,
                        "monto": parseFloat(valor_pago_2.value).toFixed(2),
                        /*"nro_operacion": nro_operacion.value,
                        "fecha_op_transf": fecha_op_transf.value,*/
                        "destino_transf": sel_destino_transf.value
                    });

                    valor_pago_2.value = null;
                    /*nro_operacion.value = null;
                    fecha_op_transf.value = null;*/
                    sel_destino_transf.selectedIndex = 0;
                }
            break;
        }

        // Redibujar tabla de detalles
        this.dibujar_tabla_fp();
        //console.info(this.formasdepago);
    }

    calc_totales_modal(){
        let tot_efectivo = 0, tot_cheque = 0, tot_tranf = 0;
        if(this.formasdepago.length){
            this.formasdepago.forEach(
                function(item){
                    switch(item.tipo){
                        case 0: tot_efectivo += parseFloat(item.monto); break;
                        case 1: tot_cheque += parseFloat(item.monto); break;
                        case 2: tot_tranf += parseFloat(item.monto); break;
                    }
                }
            );
        }
        detalle_efectivo.value = '$ ' + tot_efectivo;
        detalle_cheques.value = '$ ' + tot_cheque;
        detalle_transferencias.value = '$ ' + tot_tranf;
        return (tot_efectivo + tot_cheque + tot_tranf).toFixed(2);
    }

    dibujar_tabla_fp(){
        tabla_detalles_cobro.innerHTML = null;
        
        if(this.formasdepago.length === 0){tabla_sin_datos.hidden = false;}else{tabla_sin_datos.hidden = true;}
        
        for(let i=0; i<this.formasdepago.length; i++){
            let btn_borrar = document.createElement('button');
                btn_borrar.innerHTML = '&times;';
                btn_borrar.classList.add('btn', 'btn-sm', 'border');
                btn_borrar.onclick = function(){borrar_fp(i);} 

            let fila = tabla_detalles_cobro.insertRow(tabla_detalles_cobro.childElementCount);
                fila.insertCell(0).innerText = tabla_detalles_cobro.childElementCount;
                fila.insertCell(1).innerText = formato_dinero(this.formasdepago[i].monto);

            switch(this.formasdepago[i].tipo){
                case 0: 
                    fila.insertCell(2).innerText = 'Efectivo';
                    fila.insertCell(3).innerText = '-';
                break;
                case 1:
                    fila.insertCell(2).innerText = 'Cheque';
                    fila.insertCell(3).innerText = 'Nº Cheque: ' + this.formasdepago[i].nro_cheque;
                break;
                case 2:
                    fila.insertCell(2).innerText = 'Transferencia';
                    fila.insertCell(3).innerText = /*'Operación: ' + this.formasdepago[i].nro_operacion + '\nFecha: ' + this.formasdepago[i].fecha_op_transf +*/ 'Destino: ' + this.formasdepago[i].destino_transf; //[1];
                break;
            }
            
            fila.insertCell(4).append(btn_borrar);
            //fila.insertCell(4). = '<button class="btn btn-sm border" onclick="carga.formasdepago['+i+']=undefined;carga.dibujar_tabla_fp();"></button>';
        }
    }

    btn_agregar(){
        // Realizamos validaciones y lanzamos errores correspondientes
        if(isNaN(valor_total_aporte.value) || parseInt(valor_total_aporte.value) === 0){alert('Monto total del aporte colectivo inválido');return;}
        if(valor_total_aporte.value !== this.calc_totales_modal()){alert('El monto total y el monto detallado deben coincidir');return;}

        // Añadimos datos al arreglo
        this.operaciones.push(
            {
                periodo: periodo_año.value + '-' + periodo_mes.value,
                monto_total: parseFloat(valor_total_aporte.value).toFixed(2),
                observaciones: observaciones.value,
                detalles: this.formasdepago
            }
        );

        this.formasdepago = new Array; // Una vez volvados los datos blanqueamos el arreglo
        valor_total_aporte.value = '';
        observaciones.value = '';
        this.calc_totales_modal();
        this.dibujar_tabla_fp();
        this.dibujar_tabla_ops();
    }

    dibujar_tabla_ops(){
        tabla_operaciones.innerHTML = null; // Blanqueo de tabla
        if(this.operaciones.length){
            tabla_ops_sin_datos.hidden = true;
            
            for(let i=0; i<this.operaciones.length; i++){

                // Armamos objeto para columna Observaciones
                let dtl_observaciones = document.createElement('details');
                    dtl_observaciones.append(this.operaciones[i].observaciones);
                
                // Armamos objeto para columna Detalles
                let dtl_formasdepago = '<details>';
                for(const detalles of this.operaciones[i].detalles){
                    dtl_formasdepago += '<hr />';
                    switch(detalles.tipo){
                        case 0:
                            dtl_formasdepago += '&bull;&nbsp;Efectivo:';
                            dtl_formasdepago += '<br />Monto: $ ' + detalles.monto;
                        break;
                        case 1:
                            dtl_formasdepago += '&bull;&nbsp;Cheque:';
                            dtl_formasdepago += '<br />Monto: $ ' + detalles.monto;
                            dtl_formasdepago += '<br />Nro cheque: ' + detalles.nro_cheque;
                        break;
                        case 2:
                            dtl_formasdepago += '&bull;&nbsp;Transferencia:';
                            dtl_formasdepago += '<br />Monto: $ ' + detalles.monto;
                            /*dtl_formasdepago += '<br />Nro Operación: ' + detalles.nro_operacion;
                            dtl_formasdepago += '<br />Fecha Operación: ' + detalles.fecha_op_transf;*/
                            dtl_formasdepago += '<br />Destino: ' + detalles.destino_transf;
                        break;
                    }
                }
                dtl_formasdepago += '</details>';

                let btn_borrar = document.createElement('button');
                    btn_borrar.classList.add('btn', 'btn-sm', 'border');
                    btn_borrar.innerHTML = '&times;';
                    btn_borrar.onclick = function(){borrar_ops(i);}

                let fila = tabla_operaciones.insertRow();
                    fila.insertCell(0).innerText = tabla_operaciones.rows.length;
                    fila.insertCell(1).innerText = this.operaciones[i].periodo;
                    fila.insertCell(2).innerText = '$ ' + this.operaciones[i].monto_total;
                    fila.insertCell(3).append(dtl_observaciones);
                    fila.insertCell(4).innerHTML = dtl_formasdepago;
                    fila.insertCell(5).append(btn_borrar);
            }
            
        }else{
            tabla_ops_sin_datos.hidden = false;
        }
    }

    async btn_guardar(){
        if(this.operaciones.length === 0){alert('Agregue detalles del cobro'); return;}
        
        // Comprobamos campos superiores
        if(
            fecha_cobro.validationMessage 
            || !this.traducir_empleador_a_id()
            || nro_recibo_1.validationMessage
            || nro_recibo_2.validationMessage
        ){
            alert('Por favor, complete correctamente todos los campos necesarios.'); 
            return;
        }

        // Si todo sale bien el programa no terminará, por lo tanto seguirá a continuación.
        let envio = new Object;
            envio.fecha_cobro = fecha_cobro.value;
            envio.empleador = this.traducir_empleador_a_id();
            envio.nro_recibo = nro_recibo_1.value + '-' + nro_recibo_2.value;
            envio.nro_acta = parseInt(nro_acta.value);
            envio.operaciones = this.operaciones;

        envio = JSON.stringify(envio);

        envio = await fetch(
            '/', 
            {
                method: 'POST',
                body: envio
            }
        );
        if(envio.status === 200){
            alert('✓    El cobro se registró correctamente.');
            empleador.value = null;
            nro_recibo_1.value = 0;
            nro_recibo_2.value = 0;
            nro_acta.value = 0;
            valor_total_aporte.value = 0;
            observaciones.value = null;

            this.formasdepago = new Array;
            this.operaciones = new Array;
            this.dibujar_tabla_fp();
            this.dibujar_tabla_ops();
            scrollTo(0,0);
        }else{
            alert('✗ Ocurrió un error guardando los datos. Por favor reintentar y consultar a soporte.');
        }
    }

    // ------------ LISTADO DE DATOS -----------
    async listar(){
        tabla_cargando.hidden = false; // mostrar spinner
        tabla.hidden = true;
        tabla.innerHTML = null;

        let obt = 'recaudaciones_verpendientes.json';
            obt = await fetch(obt);
        
        switch(obt.status){
            case 200: obt = await obt.json(); break;
            case 204: obt = new Array; break;
            default: alert('Ocurrió un error obteniendo datos.'); return;
        }

        subtitulo.innerText = 'Nombre de usuario del recaudador: ' + window.ameco.username;
        cant_registros.innerText = obt.length;
        if(obt.length){tabla_sin_datos.hidden = true;}else{tabla_sin_datos.hidden = false;}
        let total_efectivo = 0;
        let total_cheque = 0;
        let total_transf = 0;

        for(let i=0; i<obt.length; i++){
            // Sumamos los totales:
            obt[i].detalles.forEach(
                function(item){
                    switch(item.tipo){
                        case 0: total_efectivo += item.monto; break; // Tipo de pago: Efectivo.
                        case 1: total_cheque += item.monto; break; // Tipo de pago: Cheque.
                        case 2: total_transf += item.monto; break; // Tipo de pago: Transferencia.
                    }
                }
            );
            
            // Configuramos botón Ver Detalles
            let btn_detalles = document.createElement('button');
                btn_detalles.classList.add('btn', 'btn-sm', 'fas', 'fa-eye');
                btn_detalles.onclick = function(){
                    id_recaudaciones.innerText = obt[i].id;
                    empleador.innerText = obt[i].empleador + '\n(' + obt[i].cuit + ')';
                    
                    fecha_alta.innerText = formato_fecha_hora(obt[i].fecha_alta, true, true) + ' hs.';
                    fecha_cobro.innerText = formato_fecha_hora(obt[i].fecha_cobro, true);
                    
                    nro_recibo.innerText = obt[i].nro_recibo;
                    nro_acta.innerText = obt[i].nro_acta;
                    periodo.innerText = obt[i].periodo;
                    monto_total.innerText = '$ ' + obt[i].monto_total.toFixed(2);
                    
                    observaciones.innerText = function(o){if(o){return o;}else{return '-';}}(obt[i].observaciones);
                    rendido.innerText = function(f){if(f){return formato_fecha_hora(f, true, true);}else{return 'No rendido aún'}}(obt[i].rendido);
                    
                    detalles.innerText = null;
                    obt[i].detalles.forEach(
                        function(item){
                            switch(item.tipo){
                                case 0:
                                    detalles.innerHTML += '&bull;&nbsp;Efectivo:';
                                    detalles.innerHTML += '<br />&emsp;Monto: $ ' + item.monto.toFixed(2);
                                break;
                                case 1:
                                    detalles.innerHTML += '&bull;&nbsp;Cheque:';
                                    detalles.innerHTML += '<br />&emsp;Monto: $ ' + item.monto.toFixed(2);
                                    detalles.innerHTML += '<br />&emsp;Nro cheque: ' + item.nro_cheque;
                                break;
                                case 2:
                                    detalles.innerHTML += '&bull;&nbsp;Transferencia:';
                                    detalles.innerHTML += '<br />&emsp;Monto: $ ' + item.monto.toFixed(2);
                                    /*detalles.innerHTML += '<br />&emsp;Nro Operación: ' + item.nro_operacion;
                                    detalles.innerHTML += '<br />&emsp;Fecha Operación: ' + item.fecha_op_transf;*/
                                    detalles.innerHTML += '<br />&emsp;Destino: ' + item.destino_transf[1];
                                break;
                                default: detalles.innerHTML += JSON.stringify(item);
                            }
                            detalles.innerHTML += '<hr />';
                        }
                    );

                    $('#modal_detalles').modal('show');
                }

            let btn_borrar = document.createElement('button');
                btn_borrar.classList.add('btn', 'btn-sm', 'fas', 'fa-trash-alt');
                btn_borrar.onclick = async function(){
                    // enviamos solicitud XHR con id para borrar el registro
                    if(confirm('¿Borrar el registro?\nIdentificador: ' + obt[i].id)){
                        let f = '/api/?m=recaudaciones&v=borrar';
                            f = f + '&token=' + btoa(f);
                            f = await fetch(f, {method: 'POST', body: JSON.stringify({id: obt[i].id})});
                        if(f.status === 202){
                            alert('Registro borrado.\nAhora se va a recargar la lista.'); 
                            tabla.hidden = true;
                            tabla_cargando.hidden = false;
                            location.reload();
                        }else{
                            alert('Ocurrió un error al intentar borrar este registro.\nEsto solo es una demostración');
                        }
                    }
                }

            // Cargamos tabla principal
            let fila = tabla.insertRow(tabla.childElementCount);
                fila.insertCell(0).innerText = tabla.childElementCount;
                fila.insertCell(1).innerText = obt[i].empleador;
                fila.insertCell(2).innerText = formato_fecha_hora(obt[i].fecha_alta, true);
                fila.insertCell(3).innerText = formato_dinero(obt[i].monto_total);
                let opciones = fila.insertCell(4);
                    opciones.append(btn_detalles);
                    opciones.append(btn_borrar);
        }

        // Cargamos tabla de totales
        tabla_totales.children[0].innerText = formato_dinero(total_efectivo);
        tabla_totales.children[1].innerText = formato_dinero(total_cheque);
        tabla_totales.children[2].innerText = formato_dinero(total_transf);
        tabla_totales.children[3].innerText = formato_dinero(total_efectivo + total_cheque + total_transf);

        tabla_cargando.hidden = true; // Esconde spinner
        tabla.hidden = false;
    }
}
