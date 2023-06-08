//-- variables
let formulaObj = {}, insumosList = [], selected = {}, toEdit = {};

document.getElementById('btnNuevo').addEventListener('click',async e =>{
    newEdit({'opNuevo': true}); 
    
});

document.getElementById('btnEditar').addEventListener('click',async e =>{
    newEdit({'opNuevo': false}); 
    
})

document.getElementById('btnBorrar').addEventListener('click',async e =>{
    rc = confirm("¿Seguro que desea Eliminar toda la formula?");
    if(!rc){
        toastr.info('No se hicieron cambios');  
        return;  
    } 
    toastr.info('Enviando...');
    formulaObj._id = toEdit._id;   
    let response = await fetch("/control/del_formula",{
        headers: {'content-type': 'application/json'},
        method: 'DELETE',
        body: JSON.stringify(formulaObj)
    })
    const data = await response.json();
    
    if(data.success){
        toastr.success('Formula eliminada'); 
        $('#nuevafModal').modal('hide');
      renderTable();
    }else{
        toastr.error('Error al borrar');
    }
})

document.getElementById('btn_guardar').addEventListener('click',async e =>{
    let role =e.target.getAttribute('_role');
    
    formulaObj.nombre = document.getElementById('in_nombre').value;
    formulaObj.categoria = document.getElementById('in_categoria').value;
    formulaObj.codigoProd = document.getElementById('in_codigo').value;
    formulaObj.diasVence = document.getElementById('in_diasvto').value;
    formulaObj.modelo = 'Formula';
    if(formulaObj.nombre == '' || formulaObj.categoria == '' || formulaObj.codigoProd == ''){
        toast
        r.success('NO se permiten campos en blanco');
        return;
    }
    if(role == 'crear'){
        formulaObj._id = 0;
    }else{
        formulaObj._id = toEdit._id;   
    }
    toastr.info('Enviando...');
    let sending = [];
    sending.push(formulaObj); 
    let response = await fetch("/editor/update",{
        headers: {'content-type': 'application/json'},
        method: 'PUT',
        body: JSON.stringify(sending)
    })
    const data = await response.json();
    console.log(data);
    if(!data.fail){
        toastr.success('Guardado: OK');
        $('#nuevafModal').modal('hide');
        //filterPag.filtroTxt = document.getElementById('in_search').value;
        filterPag.sortBy='codigoProd';
        filterPag.sortAsc=true;
    //service.footer();  // Paginacion inicial
    renderTable();
    }else{
        toastr.error('Codigo duplicado!');
    }
    
})

document.getElementById('bodyTableList').addEventListener('click',async e =>{
    selected.nombre = e.target.getAttribute('_nombre');
    selected.codigo = e.target.getAttribute('_codigo');
    selected.unidad = e.target.getAttribute('_unidad');
    document.getElementById(`inin${selected._id}`).value = `${selected.codigo} - ${selected.nombre}`;
    
    
    $('#insumosModal').modal('hide');
    document.getElementById(`incant${selected._id}`).focus();
})


document.getElementById('accordionMain').addEventListener('click',async e =>{
    
    toEdit._id = e.target.getAttribute('_id');
    selected._id = e.target.getAttribute('_id');
    let role = e.target.getAttribute('_role');
    if(role){
        if(role == 'openList'){
            renderList();
        };
        if(role == 'sending'){
            
            let msg = '';
            let cnt = document.getElementById(`incant${selected._id}`).value;
            if(isNaN(cnt)){
                document.getElementById(`incant${selected._id}`).value = eval(cnt);
                return
            }
            //cnt = eval(cnt)
            if(selected.nombre == '' || selected.codigo == '') msg = 'Insumo no es valido';
            if(cnt == '') msg += 'Falta ingresar la cantidad ';
            if(msg){
                alert(msg);
                return;
            }
              
            selected.siBase = false;
            isChecked = document.getElementById(`chk${selected._id}`).checked;
            if(isChecked){
                selected.siBase = true;
            }
            //selected.cantidad = document.getElementById(`incant${selected._id}`).value;
            selected.cantidad = cnt
            let response = await fetch("/control/set-item-formula",{
                headers: {'content-type': 'application/json'},
                method: 'POST',
                body: JSON.stringify(selected)
            })
             
            const data = await response.json();
            
            repaintAccordion(data);

            document.getElementById(`incant${selected._id}`).focus();
        }
        if(role == 'delete'){
            const opt = confirm('Eliminar!, esta seguro?');
            if(!opt) return;
            let del = {};
            del._id = e.target.getAttribute('_id');
            del.idItem = e.target.getAttribute('_iditem');
            
            toastr.success('Eliminando...');
            
            response = await fetch("/control/del-item-formula",{
                headers: {'content-type': 'application/json'},
                method: 'DELETE',
                body: JSON.stringify(del)
            })
            const data = await response.json();
            repaintAccordion(data);
        }
        if(role == 'toedit'){
            const result = currentCollection.find( ({ _id }) => _id == `${toEdit._id}` );
            toEdit.nombre = result.nombre;
            toEdit.categoria = result.categoria;
            toEdit.codigoProd = result.codigoProd;
        }
       
    }else{
        selected.nombre = '';
        selected.codigo = '';
        selected._id = '';
        selected.cantidad = '';
        selected.unidad = '';
        selected.siBase = false;

        
    }
    
})

document.addEventListener('DOMContentLoaded',async() =>{
     
    
    currentKeys =[{campo: 'nombre', alias: 'Prodcto', tipo: 'string'},
    {campo: 'codigoProd', alias: 'Codigo', tipo: 'string'},{campo: 'siFormulaOk',alias:'formula_ok',tipo:'boolean'}]; 
    
})

async function renderTable(){
    //cargar coleccion
    let response = await fetch("/editor/content",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(filterPag)
    })
    currentCollection = await response.json();

    const container = document.getElementById('accordionMain');
        container.innerHTML = '';
        let i = 0;
        currentCollection.forEach(itemAcc =>{
            let element =  rendItemsAccordion(itemAcc, i)
            i++;
            container.appendChild(element);
            let containerDetalle = document.getElementById(`bodyAccordion${itemAcc._id}`);
            containerDetalle.innerHTML = '';
            let subElement = renderHeadTable(itemAcc._id);
            containerDetalle.appendChild(subElement);
            containerDetalle = document.getElementById(`bt${itemAcc._id}`);
            //containerDetalle.innerHTML = '';
            
            itemAcc.detalle.forEach(itemDetalle =>{
                subElement = renderBodyTable(itemDetalle, itemAcc._id);
                
                containerDetalle.appendChild(subElement);    
            });
            subElement = renderFooterTable(itemAcc._id, itemAcc.siFormulaOk);
            containerDetalle.appendChild(subElement);
        });
}

async function init(){
    document.getElementById('title-main').innerHTML='El Mana Formulas';
    page.szItems = 15;
    page.ordenPor = 'codigoProd';
    page.sortAsc = false;
    page.filterBy = '0';
    page.filterTxt = '';
    filterPag.modelo = 'Formula'; 
    currentKeys =[
        {campo: 'nombre', alias: 'Formula', tipo: 'string'},
        {campo: 'categoria', alias: 'Categoria', tipo: 'string'},
        {campo: 'codigoProd', alias: 'Codigo', tipo: 'string'}
    ];


}

async function afterLoad(){
    await insumosLolad();
    renderTable();
}

function rendItemsAccordion(itemAcc, i){
    let icon = '<a class="btn btn-warning" href="#"  _role="toedit" _id="${itemAcc._id}"><i class="fa fa-exclamation-triangle fa-lg" ></i></a>';
    let ok = "Incompleta!!";
    if(itemAcc.siFormulaOk){
        ok = "O.K.";
        icon = '<a class="btn btn-success " href="#"  _role="toedit" _id="${itemAcc._id}"><i class="fa fa-check-circle fa-lg"></i></a>';
    } 
    let txtHead =`${itemAcc.codigoProd} - ${itemAcc.nombre}, cat: ${itemAcc.categoria}, estado: ${ok}`;
    const div = document.createElement('div');
    div.setAttribute('class', 'accordion-item');
    
    div.innerHTML= `
        <h2 class="accordion-header" id="heading${itemAcc._id}" _id="${itemAcc._id}">
            <button id="btnAcc${itemAcc._id}" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}" _role="toedit" _id="${itemAcc._id}">
               ${icon}<div class="px-3"  _role="toedit" _id="${itemAcc._id}">${txtHead}</div>
            </button>
        </h2>
        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordionMain">
            <div id="bodyAccordion${itemAcc._id}" class="accordion-body">
            </div>
        </div>
    `;
    return div;
}

function renderHeadTable(_id){
    const table = document.createElement('table');
    table.setAttribute('class', 'table table-hover' );
    table.setAttribute('id', `head${_id}`);
    table.innerHTML=`
    <thead>
        <tr class="table-primary">
            <th scope="col">Insumo</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Base</th>
            <th scope="col">Acc.</th>
        </tr>
    </thead>   
    <tbody id ="bt${_id}"></tbody> 
    `;
    return table;
}

function renderBodyTable(itemDetalle, _idDoc){
        
    let chk = ' ';
    if(itemDetalle.siBase) chk = 'checked';
    const table = document.createElement('tr');
    table.innerHTML=`
    
        <td>${itemDetalle.codigoInsumo}-${itemDetalle.nombreInsumo}</td>
        <td>${itemDetalle.cantidad} ${itemDetalle.unidad}</td>
          
        <td><input _role="check" class="form-check-input" type="checkbox" value="" ${chk}  disabled ></td> 
        <td><a  id="del${itemDetalle._id}"  _id = "${_idDoc}" _iditem="${itemDetalle._id}" class="btn btn-default btn-sm" href="#" _role="delete" >
                <i class="fa fa-trash fa-lg" aria-hidden="true" _role="delete" _id = "${_idDoc}" _iditem="${itemDetalle._id}"></i></a></td>         
        
    `;
    return table;
}

function renderFooterTable(_id, formulaOk){
    let chk = 'checked';
    if(formulaOk) chk = '';
    const table = document.createElement('tr');
    table.innerHTML=`
    
        
        <td><input id="inin${_id}" _id="${_id}" type="text" class="form-control" placeholder="Ad. insumo" _role="openList"></td>
        <td><input id="incant${_id}"_id="${_id}" type="text" class="form-control" placeholder="Ad. cantidad" _role="cantidad" ></td>
        
        <td _role="check" _id="${_id}"><input _role="check" id="chk${_id}" _id="${_id}" class="form-check-input" type="checkbox" value="" ${chk}  disabled ></td> 
        <td><a  id="snd${_id}"_id="${_id}" class="btn btn-default btn-sm" href="#" _role="sending" >
                <i class="fa fa-plus-square fa-lg" aria-hidden="true" _role="sending" _id="${_id}"></i> Add</a></td>           
       
    `;
    return table;
}

async function  newEdit(option){
    $('#nuevafModal').modal('show');
    if(option.opNuevo){
        document.getElementById('btn_guardar').setAttribute('_role','crear');
        document.getElementById('modalLabel').innerHTML = 'Crear nueva formula';
        document.getElementById('in_codigo').disabled=false;
        document.getElementById('btn_borrar').style.display = 'none';
        document.getElementById('in_codigo').value = '';
        document.getElementById('in_nombre').value = '';
        document.getElementById('in_codigo').value = '';
        document.getElementById('in_diasvto').value = 0;

    }else{
        document.getElementById('btn_guardar').setAttribute('_role','editar');
        document.getElementById('modalLabel').innerHTML = 'Editar formula';
        document.getElementById('in_codigo').disabled=true;
        document.getElementById('btn_borrar').style.display = '';
        document.getElementById('in_codigo').value = toEdit.codigoProd;
        document.getElementById('in_categoria').value = toEdit.categoria;
        document.getElementById('in_nombre').value = toEdit.nombre;
        document.getElementById('in_diasvto').value = toEdit.diasVence;
    }
    
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

async function insumosLolad(){
    insumosList = await fetch("/control/insumos_list",{
        headers: {'content-type': 'application/json'},
        method: 'GET',
        body: JSON.stringify()
    })
    insumosList = await insumosList.json();
    insumosList.sort((a, b) => a.codigo - b.codigo);
}

function repaintAccordion(itemAcc){
    let icon = '<a class="btn btn-warning" href="#" ><i class="fa fa-exclamation-triangle fa-lg" ></i></a>';
    let ok = "Incompleta!!";
    if(itemAcc.siFormulaOk){
        ok = "O.K.";
        icon = '<a class="btn btn-success " href="#" ><i class="fa fa-check-circle fa-lg"></i></a>';
    } 
    let txtHead =`${itemAcc.codigoProd} - ${itemAcc.nombre}, cat: ${itemAcc.categoria}, estado: ${ok}`;
    let element = document.getElementById(`btnAcc${itemAcc._id}`);
    
    element.innerHTML = '';
    element.innerHTML= `${icon}<div class="px-3">${txtHead}</div>`;
    let containerDetalle = document.getElementById(`bt${itemAcc._id}`);
    containerDetalle.innerHTML = '';
        itemAcc.detalle.forEach(itemDetalle =>{
            let subElement = this.renderBodyTable(itemDetalle, itemAcc._id);
            containerDetalle.appendChild(subElement);    
        });
    let subElement = this.renderFooterTable(itemAcc._id, itemAcc.siFormulaOk);
    containerDetalle.appendChild(subElement);

}