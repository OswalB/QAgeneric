 let contador=0, varPin, proveedores = [],  docIngreso = {}, insumos =[], ingresos=[], pendientes = [], facturar =[], opers, currentUser =null, timeoutId, subCriterios;
const timeClear = 120000;

document.getElementById('btnFacturar').addEventListener('click',async e => {
    let listChk = document.getElementsByClassName('checkArchivar');
    let pyme = '', bodega = 1 ;
    facturar=[];
    for(let item = 0; item < listChk.length; item++){
        if(listChk[item].checked){
            pyme += `${bodega}\t${pendientes[item].insumo.codigo}\t\t${pendientes[item].cantidad}\n`;
            facturar.push({"_id":pendientes[item]._id, "facturada":true});
        }
        
    }
    facturar[0].modelo = 'Inalmacen';
    toClipBoard(pyme);
    console.log(pyme);
    console.log(facturar);
    const res = await fetch('/editor/update', {    
        headers: {
            'Content-Type': 'application/json'
          },
          method: "PUT",
          body: JSON.stringify(facturar)
    });
    const dats = await res.json();
    console.log(dats)
    if(dats.fail){
        toastr.error(dats.message);
        return;
    }
    toastr.info(dats.message);
    renderTable();

})

document.getElementById('btn-getLote').addEventListener('click',async e => {
    let strLote = document.getElementById('inLote').value,
        objLote={};

    objLote.strSerie=strLote;
    objLote.incremento=3;    
    console.log('obtain', objLote);
    

    toastr.info('Comprobando...','Lote');
    const res = await fetch('/produccion/incs', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(objLote)
      });
      const data = await res.json();
      console.log(data);
        if(data.fail) {
            toastr.error('Reintente!','No se ha podido enviar.','Petición de lote');
            return false;
            
        }
        toastr.remove();
        toastr.success(data.msg,'Lote');

        document.getElementById('inLote').value=data.serial;
        setPaso(6);

})

document.getElementById('btnArchivar').addEventListener('click',async e => {
    
    await renderArchivar();
    $('#archivarModal').modal('show');
    console.log('Archivar')
})

document.getElementById('btnSave').addEventListener('click',async e => {
    
    let acepta = document.getElementsByClassName('op-acepta');
    let rechaza = document.getElementsByClassName('op-rechaza');
    let varAcepta ='', varRechaza = '';
    if(rechaza.length > 0){
        if(!confirm('Ha escogido rechazar el insumo, esta seguro de continuar?')){
         return;   
        }
    } 
    docIngreso.lote = document.getElementById('inLote').value;
    docIngreso.vence = document.getElementById('inVence').value;
    
    for(let item=0; item < acepta.length; item++){
        const titulo = acepta[item].innerText;
        
        varAcepta += titulo + ', ';
    }
    varAcepta = varAcepta.slice(0,varAcepta.length-2);
    docIngreso.acepta = varAcepta;
    for(let item=0; item < rechaza.length; item++){
        const titulo = rechaza[item].innerText;
        
        varRechaza += titulo + ', ';
    
    }
    varRechaza = varRechaza.slice(0,varRechaza.length-2);
    docIngreso.rechaza = varRechaza;
    docIngreso.fechaw = document.getElementById('inFechaw').value;
    
    console.log(docIngreso.fechaw);
    await sendIngreso();
    setPaso(0);
    //await loadIngresos();
    //await servicePag.footer();
    
    
    
})

document.getElementById('cardsContainer').addEventListener('change',async e => {
    let _id = e.target.getAttribute('_id');
    setColor(_id);
});

document.getElementById('inUser').addEventListener('input', e => {
   
    if(contador > 2){
        
        contador = 0;
        varPin = document.getElementById('inUser').value;
        document.getElementById('inUser').value = '';
        const result = opers.find(({ pin }) => pin === varPin);
        
        if(result){
            currentUser = result.name.substr(0,8);
            docIngreso.operario = currentUser; 
            $('#proveedoresModal').modal('show');
            $('#userModal').modal('hide');
        }else{
            toastr.error('Ingrese nuevamente.','Pin incorrecto!')
        }
        
    }else{
        contador +=1;
    }
    
})
document.getElementById('proveedoresModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inSearch').focus();
});

document.getElementById('userModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inUser').focus();
})

document.getElementById('listProv').addEventListener('click',async e => {
    let nit = e.target.getAttribute('_nit');
    let nombre = e.target.innerText;
    setPaso(1);
    docIngreso.nombreProveedor = nombre;
    docIngreso.nit = nit;
    document.getElementById('nproveedor').value = nombre;
    
    $('#proveedoresModal').modal('hide');
})

document.getElementById('btnNuevo').addEventListener('click',async e => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function(){console.log('timeout'); currentUser=null}, timeClear);
    const noEnviado = document.getElementById('nproveedor').value;
    if(noEnviado){
        const continuar = confirm('Hay un documento sin guardar, ¿desea descartar esta informacion y empezar un ingreso nuevo?');
        if(!continuar)return;
        renderProveedores('');
        setPaso(0);
    }
    if(currentUser){
        docIngreso.operario = currentUser;
        $('#proveedoresModal').modal('show');
        
        setPaso(1);
        
    }else{
        $('#userModal').modal('show');
    }    
});

document.getElementById('inSearch').addEventListener('input',async e => {
    text = document.getElementById('inSearch').value;
    text = text.toUpperCase();
    renderProveedores(text);
})

document.getElementById('inInsumo').addEventListener('change',async e => {
    let cod = document.getElementById("inInsumo").value;
    if(cod != '-1'){
        docIngreso.insumo = insumos[cod];
        renderCriterios(insumos[cod].codigo)
         //delete docIngreso.insumo.diasVence;
         //delete docIngreso.insumo.prefijoLote;
        setPaso(3);
        document.getElementById('inCantidad').focus();
        
    }else{
        delete docIngreso.insumo;
        setPaso(2);
    }
    
    
})

document.getElementById('inCantidad').addEventListener('change',async e => {
    let val = document.getElementById("inCantidad").value;
    if(val){
        docIngreso.cantidad = val;
        document.getElementById('inInsumo').disabled = true;
        let dv = docIngreso.insumo.diasVence;
        let pl = docIngreso.insumo.prefijoLote;
        if(pl==null || pl=='' || pl==undefined) pl=-1;
        if(pl != -1)console.log("si pl",pl);
        if(dv > 0){
            document.getElementById('inVence').value = fechaType(dv);
            if(pl  != -1){
                setPaso(6);
            }else{
                setPaso(5);
                document.getElementById('inLote').focus();
            }
            
        }else{
            setPaso(4);
        }
        
        if(pl != -1){
            const auto = pl + autoLote();
            
            document.getElementById('inLote').value = auto 
        }
        
        
    }else{
        docIngreso.cantidad = 0;
        setPaso(3);
    }
})

document.getElementById('inVence').addEventListener('change',async e => {
    let val = document.getElementById("inVence").value;
    
    if(val){
        docIngreso.vence = val;
        setPaso(5);
        document.getElementById('inLote').focus();
    }else{
        docIngreso.vence = 0;
        setPaso(4);
    }
})

document.getElementById('inLote').addEventListener('change',async e => {
    let val = document.getElementById("inLote").value;
    
    if(val){
        //docIngreso.lote = val;
        //setPaso(6);
        //document.getElementById('inLote').focus();
    }else{
        docIngreso.lote = '';
        setPaso(5);
    }
})




//---------funciones

async function init(){
    document.getElementById('title-main').innerHTML='El Mana - Almacen'
    page.szItems = 15;
    page.ordenPor = 'createdAt';
    page.sortAsc = false;
    page.filterBy = '0';
    page.filterTxt = '';


    //document.getElementById('ordenpor').value='createdAt';
    //filterPag.sortBy ='createdAt';
    //document.getElementById('checkDsc').checked=true;
    //filterPag.sortAsc = false;

    setPaso(0); 
    filterPag.modelo = 'Inalmacen'; 
    //filterPag.nofact=true;
    //filterPag.saltar=0;
    //filterPag.limitar=15;
    //filterPag.sortBy = 'createdAt';
    //filterPag.sortAsc = false;
    currentKeys =[{campo: 'nombreProveedor', alias: 'Proveedor', tipo: 'string'},
    {campo: 'createdAt', alias: 'Fecha', tipo: 'date'}];
    
    //document.getElementById('ordenpor').value='createdAt';
    
    
    await loadlistas();
    renderProveedores('');
    renderInsumos();

    renderTable()


}

function afterLoad(){}

function setPaso(paso){
    let state = '';
    if(paso < 1){
        //renderTable();
        this.clearFields();
        document.getElementById('step00').style.display = '';
        state = 'none';
        
    }else{
        document.getElementById('step00').style.display = 'none';
        let fechaw = toLocal(new Date);
        //fechaw = fechaw.slice(0,10);
        document.getElementById('inFechaw').value = fechaw;
    }
    document.getElementById('step01').style.display = state;
    document.getElementById('step02').style.display = state;
    state = '';
    if(paso < 3)state = 'none';
    document.getElementById('step03').style.display = state;
    state = ''
    if(paso < 4)state = 'none';
    document.getElementById('step04').style.display = state;
    state = ''
    if(paso < 5)state = 'none';
    document.getElementById('step05').style.display = state;
    state = ''
    if(paso < 6)state = 'none';
    document.getElementById('step06').style.display = state;
    state = ''
    if(paso < 7)state = 'none';
    document.getElementById('step07').style.display = state;

}

async function renderTable(){
    document.getElementById('ordenpor').value='createdAt';
    filterPag.sortBy ='createdAt';
    document.getElementById('checkDsc').checked=true;
    filterPag.sortAsc = false;
    filterPag.modelo = 'Inalmacen'; 
    //filterPag.nofact=true;
    filterPag.saltar=0;
    filterPag.limitar=15;
    filterPag.sortBy = 'createdAt';
    filterPag.sortAsc = false;
    
    
    document.getElementById('ordenpor').value='createdAt';

    
    let res = await fetch('/editor/content', {    
        headers: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(filterPag)
    });
    ingresos = await res.json();
    const container = document.getElementById('main_table');
    container.innerHTML = '';
    ingresos.forEach(item => {
        //console.log(item);
        const fechaIn = fechaFormated(item.fechaw,'h');
        const vence = fechaFormated(item.vence,'n');
        const tr = document.createElement('tr');
        //console.log(item);
        let agotado = 'No';
        if(item.agotado)agotado = 'Si';
        let facturado = 'No';
        if(item.facturada)facturado = 'Si';
        tr.innerHTML = `
        <td>${fechaIn}</td>
        <td>${item.nombreProveedor}</td>
        <td>${item.insumo.nombre} ${item.insumo.unidad}</td>
        <td>${item.cantidad}</td>
        <td>${item.lote}</td>
        <td>${vence}</td>
        <td>${item.acepta}</td>
        <td>${item.rechaza}</td>
        <td>${item.operario}</td>
        <td>${agotado}</td>
        <td>${facturado}</td>
    `;    
    container.appendChild(tr);
    }
    );
    

}

function renderCriterios(code){
    subCriterios = currentCollection.filter(element => element.codigo === code);
    const container = document.getElementById('cardsContainer');
        container.innerHTML = '';
        subCriterios.forEach(card => {
            let element = renderCard(card);
            container.appendChild(element);
        });
}

function renderCard(card) {
    const div = document.createElement('div');
    div.setAttribute('class', 'col-sm-4');
    div.innerHTML = `
    <div class="card text-dark bg-light" >
        <div class="card-header" id="card${card._id}">
            <h5 id="crt${card._id}" class="card-title">${card.nombre}</h5>
            <h6 id="lbc${card._id}"></h6>
        </div>
        <div class="card-body ">
            <div class="form-check" >
                <input class="form-check-input" type="radio" name="checkA${card._id}" id="checkA${card._id}" _id="${card._id}">
                <label class="form-check-label" for="checkA${card._id}">Acepta</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="checkA${card._id}" id="checkR${card._id}" _id="${card._id}">
                <label class="form-check-label" for="checkR${card._id}">Rechaza</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="checkA${card._id}" id="checkN${card._id}" _id="${card._id}" checked>
                <label class="form-check-label" for="checkN${card._id}">N/A</label>
            </div>
        
    </div>
    `;
    return div;
}

function setColor(_idb){
    let tarjeta = document.getElementById(`card${_idb}`);
    let checkA = document.getElementById(`checkA${_idb}`);
    let checkR = document.getElementById(`checkR${_idb}`);
    let checkN = document.getElementById(`checkN${_idb}`);
    let title = document.getElementById(`lbc${_idb}`);
    let criterio = document.getElementById(`crt${_idb}`);
    const result = subCriterios.find(({ _id }) => _id === _idb);
    if(checkA.checked){
        title.innerHTML = result.textoa;
        criterio.setAttribute('class','op-acepta');
        tarjeta.setAttribute('class','card-header text-light bg-success');
    }
    if(checkR.checked){
        criterio.setAttribute('class','op-rechaza');
        title.innerHTML = result.textor;
        tarjeta.setAttribute('class','card-header text-dark bg-warning');
    }
    if(checkN.checked){
        criterio.setAttribute('class','card-title');
        title.innerHTML = '';
        tarjeta.setAttribute('class','card-header text-dark bg-light');
    }

    

    let acepta = document.getElementsByClassName('op-acepta');
    let rechaza = document.getElementsByClassName('op-rechaza');
    if((acepta.length + rechaza.length) > 0){
        setPaso(7);
    }else{
        setPaso(6);

    }
    

}

async function loadlistas(){
    let res = await fetch('/control/insumos_list', {    
        headers: {
            'Content-Type': 'application/json'
          },
          method: "GET",
          body: JSON.stringify()
    });
    insumos = await res.json();
    delete insumos[0].message;
    let response = await fetch("/control/criterios-all",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(filterPag)
    })
    currentCollection = await response.json(); 
    response = await fetch('/api/operarios'); 
    opers = await response.json();
    
    res = await fetch('/control/proveedores-list', {    
        headers: {
            'Content-Type': 'application/json'
          },
          method: "GET",
          body: JSON.stringify()
    });
    
    proveedores = await res.json();
    renderProveedores();
}

function fechaFormated(fecha, op){
    let f = new Date(fecha);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    if(op === 'h'){
        const h = ("0" + (f.getHours() )).slice(-2);
        const mi = ("0" + (f.getMinutes() )).slice(-2);
        return `${a}-${m}-${d} ${h}:${mi}`;
    }
    return `${a}-${m}-${d}`;
}

function clearFields() {
    document.getElementById('inInsumo').disabled = false;
    let grupo = document.getElementsByClassName('form-control');
        for(let i = 0; i < grupo.length; i++){
            grupo[i].value = '';
            grupo[i].innerText = '';
        }
        grupo = document.getElementsByClassName('form-select');
        for(let i = 0; i < grupo.length; i++){
            grupo[i].value = '-1';
        }
}

function renderProveedores(filtro){
    const container = document.getElementById('listProv');
    container.innerHTML = '';
    proveedores.forEach(item =>{
        let i = item.nombre.toUpperCase().indexOf(filtro);
        if(i > -1 ){
            const a = document.createElement('a');
            a.setAttribute('href', '#');
            a.setAttribute('_nit', item.idClient);
            a.setAttribute('class','list-group-item list-group-item-action list-group-item-secondary')
            a.innerHTML = `${item.nombre}`;
            container.appendChild(a);
        }
        
    })
    
}

function renderInsumos(){
    const container = document.getElementById('inInsumo');
    //container.innerHTML = '';
    let i = 0;
    insumos.forEach(item =>{
        const option = document.createElement('option');
        option.innerHTML= `
            ${item.nombre} por ${item.unidad}                
        `;
        option.setAttribute("value",i);
        container.appendChild(option);
        i += 1;
    })
}

async function sendIngreso(){
    const res = await fetch('/control/ingreso-almacen', {    
        headers: {
            'Content-Type': 'application/json'
          },
          method: "PUT",
          body: JSON.stringify(docIngreso)
    });
    const data = await res.json();
    if(data.fail){
        toastr.error(data.message);
        return;
    }
    //obj = await res.json();
    toastr.info(data.message);
    
}

function fechaType(dv){
    let f = new Date();
    f.setDate(f.getDate() + dv);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    return `${a}-${m}-${d}`;
}

function autoLote(){
    let f = new Date();
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    return `${a}${m}${d}`;
}

async function renderArchivar(){
    let res = await fetch('/control/almacen-sinfacturar', {    
        headers: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify({})
    });
    pendientes = await res.json();
    const container = document.getElementById('archivarList');
    container.innerHTML = '';
    pendientes.forEach(item =>{
        let fecha = new Date(item.createdAt);
        let fechaTxt =  `${fecha.toLocaleDateString('es-us',{weekday: 'short',day:'2-digit',month:'short',hour:'2-digit', minute:'2-digit'})}`;
        const li = document.createElement('li');
        li.setAttribute("class","list-group-item");
        li.innerHTML= `
            <input class="form-check-input me-1 checkArchivar" type="checkbox" value="" ><strong>${item.insumo.nombre}</strong>  (${fechaTxt}) ${item.nombreProveedor}, op: ${item.operario}              
        `;
        container.appendChild(li);
    })
}

function toClipBoard(pyme){
    if (typeof (navigator.clipboard) == 'undefined') {
        console.log('navigator.clipboard');
        var textArea = document.createElement("textarea");
        textArea.value = pyme;
        textArea.style.position = "fixed";  //avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
    
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            toastr.info(msg);
        } catch (err) {
            toastr.warning('Was not possible to copy te text: ', err);
        }
    
        document.body.removeChild(textArea)
        return;
    }
    navigator.clipboard.writeText(pyme).then(function () {
        
        toastr.info(`successful!`);
    }, function (err) {
        toastr.warning('unsuccessful!', err);
    });
    
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