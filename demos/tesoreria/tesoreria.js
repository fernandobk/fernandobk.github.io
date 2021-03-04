// Clase para las operaciones del módulo de contabilidad

class Tesoreria_alta{
    constructor(){
        this.cuentas = null; // Pila de cuentas obtenidas con fetch
        this.movimiento = new Object;
        this.clasif_asiento = 1; // Pestaña superior. 1 = Egreso, 2 = Ingreso, 3= Mov. entre ctas.
        this.movimiento.debe = new Array;
        this.movimiento.haber = new Array;
        this.movimiento.sumas_iguales = null;
    }

    async init(){
        // Ejecutar este método inmediatamente despues de instanciar para que se ejecuten los métodos asíncronos

        this.cargar_fecha_mov();
        await this.obt_cuentas();
        this.cambiar_clasif_asiento(tab_egreso);
    }

    cargar_fecha_mov(){
        let f = ahora();
        if(f.dia < 10){f.dia = '0' + f.dia;}
        if(f.mes < 10){f.mes = '0' + f.mes;}

        fecha_mov.value = f.ano + '-' + f.mes + '-' + f.dia;
        comentario.value = '';
    }

    async obt_cuentas(){
        this.cuentas = 'cuentas.json';
        //this.cuentas += '&token=' + btoa(this.cuentas);
        this.cuentas = await fetch(this.cuentas);
        if(this.cuentas.status === 200){
            this.cuentas = await this.cuentas.json();
            // Eliminamos cuentas de Egresos e Ingresos si tienen rubro:false.
            // Esto se utiliza para quitar el item Apotes Socio de la lista de cuentas de ingresos
            for(let i=0; i<this.cuentas.egresos.length; i++){
                if(this.cuentas.egresos[i].rubro === false){
                    this.cuentas.egresos.splice(i,1);
                }
            }

            for(let i=0; i<this.cuentas.ingresos.length; i++){
                if(this.cuentas.ingresos[i].rubro === false){
                    this.cuentas.ingresos.splice(i,1);
                }
            }

            return true;

        }else{
            console.error(this.cuentas);
            alert('Ocurrió un error obteniendo las cuentas');
            return false;
        }
    }

    cambiar_clasif_asiento(elem){
        // Comprobamos si hay algo cargado en libro diario y preguntamos a usuario
        if(this.movimiento.debe.length || this.movimiento.haber.length){
            if(confirm('Los datos que cargó hasta ahora no se guardaran.\n¿Seguro que desea cambiar de pestaña?')){
                this.movimiento.debe = new Array;
                this.movimiento.haber = new Array;
                this.dibujar_tablas();
            
            }else{
                return;
            }
        }

        // Cargamos la clase de cuenta segun la pestaña en al que nos encontramos
        switch(elem.id){
            case 'tab_egreso': this.clasif_asiento = 1; break;
            case 'tab_ingreso': this.clasif_asiento = 2; break;
            case 'tab_movctas': this.clasif_asiento = 3; break;
            default: alert('ERROR\ncargando la pestaña. Valor no determinado.'); return;
        }

        // Una vez obtenidas las cuentas verificamos en qué pestaña nos encontramos y cargamos las cuentas corresponientes
        // Generamos nuevos arreglos con la cuentas a cargar
        let cuentas_p1 = new Array;
        let cuentas_p2 = new Array;
        switch(this.clasif_asiento){
            case 1: // Nos encontramos en la pestaña Egreso
                cuentas_p1 = this.cuentas.egresos;
                cuentas_p2 = this.cuentas.activos.concat(this.cuentas.pasivos);
            break;
            case 2: // Nos encontramos en la pestaña Ingreso
                cuentas_p1 = this.cuentas.activos;
                cuentas_p2 = this.cuentas.ingresos;
            break;
            case 3: // Nos encontramos en Movimiento entre cuentas
                cuentas_p1 = this.cuentas.activos;
                cuentas_p2 = this.cuentas.activos;
            break;
        }

        // Insertamos las cuentas en los datalist corresponientes
        // Insertamos las cuentas correspondientes en "Partida"
        p1_dl_cuenta.innerHTML = null;
        for(let i=0; i<cuentas_p1.length; i++){
            let opcion = document.createElement('option');
                opcion.value = cuentas_p1[i].nombre;

            p1_dl_cuenta.append(opcion);
        }

        // Insertamos las cuentas correspondientes en "Contrapartida"
        p2_dl_cuenta.innerHTML = null;
        for(let i=0; i<cuentas_p2.length; i++){
            let opcion = document.createElement('option');
                opcion.value = cuentas_p2[i].nombre;

            p2_dl_cuenta.append(opcion);
        }

        // Manejamos la vista
        tab_egreso.classList.remove('active', 'font-weight-bold');
        tab_ingreso.classList.remove('active', 'font-weight-bold');
        tab_movctas.classList.remove('active', 'font-weight-bold');
        elem.classList.add('active', 'font-weight-bold');
        titulo_clasif_asiento.innerText = elem.innerText;
        p1_in_cuenta.value = null;
        p1_monto.value = null;
        p1_comprobante.value = null;
        p1_proveedor_razon.value = null;
        p1_proveedor_cuit.value = null;
        p2_in_cuenta.value = null;
        p2_monto.value = null;
        p2_comprobante.value = null;

        // Ocultamos o mostramos campos "proveedor"
        if(this.clasif_asiento === 1){p1_proveedor.hidden = false}else{p1_proveedor.hidden = true;}
    }

    validar_cuenta(elem){
        let dl_origen = elem.parentElement.children[0].options;
        let ls_cuentas = new Array;
        let elem_error = elem.parentElement.children[3];
        if(elem.value === ''){return false;}

        // Llenamos el arreglo dl_origen con los elementos del datalist correspondiente
        for(let i=0; i<dl_origen.length; i++){ls_cuentas.push(dl_origen[i].value);}

        elem_error.hidden = true;
        if(elem.validity.valid){
            for(let i=0; i<ls_cuentas.length; i++){
                // Si encuentra una conincidencia devuelve true y sale
                if(elem.value === ls_cuentas[i]){return true;}
            }
        }

        // si no finalizó la funcion es porque no encontró coincidencias
        // o porque no se pudo validar el campo
        elem_error.hidden = false;
        return false;
    }

    validar_monto(elem){
        let elem_error = elem.parentElement.children[2];
        if(elem.value === ''){return false;}
        if(elem.validity.valid){
            elem_error.hidden = true;
            elem.value = elem.value.replace(',', '.');
            elem.value = parseFloat(elem.value);
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

    carga_asiento(partida){
        if(partida === 1){
            if(this.validar_cuenta(p1_in_cuenta) && this.validar_monto(p1_monto)){
                // Cargamos data al objeto creado en el constructor de la instancia
                this.movimiento.debe.push(
                    {
                        cuenta: p1_in_cuenta.value,
                        monto: parseFloat(p1_monto.value),
                        detalle: p1_comprobante.value,
                        proveedor_razon: p1_proveedor_razon.value,
                        proveedor_cuit: p1_proveedor_cuit.value
                    }
                );

                // Limpiamos campos
                p1_in_cuenta.value = null;
                p1_monto.value = null;
                p1_comprobante.value = null;
            }

        }else{
            if(this.validar_cuenta(p2_in_cuenta) && this.validar_monto(p2_monto)){
                this.movimiento.haber.push(
                    {
                        "cuenta": p2_in_cuenta.value,
                        "monto": parseFloat(p2_monto.value),
                        "detalle": p2_comprobante.value
                    }
                );

                //console.info(this.movimiento.haber);
                // Limpiamos campos
                p2_in_cuenta.value = null;
                p2_monto.value = null;
                p2_comprobante.value = null;
            }
        }

        // Cargamos la tabla
        this.dibujar_tablas();
    }

    dibujar_tablas(){
        let suma_debe = 0, suma_haber = 0;
        tb_librodiario.innerHTML = null; // Limpiamos completamente la tabla antes de comenzar
        // Primero dibujamos el DEBE
        for(let i=0; i<this.movimiento.debe.length; i++){
            let fila = tb_librodiario.insertRow(tb_librodiario.rows.length);
            let celda0 = fila.insertCell(0);
                celda0.classList.add('text-left');
                celda0.innerText = this.movimiento.debe[i].cuenta;
                celda0.title = this.movimiento.debe[i].detalle;

            fila.insertCell(1).innerText = formato_dinero(this.movimiento.debe[i].monto);
            fila.insertCell(2).innerText = null;

            // Realizamos las sumas totales
            suma_debe += this.movimiento.debe[i].monto;
        }

        // Ahora lo mismo con el HABER
        for(let i=0; i<this.movimiento.haber.length; i++){
            let fila = tb_librodiario.insertRow(tb_librodiario.rows.length);
            let celda0 = fila.insertCell(0);
                celda0.classList.add('text-right');
                celda0.innerText = 'a ' + this.movimiento.haber[i].cuenta;
                celda0.title = this.movimiento.haber[i].detalle;
            
            fila.insertCell(1).innerText = null;
            fila.insertCell(2).innerText = formato_dinero(this.movimiento.haber[i].monto);

            // Realizamos las sumas totales
            suma_haber += this.movimiento.haber[i].monto;
        }

        // Mostramos las sumas        
        tb_sumasiguales.children[1].innerText = formato_dinero(suma_debe);
        tb_sumasiguales.children[2].innerText = formato_dinero(suma_haber);

        // Cargamos variable sumas_iguales
        if(suma_debe === suma_haber){
            this.movimiento.sumas_iguales = suma_debe;
        }else{
            this.movimiento.sumas_iguales = null;
        }
    }

    async guardar(){
        if(!this.movimiento.debe.length){alert('Debe cargar detalles del movimiento.'); return;}

        if(
            tb_sumasiguales.children[1].innerText === tb_sumasiguales.children[2].innerText
            && fecha_mov.validity.valid
            && comentario.validity.valid
            && comentario.value !== ''
        ){
            //if(fecha_mov.value.split('-')[0] != ahora().ano){alert('No puede cargar un movimiento en un año distinto al actual'); return;}
            // Agregamos las clases de cuenta que estamos agregando segun la pestaña en la que estamos
            switch(this.clasif_asiento){
                case 1: this.movimiento.clase = {debe: 'Egresos', haber: 'Activos'}; break;
                case 2: this.movimiento.clase = {debe: 'Activos', haber: 'Ingresos'}; break;
                case 3: this.movimiento.clase = {debe: 'Activos', haber: 'Activos'}; break;
                default:
                    alert('ERROR\n generando el objeto a enviar.\n No se identificó la clase de asiento que se va a ingresar.');
                    return;
            }

            this.movimiento.fecha = fecha_mov.value;
            this.movimiento.comentario = comentario.value;
            btn_guardar.disabled = true;

            // Enviamos a la API
            //console.info(this.movimiento);
            let obt = 'tesoreria_guardarmov.json';
                obt = await fetch(
                    obt,
                    {
                        method: 'POST',
                        body: JSON.stringify(this.movimiento)
                    }    
                );

                if(obt.status === 200){
                    obt = await obt.json()
                    alert('El movimiento se guardó correctamente\ncon el código: ' + obt);
                    this.limpiar_form();
                }else{
                    console.error(obt);
                    alert('Ocurrió un error al guardar el movimiento. Por favor contactar a soporte.');
                }

            btn_guardar.disabled = false;
        }else{
            if(!fecha_mov.validity.valid){alert('Complete la fecha del movimiento'); return;}
            if(!comentario.validity.valid || comentario.value === ''){alert('Revise el comentario sobre el movimiento'); return;}
            if(this.movimiento.debe.length === 0 || this.movimiento.haber.length === 0){
                alert('Debe cargar los detalles del movimiento según la ley de partida doble'); 
                return;}
            if(tb_sumasiguales.children[1].innerText !== tb_sumasiguales.children[2].innerText){
                alert('Las sumas totales deben resultar iguales');
                return;
            }
        }
    }

    limpiar_form(){
        this.movimiento = new Object;
        this.movimiento.debe = new Array;
        this.movimiento.haber = new Array;
        this.movimiento.sumas_iguales = null;
        this.cargar_fecha_mov();
        comentario.value = null;
        p1_in_cuenta.value = null;
        p1_monto.value = null;
        p1_comprobante.value = null;
        p1_proveedor_razon.value = null;
        p1_proveedor_cuit.value = null;
        p2_in_cuenta.value = null;
        p2_monto.value = null;
        p2_comprobante.value = null;
        tb_librodiario.innerHTML = null;
        tb_sumasiguales.children[1].innerText = '--';
        tb_sumasiguales.children[2].innerText = '--';
        return true;
    }
}

class Tesoreria_ls{
    constructor(){
        this.cuentas = null; //Objeto Promise;
        this.obt = null; //Objeto Promise
    }

    async init(){ // Aqui dentro esta el método para la ventana de detalles
        // Acciones posteriores a la instancia
        await this.obt_cuentas(true);
        await this.listar();        

        // Agregamos evento al abrir modal Detalles
        $('#modal_detalles').on(
            'show.bs.modal', 
            async function (e) {
                modal_loading.hidden = false;
                modal_content.hidden = true;
                
                let obt = 'tesoreria_detallemov.json';
                    obt = await fetch(obt);

                if(obt.status === 200){
                    modal_content.hidden = false;
                    obt = await obt.json();
                    referencia.innerText = obt[0].referencia;
                    fecha_mov.innerText = formato_fecha_hora(obt[0].fecha, true); 
                    fecha_alta.innerText = formato_fecha_hora(obt[0].referencia/10, true, true) + ' hs.';
                    cargadopor.innerText = obt[0].usuario;
                    comentario.innerText = obt[0].comentario;

                    // Ahora llenamos tablas
                    tb_librodiario.innerHTML = null;

                    obt.forEach(
                        function(item, i){
                            let fila = tb_librodiario.insertRow();
                            let celda_clase = fila.insertCell(0);
                            let celda_cuenta = fila.insertCell(1);

                            if(item.partida === 'Debe'){
                                celda_clase.innerText = item.clase==='Activos'? '+' : '-';
                                celda_cuenta.classList.add('text-left');
                                celda_cuenta.innerText = '';
                                fila.insertCell(2).innerText = formato_dinero(item.monto);
                                fila.insertCell(3).innerText = '';

                            }else if(item.partida === 'Haber'){
                                celda_clase.innerText = item.clase==='Activos'? '-' : '+';
                                celda_cuenta.classList.add('text-right');
                                celda_cuenta.innerText = 'a';
                                fila.insertCell(2).innerText = '';
                                fila.insertCell(3).innerText = formato_dinero(item.monto);
                            }

                            celda_clase.innerText += item.clase.substring(0,1);

                            if(
                                celda_clase.innerText.substring(1,2) === 'I'
                                || celda_clase.innerText.substring(1,2) === 'E'
                            ){
                                celda_clase.innerText = celda_clase.innerText.substring(1,2);
                            }

                            celda_cuenta.innerText += ' ' + item.cuenta;
                            if(item.detalle){celda_cuenta.innerText += '\n(' + item.detalle + ')';}
                            if(item.proveedor_razon || item.proveedor_cuit){

                                celda_cuenta.innerText += '\n(Proveedor: ' + item.proveedor_razon + '\nCUIT: ' + item.proveedor_cuit + ')';
                            }
                        }
                    );

                    sumas_iguales.innerText = formato_dinero(obt[0].sumas_iguales);
                }

                modal_loading.hidden = true;
                modal_content.hidden = false;
            }
        )
    }

    async obt_cuentas(insertar){
        let url_cuentas = 'cuentas.json';
        this.cuentas = await fetch(url_cuentas);
        if(this.cuentas.status === 200){
            this.cuentas = await this.cuentas.json();
            //this.cuentas = this.cuentas.activos.concat(this.cuentas.egresos); // Aqui juntamos las dos listas que nos interesan en este campo
            this.cuentas = Object.entries(this.cuentas);

            if(insertar){
                for(let i=0; i<this.cuentas.length; i++){
                    let optgroup_clase = document.createElement('optgroup');
                    optgroup_clase.label = this.cuentas[i][0].toUpperCase();
                    for(let j=0; j<this.cuentas[i][1].length; j++){
                        let option_cuenta = document.createElement('option');
                        option_cuenta.innerText = this.cuentas[i][1][j].nombre;
                        option_cuenta.value = this.cuentas[i][1][j].nombre;
                        optgroup_clase.append(option_cuenta);
                    }
                    sel_cuenta.append(optgroup_clase);
                }

                cargando_cuentas.hidden = true;
            }
        }
    }

    async listar(){
        await this.obt_data();
        if(this.obt.length){tabla_sin_datos.hidden = true;}else{tabla_sin_datos.hidden = false;}
        this.dibujar_tabla();
        seccion_tabla.hidden = false;
    }

    async obt_data(){
        let url_data = 'tesoreria_lsmov.json';
        //if(sel_cuenta.value){url_data += '&cuenta=' + encodeURI(sel_cuenta.value);}
        //if(parseInt(fechaegreso_mes.value)){url_data += '&fechaegreso=' + fechaegreso_ano.value + '-' + fechaegreso_mes.value;}
        //if(parseInt(fechaalta_mes.value)){url_data += '&fechaalta=' + fechaalta_ano.value + '-' + fechaalta_mes.value;}

        this.obt = await fetch(url_data);
        if(this.obt.status === 200){
            // Obtenemos datos JSON
            this.obt = await this.obt.json();
            
        }else if(this.obt.status === 204){
            this.obt = new Array;
        }else{
            console.error(this.obt)
            alert('Ocurrió un error obteniendo datos.\nPor favor contactar a soporte.');
        }
    }

    dibujar_tabla(){
        tabla_ls.innerHTML = null; // Limpiamos la tabla antes de comenzar
        let total = 0;

        for(let i=0; i<this.obt.length; i++){
            // Escribimos el campo Comentario limitado
            let comentario = this.obt[i].comentario;

            if(comentario.length > 50 || comentario.split('\n').length > 1){
                comentario = comentario.split('\n')[0].substring(0,50).concat('...');
            }

            // Genramos el botón que va a mostrar los detalles del movimiento en una ventana modal
            let ver = document.createElement('button');
                ver.ref = this.obt[i].referencia;
                ver.classList.add('btn', 'btn-sm', 'border', 'fas', 'fa-eye');
                ver.onclick = function(){
                    window.tmp = this.ref;
                    $('#modal_detalles').modal('show'); 
                }

            // Sumamos la variable "total"
            total += parseFloat(this.obt[i].monto);

            let fila = tabla_ls.insertRow();
                fila.insertCell(0).innerText = tabla_ls.rows.length;
                fila.insertCell(1).innerText = formato_fecha_hora(this.obt[i].fecha, true);
                //fila.insertCell(2).innerText = this.obt[i].comentario.substring(0,50) ;
                fila.insertCell(2).innerText = comentario;
                fila.insertCell(3).innerText = formato_dinero(this.obt[i].monto);
                fila.insertCell(4).innerText = this.obt[i].usuario;
                fila.insertCell(5).append(ver);
        }

        // Escribimos el campo de total listado
        total_lista.innerText = formato_dinero(total);
    }
}


class Tesoreria_informes{
    async gen_informe_anual(){ // Generar informe anual de cuentas
        // Validaciones
        if(!input_ano.value){alert('Ingrese un año valido.'); return;}
        // Blanqueamos tabla
        tabla.innerHTML = null;
        // Cargamos sub-titulo
        subtitulo.innerText = 'Generado el ' + formato_fecha_hora(Date.now(), true, true) + ' hs.';

        // Si está todo bien procedemos a la consulta
        let obt = '/api/?m=tesoreria&v=informeanual';
            obt += '&clase=' + sel_clase_ctas.value;
            obt += '&ano=' + input_ano.value;
            obt += '&token=' + btoa(obt);
            obt = await fetch(obt);

        if(obt.status === 203){
            obt = await obt.json();

            let total01 = 0;
            let total02 = 0;
            let total03 = 0;
            let total04 = 0;
            let total05 = 0;
            let total06 = 0;
            let total07 = 0;
            let total08 = 0;
            let total09 = 0;
            let total10 = 0;
            let total11 = 0;
            let total12 = 0;
            let total_total = 0;

            // Procedemos a cargar la tabla
            for(let i=0; i<obt.length; i++){
                tabla_sin_datos.hidden = true;

                // calulamos el total de cada periodo
                total01 += obt[i].periodo01;
                total02 += obt[i].periodo02;
                total03 += obt[i].periodo03;
                total04 += obt[i].periodo04;
                total05 += obt[i].periodo05;
                total06 += obt[i].periodo06;
                total07 += obt[i].periodo07;
                total08 += obt[i].periodo08;
                total09 += obt[i].periodo09;
                total10 += obt[i].periodo10;
                total11 += obt[i].periodo11;
                total12 += obt[i].periodo12;

                //Calculamos el total de este empleador
                let total_cuenta = 0;

                total_cuenta += obt[i].periodo01;
                total_cuenta += obt[i].periodo02;
                total_cuenta += obt[i].periodo03;
                total_cuenta += obt[i].periodo04;
                total_cuenta += obt[i].periodo05;
                total_cuenta += obt[i].periodo06;
                total_cuenta += obt[i].periodo07;
                total_cuenta += obt[i].periodo08;
                total_cuenta += obt[i].periodo09;
                total_cuenta += obt[i].periodo10;
                total_cuenta += obt[i].periodo11;
                total_cuenta += obt[i].periodo12;

                // Total de totales
                total_total += total_cuenta;

                let fila = tabla.insertRow();
                    fila.insertCell(0).innerText = tabla.rows.length;
                    fila.insertCell(1).innerText = obt[i].cuenta;
                    fila.insertCell(2).innerText = obt[i].periodo01;
                    fila.insertCell(3).innerText = obt[i].periodo02;
                    fila.insertCell(4).innerText = obt[i].periodo03;
                    fila.insertCell(5).innerText = obt[i].periodo04;
                    fila.insertCell(6).innerText = obt[i].periodo05;
                    fila.insertCell(7).innerText = obt[i].periodo06;
                    fila.insertCell(8).innerText = obt[i].periodo07;
                    fila.insertCell(9).innerText = obt[i].periodo08;
                    fila.insertCell(10).innerText = obt[i].periodo09;
                    fila.insertCell(11).innerText = obt[i].periodo10;
                    fila.insertCell(12).innerText = obt[i].periodo11;
                    fila.insertCell(13).innerText = obt[i].periodo12;
                    fila.insertCell(14).innerText = total_cuenta;
            }

            // Cargamos ultima fila con totales
            let fila = tabla.insertRow();
                fila.style.fontWeight = 'bold';
                fila.insertCell(0).innerText = '#';
                fila.insertCell(1).innerText = 'TOTALES ($)';
                fila.insertCell(2).innerText = total01;
                fila.insertCell(3).innerText = total02;
                fila.insertCell(4).innerText = total03;
                fila.insertCell(5).innerText = total04;
                fila.insertCell(6).innerText = total05;
                fila.insertCell(7).innerText = total06;
                fila.insertCell(8).innerText = total07;
                fila.insertCell(9).innerText = total08;
                fila.insertCell(10).innerText = total09;
                fila.insertCell(11).innerText = total10;
                fila.insertCell(12).innerText = total11;
                fila.insertCell(13).innerText = total12;
                fila.insertCell(14).innerText = total_total;

        }else{
            tabla_sin_datos.hidden = false;
        }

        seccion_tabla.hidden = false;
        seccion_selector.hidden = true;
    }

    async informe_saldos(){
        let activo_total = 0;
        let pasivo_total = 0;

        let obt = '/api/?m=tesoreria&v=saldos';
            obt += '&token=' + btoa(obt);
            obt = await fetch(obt);

        if(obt.status === 203){
            obt = await obt.json();

            obt.activos.forEach(
                function(item){
                    activo_total += (item.deudor - item.acreedor);
                    let fila = tabla_activo.insertRow();
                        fila.insertCell(0).innerText = item.cuenta;
                        fila.insertCell(1).innerText = formato_dinero(item.deudor);
                        fila.insertCell(2).innerText = formato_dinero(item.acreedor);
                        fila.insertCell(3).innerText = formato_dinero(item.deudor - item.acreedor);
                }
            );

            obt.pasivos.forEach(
                function(item){
                    pasivo_total += (item.acreedor - item.deudor);
                    let fila = tabla_pasivo.insertRow();
                        fila.insertCell(0).innerText = item.cuenta;
                        fila.insertCell(1).innerText = formato_dinero(item.deudor);
                        fila.insertCell(2).innerText = formato_dinero(item.acreedor);
                        fila.insertCell(3).innerText = formato_dinero(item.acreedor - item.deudor);
                }
            );

            // Cargamos divs de totales
            div_totalactivo.innerText = 'Total Activo: ' + formato_dinero(activo_total);
            div_totalpasivo.innerText = 'Total Pasivo: ' + formato_dinero(pasivo_total);

            // Cargamos Patrimonio Neto
            tabla_pn.children[0].innerText = formato_dinero(activo_total);
            tabla_pn.children[1].innerText = formato_dinero(pasivo_total);
            tabla_pn.children[2].innerText = formato_dinero(activo_total - pasivo_total);
        }

        cargando.hidden = true;
    }
}