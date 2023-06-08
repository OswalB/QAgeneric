let localTable, contador=0, opers, flags = {}, objHead = {}, timeoutId, docPlanilla = {}, currentUser = null;
let jsonDetalle = [], planilla = {}, procesos = [], selecProceso, varPin, selected = {};
const timeClear = 120000;

let detalleKeys=[
    {campo: 'cantidad', alias: 'Cantidad', tipo: 'number','disp':''},
    {campo: 'codigoInsumo', alias: 'Codigo Insumo', tipo: 'string','disp':'disabled'},
    {campo: 'nombreInsumo', alias: 'Insumo', tipo: 'string','disp':'disabled'},
    {campo: 'unidad', alias: 'Unidad', tipo: 'string','disp':'disabled'},
    {campo: 'loteIn', alias: 'Lote', tipo: 'string','disp':'disabled'},
    {campo: 'compuesto', alias: 'Compuesto', tipo: 'boolean','disp':'disabled'},
    {campo: 'vence', alias: 'Vence', tipo: 'date','disp':'disabled'},
    
]

document.getElementById('accordionMain').addEventListener('change',async e =>{
    flags.siChangeH = true;

})

document.getElementById('accordionMain').addEventListener('click',async e =>{
    let _role = e.target.getAttribute('_role');
    const idDoc = e.target.getAttribute('_idDoc');
    const idItem = e.target.getAttribute('_idItem');
    const indice = localTable.findIndex(({ _id }) => _id == idDoc);
    flags.editIdDoc = localTable.findIndex(({ _id }) => _id == idDoc);
    if(idDoc)flags.editIdItem = localTable[flags.editIdDoc].detalle.findIndex(({ _id }) => _id == idItem);
    //console.log(flags.editIdDoc, flags.editIdItem);
    
    if(_role == 'edit'){
        renderModal();
    }

    if(_role == 'openList'){
        selected._id=idDoc;
        renderList();
    }

    if(_role == 'sending'){
        const inin = document.getElementById(`inin${idDoc}`).value;
        const cnt = document.getElementById(`incant${idDoc}`).value;
        flags.siChangeH=false;
        let msg = '';
        if(!inin){
                msg = 'Insumo no es valido';
        } 
            
        if(cnt == '' || msg.length >0){
                msg += 'Falta ingresar la cantidad ';
                alert(msg);
                return;
        } 
        selected.cantidad = cnt;
        let response = await fetch("/produccion/set-item-formula",{
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(selected)
        })
         
        const data = await response.json();
        selected.nombreInsumo ='';
        selected.codigoInsumo = '';
        selected.cantidad ='';
        document.getElementById(`incant${selected._id}`).value='';
        document.getElementById(`inin${selected._id}`).value='';
        localTable[flags.editIdDoc].detalle =data.detalle;
        //renderOneCard(localTable[indice],indice)   
        fillOneCard(localTable[indice],indice);
        //paint(localTable[indice]);
    }
})

document.getElementById('accordionMain').addEventListener('dblclick',async e =>{
    let role = e.target.getAttribute('_role');
    let idDoc = e.target.getAttribute('_idDoc');
    let codigo = e.target.getAttribute('_codigo');
    let idItem = e.target.getAttribute('_idItem');
    flags.currentInsumo = idItem;
    
    if(role == 'inlote'){
        const res = await fetch("/produccion/lotes",{       //lotes de insumos y producto interno
            headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify({'codigo':codigo})
        })   
        const data = await res.json();
        if(data.fail) {
            toastr.error('Reintente!','No se ha podido recibir.','lotes');
            return false;
        }
        toastr.remove();
        objLote = data;
        
        $('#lotesModal').modal('show');
        const container = document.getElementById('lotesList');
        container.innerHTML = '';
        objLote.forEach(item =>{
            let fecha = new Date(item.vence);
            let fechaE = new Date(item.fechaw);
            let fechaTxt =  fechaE.toLocaleDateString('es-us',{day:'2-digit',month:'short',year:'numeric'});
            let proveedor = item.nombreProveedor;
            if(!proveedor)proveedor = 'indeterminado'
            proveedor = proveedor.substring(0,10)
            const li = document.createElement('li');
            li.setAttribute("class","list-group-item");
            li.setAttribute("_idItem",item._id);
            li.setAttribute("_lote",item.lote);
            li.setAttribute("_idDoc",idDoc);
            li.setAttribute("_vence",item.vence);
            li.setAttribute("_compuesto",item.compuesto);
            li.innerHTML= `
                <input class="form-check-input me-1 checkArchivar" type="checkbox" value="" >
                <strong _idItem=${item._id} _lote=${item.lote} _idDoc=${idDoc} _vence=${item.vence} _compuesto =${item.compuesto}>
                ${proveedor} </strong>  ||   ${item.lote}     ||    F.E.: ${fechaTxt}>              
            `;
            container.appendChild(li);
        })


    }
   
})

document.getElementById('accordionMain').addEventListener('focusout',async e =>{
    const role = e.target.getAttribute('_role');
    if(role == 'cantidad' && flags.siChangeH){
        flags.siChangeH=false;
        return;
    }
    const idDoc = e.target.getAttribute('_idDoc');
    const id = e.target.getAttribute('id');
    if(flags.siChangeH){
        //console.log('grabando....', id)
        const indice = localTable.findIndex(({ _id }) => _id == idDoc);
        const change = paint(localTable[indice]);
        //console.log(change);
        const cp = localTable[indice].codigoProducto;
        const dv = procesos.find(({ codigoProceso }) => codigoProceso === cp);
        const f1 = document.getElementById(`inFecha1_${idDoc}`).value;
        let vto = new Date(f1); 
        vto.setDate(vto.getDate() + dv.diasVence);
        
        objHead.id = idDoc;
        objHead.formulaOk = localTable[indice].formulaOk || false;
        objHead.vence = vto;
        objHead.fecha1 = f1;
        objHead.t1 = document.getElementById(`inT1_${idDoc}`).value;
        objHead.t2 = document.getElementById(`inT2_${idDoc}`).value;
            const t1 = strTimeToInt(objHead.t1);
            const t2 = strTimeToInt(objHead.t2);
            let tiempo = t2 - t1;
            if(t1<0 || t2<0 || tiempo<1) tiempo = 0;
           
        objHead.time = tiempo;
        objHead.brix = document.getElementById(`inBrix_${idDoc}`).value;
        objHead.cantProd = document.getElementById(`inCantProd_${idDoc}`).value;
        //console.log(objHead)
        const res = await fetch('/produccion/header',{
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(objHead)
        })
        const data = await res.json();
        toastr.success('ok');
        //console.log(data);
        localTable[indice] = data;
        //renderOneCard(localTable[indice],indice)
        fillOneCard(localTable[indice],indice);
        //paint(localTable[indice]);

    }
    flags.siChangeH = false;
})

document.getElementById('bodyTableList').addEventListener('click',async e =>{
    selected.nombreInsumo = e.target.getAttribute('_nombre');
    selected.codigoInsumo = e.target.getAttribute('_codigo');
    selected.unidad = e.target.getAttribute('_unidad');
    document.getElementById(`inin${selected._id}`).value = `${selected.codigoInsumo} - ${selected.nombreInsumo}`;
    
    
    $('#insumosModal').modal('hide');
    document.getElementById(`incant${selected._id}`).focus();
})

document.getElementById('btn_borrar').addEventListener('click',async e => {
    let rc = confirm("¿Seguro que desea Eliminar esta materia prima?");
    if(!rc){
        toastr.info('No se hicieron cambios');  
        return;  
    } 
    $('#modalEditor').modal('hide');
    const send = {
        '_id':localTable[flags.editIdDoc]._id, 
        'idItem':localTable[flags.editIdDoc].detalle[flags.editIdItem]._id
    }
    document.getElementById(`renglon_${send.idItem}`).setAttribute('class','bg-danger');
    //console.log('borrar',send);
    toastr.info('Borrando...','Insumo');
    const res = await fetch('/control/del-item-planilla', {
        headers: {'Content-Type': 'application/json'},
        method: "DELETE",
        body: JSON.stringify(send)
    });
    const data = await res.json();
    if(data.fail) {
        toastr.error('Reintente!','No se ha podido borrar.','Insumo');
        return false;
    }
    toastr.remove();
    toastr.success(data.msg,'Insumo eliminado!');
    localTable[flags.editIdDoc].detalle = data.detalle;
    //renderOneCard(localTable[flags.editIdDoc], flags.editIdDoc);
    fillOneCard(localTable[flags.editIdDoc], flags.editIdDoc);
    //paint(localTable[flags.editIdDoc]);
})

document.getElementById('btn_guardar').addEventListener('click',async e => {
    let rc = confirm("¿Seguro que desea Cambiar la cantidad de esta materia prima?");
    if(!rc){
        toastr.info('No se hicieron cambios');  
        return;  
    } 
    const newCantidad = document.getElementById('cantidad').value;
    const send = {
        '_id':localTable[flags.editIdDoc]._id, 
        'idItem':localTable[flags.editIdDoc].detalle[flags.editIdItem]._id,
        'cantidad': newCantidad
    }
    document.getElementById(`renglon_${send.idItem}`).setAttribute('class','bg-success');
    $('#modalEditor').modal('hide');
    toastr.info('Actualiazando...','Insumo');
    const res = await fetch('/produccion/edit-item-planilla', {
        headers: {'Content-Type': 'application/json'},
        method: "POST",
        body: JSON.stringify(send)
      });
      const data = await res.json();
    if(data.fail) {
            toastr.error('Reintente!','No se ha podido actualizar.','Insumo');
            return false;
    }
    toastr.remove();
    toastr.success(data.msg,'Insumo actualizado!');
    localTable[flags.editIdDoc].detalle[flags.editIdItem].cantidad = data.cant;
    //renderOneCard(localTable[flags.editIdDoc], flags.editIdDoc);
    fillOneCard(localTable[flags.editIdDoc], flags.editIdDoc);
    //paint(localTable[flags.editIdDoc]);

})

document.getElementById('cantidadModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inCantidad').focus();
});

document.getElementById('cantidadModal').addEventListener('hide.bs.modal',async e => {
    toastr.info('Buscando...','Formula');
    docPlanilla.cantidadBase =  parseInt(document.getElementById('inCantidad').value);
    selecProceso.porcentaje = docPlanilla.cantidadBase / selecProceso.cantidad;
    const res = await fetch('/produccion/una_formula', {
        headers: {'Content-Type': 'application/json'},
        method: "POST",
        body: JSON.stringify({
            'codigo':selecProceso.codigoProceso, 
            'porcentaje':selecProceso.porcentaje})
      });
      currentFormula = await res.json();
      //console.log(currentFormula);
        if(currentFormula.fail) {
            toastr.error('No se encontró la formula.','Error');
            return false;
            
        }
        toastr.remove();
        let jsonPool = [], copy =[];
        currentFormula.forEach(item =>{
            jsonDetalle.push({ 
                'cantidad': item.newCantidad,
                'codigoInsumo': item.detalle.codigoInsumo,
                'nombreInsumo': item.detalle.nombreInsumo,
                'unidad': item.detalle.unidad,
                'loteIn': item.detalle.loteIn,
                'vence': item.detalle.vence,
                'compuesto': item.detalle.compuesto,
                'idLote': ''
            });
            jsonPool.push(item.detalle.loteIn) 
            if(item.copyPool)copy = [...copy, ...item.copyPool]    
        })
        jsonPool = [...jsonPool, ...copy];
        //console.log(jsonPool)
        let objLote={};
        objLote.strSerie='';
        objLote.incremento=3;    
        toastr.info('Comprobando...','Lote');
        const resp = await fetch('/produccion/incs', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(objLote)
      });
      const data = await resp.json();
      if(data.fail) {
            toastr.error('Reintente!','No se ha podido enviar.','Petición de lote');
            return false;
      }
      toastr.remove();
      toastr.success(data.msg,'Lote');
      
      planilla.loteOut=data.serial;
      planilla.fecha1 = new Date;
      
      let vto = new Date; 
      vto.setDate(vto.getDate() + currentFormula[0].diasVence);
      planilla.vence = vto;
        planilla.operario = currentUser;
        planilla.producto = selecProceso.proceso; 
        planilla.codigoProducto = selecProceso.codigoProceso;
        planilla.brix = 0;                    
        planilla.cantProd = 0;
        planilla.t1='08:00';
        planilla.t2='11:00';
        planilla.time=180; 
        planilla.detalle = jsonDetalle;
        planilla.lotesPool = jsonPool;
        //quitar estos presets cuando se haya destrazado!!
        await savePlanilla();
        await renderTable();   
});

document.getElementById('cantidadModal').addEventListener('keypress',e => {
    if(e.key == 'Enter'){
        $('#cantidadModal').modal('hide');
      }
})

document.getElementById('btnNuevo').addEventListener('click',async e => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function(){console.log('timeout'); currentUser=null}, timeClear);
    const noEnviado = docPlanilla.proceso;
    if(noEnviado){
        const continuar = confirm('Hay un documento sin guardar, ¿desea descartar esta informacion y empezar una orden nueva?');
        if(!continuar)return;
    }
    renderProductos('');
    if(currentUser){
        docPlanilla.operario = currentUser;
        $('#productosModal').modal('show');
        //setPaso(1);
    }else{
        $('#userModal').modal('show');
    } 
    //$('#productosModal').modal('show');
})

document.getElementById('inSearch').addEventListener('input',async e => {
    text = document.getElementById('inSearch').value;
    text = text.toUpperCase();
    renderProductos(text);
})

document.getElementById('inUser').addEventListener('input', e => {
    const varInput =document.getElementById('inUser');
    if(varInput.value.length > 3){
        varPin = varInput.value;
        document.getElementById('inUser').value = '';
        const result = opers.find(({ pin }) => pin === varPin);
        
        if(result){
            currentUser = result.name.substr(0,8);
            docPlanilla.operario = currentUser; 
            $('#productosModal').modal('show');
            $('#userModal').modal('hide');
        }else{
            toastr.error('Ingrese nuevamente.','Pin incorrecto!')
        }
        
    }
    
})

document.getElementById('listProducts').addEventListener('click',async e => {
    docPlanilla.codigoProceso = e.target.getAttribute('_codigo');
    selecProceso = procesos.find(({ codigoProceso }) => codigoProceso === docPlanilla.codigoProceso);
    docPlanilla.proceso = selecProceso.proceso;
    
    $('#productosModal').modal('hide');
    
})

document.getElementById('lotesModal').addEventListener('hide.bs.modal',async e => {
    let listChk = document.getElementsByClassName('checkArchivar');
    let listInalmacen=[], listPlanilla=[];
    for(let item = 0; item < listChk.length; item++){
        if(listChk[item].checked){
            if(objLote[item].esPlanilla){
                listPlanilla.push({"_id":objLote[item]._id, "agotado":true});
            }else{
                listInalmacen.push({"_id":objLote[item]._id, "agotado":true});
            }
            
        }
    
    }
    if(listPlanilla.length > 0){
        listPlanilla[0].modelo = 'Planilla'; 
        const res = await fetch('/editor/update', {    
            headers: {'Content-Type': 'application/json'},
              method: "PUT",
              body: JSON.stringify(listPlanilla)
        });
        const dat1 = await res.json();
        if(dat1.fail){
            toastr.error(dats.message);
            return;
        }
        toastr.info(dat1.message);
    }
    if(listInalmacen.length > 0){
        listInalmacen[0].modelo = 'Inalmacen';
        const res = await fetch('/editor/update', {    
            headers: {'Content-Type': 'application/json'},
              method: "PUT",
              body: JSON.stringify(listInalmacen)
        });
        const dat2 = await res.json();
        if(dat2.fail){
            toastr.error(dats.message);
            return;
        }
        toastr.info(dat2.message);
    }
    
    
    
    
})

document.getElementById('lotesList').addEventListener('dblclick',async e => {
    let idDoc = e.target.getAttribute('_idDoc');
    let idItem = e.target.getAttribute('_idItem');
    const indice = localTable.findIndex(({ _id }) => _id == idDoc);
    let vence = e.target.getAttribute('_vence');
    let loteIn = e.target.getAttribute('_lote');
    let compuesto = e.target.getAttribute('_compuesto');
    const loteSelected = objLote.find(ls => ls.lote == loteIn);
    localTable[indice].detalle[flags.editIdItem].loteIn = loteSelected.lote;
    localTable[indice].detalle[flags.editIdItem].vence = loteSelected.vence;
    localTable[indice].detalle[flags.editIdItem].compuesto = loteSelected.compuesto;
    let listaCompuestos = [], jsonPool = [], copy =[];    //jsonPool: contenedor de lotes actuales; copy contenedor de la copia heredada
       
    localTable[indice].detalle.forEach(item => {
        
        if(item.loteIn){
            jsonPool.push(item.loteIn);
        }
        if(item.compuesto){
            listaCompuestos.push(item.loteIn);
        }
        

    })

    for(fila in listaCompuestos){
        const resp = await fetch("/produccion/pool",{
            headers: {'Content-Type': 'application/json'},
            method: "POST",
            body: JSON.stringify({'lote':listaCompuestos[fila]})
        })
        const dataLotes = await resp.json();
        copy = [...copy, ...dataLotes[0].lotesPool];
    }
    //
    const listaLotes = jsonPool.length;
    jsonPool = [...jsonPool, ...copy];
    paint(localTable[indice]);
    let completa = localTable[indice].detalle.length === listaLotes;
    if(completa){
        objHead.id=localTable[indice]._id;
        objHead.lotesPool =jsonPool;
        objHead.formulaOk =true;
        const res3 = await fetch('/produccion/header',{
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify(objHead)
        })
        const data3 = await res3.json();
        toastr.success('pool : ok');

    }
    
    const res = await fetch("/produccion/insumo_planilla",{
        headers: {
            'Content-Type': 'application/json'
          },
          method: "PUT",
          body: JSON.stringify({'idDocument':idDoc,
                                'idItem'    :flags.currentInsumo,
                                'loteIn'    :loteIn,
                                'vence'     :vence,
                                'compuesto' :loteSelected.compuesto
                                })
    })
    const data = await res.json();
    if(data.fail) {
        toastr.error('Reintente!','No se ha podido recibir.','lotes');
        return false;
        
    }
    toastr.remove();

    $('#lotesModal').modal('hide');
})

document.getElementById('productosModal').addEventListener('hide.bs.modal', e => {

    document.getElementById('lblCantidad').innerHTML =`Cantidad de ${selecProceso.unidad} de ${selecProceso.insumo} usados para producir ${selecProceso.proceso}`
    $('#cantidadModal').modal('show');
});

document.getElementById('productosModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inSearch').focus();
});

document.getElementById('userModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inUser').focus();
})

//---------funciones -----------------------------------------------------


async function init(){
    
    filterPag.modelo = 'Planilla';
    document.getElementById('ordenpor').value='createdAt';
    filterPag.sortBy ='createdAt';
    document.getElementById('checkDsc').checked=true;
    filterPag.sortAsc = false;
    filterPag.saltar=0;
    filterPag.limitar=15;


    insumosList = await fetch("/control/insumos_list",{
        headers: {'content-type': 'application/json'},
        method: 'GET',
        body: JSON.stringify()
    })
    insumosList = await insumosList.json();

    flags.siChangeH = false;    // cambio en la cabecera de la planilla
    flags.prevKeyH = '',flags.prev_id='';
    currentKeys =[{campo: 'nombreProveedor', alias: 'Proveedor', tipo: 'string'},
    
    {campo: 'createdAt', alias: 'Fecha', tipo: 'date'},
    ];
    const data = await fetch('/produccion/procesos_list');
    procesos  = await data.json();
    response = await fetch('/api/operarios'); 
    opers = await response.json();
    
    
}

async function renderTable() {
    
    const res = await fetch("/produccion/ordenes",{
        headers: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(filterPag)
    })
    
    const data = await res.json();
    
    if(data.fail) {
        toastr.error('Reintente!','No se ha podido recibir.','Planilla');
        return false;
        
    }
    toastr.remove();
    localTable = data;
    renderCards();
}

async function renderCards(){
    let i = 0;
    let container = document.getElementById('accordionMain');
    container.innerHTML = '';
    localTable.forEach(itemAcc =>{
        renderOneCard(itemAcc,i)
        i++
    }) 
        
}

function renderList(){
    const container = document.getElementById('bodyTableList');
    container.innerHTML = '';
    insumosList.forEach(item =>{
        const tr = document.createElement('tr');
        //tr.setAttribute('');
        tr.innerHTML= `
        <th scope="col" _codigo="${item.codigo}" _nombre="${item.nombre}" _unidad="${item.unidad}">${item.codigo} - ${item.nombre}</th>                
        `;
        container.appendChild(tr);
    })

    $('#insumosModal').modal('show');
}

async function renderOneCard(itemAcc, i){
    //i: indice de documento para funcion collapce
    let container = document.getElementById('accordionMain');
    
    renderItemsAccordion(container, itemAcc,i)
    container = document.getElementById(`bodyAccordion${itemAcc._id}`);
    container.innerHTML = '';
    renderHeadTable(container, itemAcc);
    renderFooterTable(container,itemAcc._id);
    container = document.getElementById(`bt${itemAcc._id}`);
    itemAcc.detalle.forEach(itemDetalle =>{
            renderBodyTable(container, itemDetalle, itemAcc._id);
    });
    paint(itemAcc);
       
}

async function fillOneCard(itemAcc, i){
    //i: indice de documento para funcion collapse
    let container = document.getElementById('accordionMain');
    
    //renderItemsAccordion(container, itemAcc,i)
    container = document.getElementById(`bodyAccordion${itemAcc._id}`);
    container.innerHTML = '';
    renderHeadTable(container, itemAcc);
    renderFooterTable(container,itemAcc._id);
    container = document.getElementById(`bt${itemAcc._id}`);
    itemAcc.detalle.forEach(itemDetalle =>{
            renderBodyTable(container, itemDetalle, itemAcc._id);
    });
    paint(itemAcc);
       
}

async function paint(itemAcc){
    const contentH = document.getElementById(`btnAcc${itemAcc._id}`);
    let esOk = itemAcc.formulaOk, error = false;
    itemAcc.detalle.forEach(itemDetalle =>{
        const inputL = document.getElementById(`inLote${itemDetalle._id}`);
        const inputV = document.getElementById(`inVence${itemDetalle._id}`);
        let color ='';
        let fecha = new Date(itemDetalle.vence);
        let fechaTxt =  fecha.toLocaleDateString('es-us',{day:'2-digit',month:'short',year:'numeric'});
        if(!itemDetalle.vence)fechaTxt = '--';
        inputL.value = itemDetalle.loteIn || '';
        inputV.value = fechaTxt;
        if(!itemDetalle.loteIn){
            color = 'bg-danger';
            error = true;
        } 
        inputL.setAttribute('class',color);
    });

    let icon = `<a class="btn btn-success " href="#"  _role="toedit" _idDoc="${itemAcc._id}"><i class="fa fa-check-circle fa-lg"></i></a>`;
    let estado = "O.K.";

    let  campo = document.getElementById(`inFecha1_${itemAcc._id}`);
    if(campo.value){
        campo.setAttribute('class','');
    }else{
        campo.setAttribute('class','bg-danger');
        error = true;
    }

    campo = document.getElementById(`inT1_${itemAcc._id}`);
    if(campo.value && itemAcc.time > 0){
        campo.setAttribute('class','');
    }else{
        campo.setAttribute('class','bg-danger');
        error = true;
    }

    campo = document.getElementById(`inT2_${itemAcc._id}`);
    if(campo.value && itemAcc.time){
        campo.setAttribute('class','');
    }else{
        campo.setAttribute('class','bg-danger');
        error = true;
    }

    campo = document.getElementById(`inCantProd_${itemAcc._id}`);
    if(campo.value && campo.value >0){
        campo.setAttribute('class','');
    }else{
        campo.setAttribute('class','bg-danger');
    }

    campo = document.getElementById(`inBrix_${itemAcc._id}`);
    if(campo.value && campo.value >0){
        campo.setAttribute('class','');
    }else{
        campo.setAttribute('class','bg-danger');   
    }

    if(error){
        icon = `<a class="btn btn-warning" href="#"  _role="toedit" _idDoc="${itemAcc._id}"><i class="fa fa-exclamation-triangle fa-lg" ></i></a>`;
        estado = "Incompleta!!"
    }

    let fechap = fechaFormated(itemAcc.fecha1);
    let txtHead =`<strong>${itemAcc.loteOut}</strong>-${itemAcc.producto} - ${itemAcc.operario} ${fechap}, estado: ${estado}`;
    contentH.innerHTML = `
        ${icon}
        <div class="px-3"  _role="toedit" _idDoc="${itemAcc._id}">${txtHead}</div>
        `;
    const change = esOk ^ !error;
    if(change){
        const res3 = await fetch('/produccion/header',{
            headers: {'Content-Type': 'application/json'},
            method: 'PUT',
            body: JSON.stringify({'id':itemAcc._id, 'formulaOk':!error})
        })
        const data3 = await res3.json();
        toastr.success(`formula ok : ${!error}`);

    }
    itemAcc.formulaOk = !error;
    return change;
}

async function savePlanilla(){
    //console.log(planilla)
    toastr.info('Enviando...','Planilla');
    const res = await fetch('/produccion/planilla', {
        headers: {'Content-Type': 'application/json'},
        method: "PUT",
        body: JSON.stringify(planilla)
    });
    const data = await res.json();
    if(data.fail) {
        toastr.error('Reintente!','No se ha podido enviar.','Planilla');
        return false;
    }
        jsonDetalle=[];
        planilla={};
        docPlanilla.proceso='';
        docPlanilla.codigoProceso='';
        docPlanilla.cantidadBase='';
        document.getElementById('inCantidad').value ='';
        toastr.remove();
        
}

function renderItemsAccordion(container, itemAcc,i){
    const div = document.createElement('div');
    div.setAttribute('class', 'accordion-item');
    div.innerHTML=`
        <h2 class="accordion-header" id="heading${itemAcc._id}" _idDoc="${itemAcc._id}">
            <button id="btnAcc${itemAcc._id}" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}" _role="" _idDoc="${itemAcc._id}">
        </h2>
        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordionMain">
            <div id="bodyAccordion${itemAcc._id}" class="accordion-body">
            </div>
        </div>
    `;
    container.appendChild(div);
}

function renderHeadTable(container, itemAcc){
    let f1 = toLocal(itemAcc.fecha1);
    let fv = fechaFormated(itemAcc.vence);
    fv= fv.slice(0,10);  
    const table = document.createElement('table');
    table.setAttribute('class', 'table table-hover' );
    table.setAttribute('id', `head${itemAcc._id}`);
    table.innerHTML=`
    <thead>
        <tr class="table-primary">
            <th scope="col">Fecha</th>
            <th scope="col">Hora inicial</th>
            <th scope="col">Hora final</th>
            <th scope="col">Cantidad prod.</th>
            <th scope="col">°Brix</th>
            
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input _idDoc= ${itemAcc._id} id= "inFecha1_${itemAcc._id}" value = "${f1}" type="datetime-local"></td>
            <td><input _idDoc= ${itemAcc._id} id="inT1_${itemAcc._id}" value = "${itemAcc.t1||''}" type="time"></td>
            <td><input _idDoc= ${itemAcc._id} id="inT2_${itemAcc._id}" value = "${itemAcc.t2||''}" type="time"></td>
            <td><input _idDoc= ${itemAcc._id} id="inCantProd_${itemAcc._id}" value = "${itemAcc.cantProd}" type="number"></td>
            <td><input _idDoc= ${itemAcc._id} id="inBrix_${itemAcc._id}" value = "${itemAcc.brix}" type="number"></td>
            
        </tr>
        <tr>
            <td>Lote de producción: <strong>${itemAcc.loteOut}</strong></td>
            <td>T: <strong id= "time_${itemAcc._id}">${itemAcc.time}</strong> mins.</td>
            <td>Vence: <strong id= "vence_${itemAcc._id}">${fv}</strong></td>
        </tr>
    </tbody>
    
    <thead>
        <tr class="table-primary">
            <th scope="col">Insumo</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Lote</th>
            <th scope="col">Vence</th>
            <th scope="col">Acc.</th>
        </tr>
    </thead>   
    <tbody id ="bt${itemAcc._id}"></tbody> 
    `;
    container.appendChild(table);
}

function renderBodyTable(container, itemDetalle, _idDoc){
   const table = document.createElement('tr');
   table.setAttribute('id',`renglon_${itemDetalle._id}`)
   table.innerHTML=`
   
       <td>${itemDetalle.nombreInsumo}</td>
       <td>${itemDetalle.cantidad} ${itemDetalle.unidad}</td>
         
       <td><input _idDoc = "${_idDoc}"  id = "inLote${itemDetalle._id}" _idItem = "${itemDetalle._id}" _codigo = "${itemDetalle.codigoInsumo}" _role="inlote" class="" type="text"   readonly></td>
       
       <td><input  id = "inVence${itemDetalle._id}" _role="" class="" readonly></td>

       <td><a  id="del${itemDetalle._id}"  _idDoc = "${_idDoc}" _idItem="${itemDetalle._id}" class="btn btn-default btn-sm" href="#" _role="edit" >
               <i class="fa fa-pencil fa-lg" aria-hidden="true" _role="edit" _idDoc = "${_idDoc}" _idItem="${itemDetalle._id}"></i></a></td>         
       
   `;
   container.appendChild(table);
}

function renderFooterTable(container, _idDoc){
    const tr = document.createElement('tr');
    tr.innerHTML=`     
        <td><input id="inin${_idDoc}"  _idDoc="${_idDoc}" type="text" class="form-control" placeholder="Ad. insumo" _role="openList"></td>
        <td><input id="incant${_idDoc}"  _idDoc="${_idDoc}" type="number" class="form-control" placeholder="Ad. cantidad" _role="cantidad" ></td>
        
         
        <td><a  id="snd${_idDoc}" _idDoc="${_idDoc}" class="btn btn-default btn-sm" href="#" _role="sending" >
                <i class="fa fa-plus-square fa-lg" aria-hidden="true" _role="sending"  _idDoc="${_idDoc}"></i> Add</a></td>           
       
    `;
    container.appendChild(tr);
}

async function renderModal(){
    
    currentContent= localTable[flags.editIdDoc].detalle[flags.editIdItem];
    role='edit';
    let ind = 0;
    document.getElementById('modal-title-edit').innerHTML=`Editar materia prima: ${currentContent.nombreInsumo}`        
    const bodyTable = document.getElementById('bodyTable');
    bodyTable.innerHTML = '';
    detalleKeys.forEach(item => {
        let contenido = eval(`currentContent.${item.campo}`);
        let sino = true;
        let inputType = 'text';
        let inputClass = 'form-control';
        if(item.tipo == 'boolean'){
            inputType = 'checkbox';
            inputClass = 'form-check-input';
            if(!contenido)sino=false;
            
            contenido = '';
        }
        if(item.tipo == 'number')inputType='number';       
        const tr = document.createElement('tr');
        if(role == 'edit'){
            let codigo = `currentContent[ind].${item.campo}`;       //se concatena como texto y se ejecuta mediante eval()
            
            tr.innerHTML = `
                <td><span class="input-group-text" id="addon-wrapping">${item.alias}:</span></td>
                <td><input id="${item.campo}" type="${inputType}" class="${inputClass} form-snd" value="${contenido}" ${item.disp}></td>
            `;
        }else{
            tr.innerHTML = `
                <td><span class="input-group-text" id="addon-wrapping">${item.alias}:</span></td>
                <td><input id="${item.campo}" type="${inputType}" class="${inputClass} form-snd" value=""   ></td>
            `;
        }
        bodyTable.appendChild(tr);
        if(item.tipo == 'boolean' && sino){
            document.getElementById(item.campo).checked = true;
        }
        
    })
    $('#modalEditor').modal('show');
}

function renderProductos(filtro){
    const container = document.getElementById('listProducts');
    container.innerHTML = '';
    procesos.forEach(item =>{
        let i = item.proceso.toUpperCase().indexOf(filtro);
        if(i > -1 || filtro === ''){
            const a = document.createElement('a');
            a.setAttribute('href', '#');
            a.setAttribute('_codigo', item.codigoProceso);
            a.setAttribute('class','list-group-item list-group-item-action list-group-item-secondary')
            a.innerHTML = `${item.codigoProceso} - ${item.proceso}`;
            container.appendChild(a);
        }
        
    })
    
}


function fechaFormated(fecha){
    let f = new Date(fecha);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    const h = ("0" + (f.getHours())).slice(-2);
    const mins = ("0" + (f.getMinutes())).slice(-2);
    
    return `${d}-${m}-${a} ${h}:${mins}`;
}

function toLocal(fecha){
    //2023-01-02T14:20
    if(! fecha) return ''
    
    let f = new Date(fecha);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    const h = ("0" + (f.getHours())).slice(-2);
    const mins = ("0" + (f.getMinutes())).slice(-2);
    const f2 = `${a}-${m}-${d}T${h}:${mins}`
    return f2;
}

function strTimeToInt(strTime){
    //hh... : mm...
    const separador = strTime.indexOf(':');
    let hh = strTime.slice(0,separador);
    hh = parseInt(hh) * 60;
    let mm = strTime.slice(separador-strTime.length+1);
    mm = parseInt(mm);
    const r = hh+mm;
    return isNaN(r)?-1:r;

};