document.getElementById('btn-download').addEventListener('click', async e =>{
    xlsDowload();
 });
 
 document.getElementById('inputFile').addEventListener("change", (event) => {
     selectedFile = event.target.files[0];
     let btn = document.getElementById('btnSendxls');
     if(selectedFile){
         btn.style.display = ""; 
     }else{
         btn.style.display = "none";
     }
   });
 
 document.getElementById('btn-upload').addEventListener('click', async e =>{
     document.getElementById('modalLabelf').innerHTML = `
         Actualizar ${currentCollection.titulo} desde archivo .xls
     `;
     $('#modalFilexls').modal('show');
  });
 
 document.getElementById('btnSendxls').addEventListener('click', async e =>{
     xlsUpload();
 });


document.getElementById("btn_borrar").addEventListener('click',async e =>{
    let objeto = new Object();
    objeto._id = currentDocumentId;
    objeto.modelo = currentCollection.modelo;
    result = window.confirm('Seguro que desea BORRAR el documento?');
    if(!result) return;
    const res = await fetch('/editor/delete', {    
            headers: {
                'Content-Type': 'application/json'
              },
              method: "DELETE",
              body: JSON.stringify(objeto)
            });
    const data = await res.json();
    $('#modalEditor').modal('hide');
    renderTable()    
});

document.getElementById("btn_reset").addEventListener('click',async e =>{
    result = window.confirm('Seguro que desea cambiar el PASSWORD?');
    if(!result) return;
    const res = await fetch('/terceros/reset_passadmin', {    
            headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify({"_id": userId})
            });
    const data = await res.json();
    toastr.success(data);
    $('#modalEditor').modal('hide');
    
});

document.getElementById("btn_guardar").addEventListener('click',async e =>{
    let submit = document.getElementsByClassName("form-snd");
    let objeto = new Object();
    objeto._id = currentDocumentId;
    objeto.modelo = currentCollection.modelo;
    for(let i = 0; i < submit.length; i++){
        if(submit[i].type == 'text'){
                console.log(submit[i].id)
                if(submit[i].id == 'modelo')submit[i].id='modelo2';
                eval(`objeto.${submit[i].id} = "${submit[i].value}"`);
        }else{
            eval(`objeto.${submit[i].id} = false`);
            if(submit[i].checked){
                eval(`objeto.${submit[i].id} = true`);
            }
        }
    }
    let direccion = '/editor/crear';
    if(role == 'edit')  direccion = '/editor/edit';
    result = window.confirm('Seguro que desea CREAR un NUEVO documento?');
    if(!result) return;
    const res = await fetch(direccion, {    
        headers: {
            'Content-Type': 'application/json'
          },
          method: "POST",
          body: JSON.stringify(objeto)
        });
    const data = await res.json();
    if(data.fail){
        toastr.error(data.message);
        return;
    }    
    toastr.info(data.message);
    role ='';
    $('#modalEditor').modal('hide');
    renderTable()  


})

document.getElementById('btnNuevo').addEventListener('click',async e =>{
    role = 'nuevo';
    currentDocumentId = null;
    let titulo = document.getElementById('modal-title');
    titulo.innerHTML = `Nuevo ${currentCollection.titulo}` ;
    renderModal();
    
})

document.getElementById('bodyContainer').addEventListener('dblclick',async e =>{
    let idt = e.target.getAttribute('_id');
    userId = idt;
    role = 'edit';
    currentDocumentId = idt;
    let titulo = document.getElementById('modal-title');
    titulo.innerHTML = `Editar ${currentCollection.titulo}` ;
    renderModal();
    
});

document.getElementById('listDocuments').addEventListener('click',async e =>{
    currentPage = 1;
    let m =e.target.getAttribute('_modelo');
    let t =e.target.getAttribute('_titulo');
    currentCollection ={"titulo":t, "modelo":m};
    filterPag.modelo = m;
    let boton = document.getElementById('btnChose');
    boton.innerHTML = t;
    await renderTable();
    setFilter('config');
    await footer();
})

async function init(){
    page.szItems=10
    await loadList();
}

function afterLoad(){}

async function renderModal(){
    const cambio = document.getElementById('btn_reset');
    if(currentCollection.modelo == 'User'){
        cambio.style.display = '';
    }else{
        cambio.style.display = 'none';
    }
    let ind = 0;
    if(role =='edit') {
        document.getElementById('btn_borrar').style.display = '';
        for(let j=0;j<page.szItems;j++){
            if(currentDocumentId == currentContent[j]._id){
                ind = j; 
                break;
            } 
        }
    }else{
        document.getElementById('btn_borrar').style.display = 'none';
    }
        
    const bodyTable = document.getElementById('bodyTable');
    bodyTable.innerHTML = '';
    currentKeys.forEach(item => {
        let contenido = eval(`currentContent[ind].${item.campo}`);
        let sino = true;
        let inputType = 'text';
        let inputClass = 'form-control';
        if(item.tipo == 'boolean'){
            inputType = 'checkbox';
            inputClass = 'form-check-input';
            if(!contenido)sino=false;
            
            contenido = '';
        }
        const tr = document.createElement('tr');
        if(role == 'edit'){
            let codigo = `currentContent[ind].${item.campo}`;       //se concatena como texto y se ejecuta mediante eval()
            
            tr.innerHTML = `
                <td><span class="input-group-text" id="addon-wrapping">${item.alias}:</span></td>
                <td><input id="${item.campo}" type="${inputType}" class="${inputClass} form-snd" value="${contenido}"></td>
            `;
        }else{
            tr.innerHTML = `
                <td><span class="input-group-text" id="addon-wrapping">${item.alias}:</span></td>
                <td><input id="${item.campo}" type="${inputType}" class="${inputClass} form-snd" value=""></td>
            `;
        }
        bodyTable.appendChild(tr);
        if(item.tipo == 'boolean' && sino){
            document.getElementById(item.campo).checked = true;
        }
        
    })
    $('#modalEditor').modal('show');
}
async function loadList(){
    let listaEditables =  await fetch("/editor/list_collections");
    listaEditables = await listaEditables.json();
    const container = document.getElementById('listDocuments');
    container.innerHTML='';
    listaEditables.forEach(item =>{
        const li = document.createElement('li');
        li.innerHTML= `
        <a _modelo="${item.modelo}" _titulo="${item.titulo}" class="dropdown-item" href="#">${item.titulo}</a>
        `;
        container.appendChild(li);
    })   
    
}

async function renderTable(){
    let response = await fetch("/editor/keys",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(filterPag)
    })
    let data = await response.json();
    if(data.fail){
        toastr.error(data.message);
        return;
    }
    currentKeys = data;
    const container = document.getElementById('encabezado');
    container.innerHTML = '';
    
    data.forEach(columna =>{
        const th = document.createElement('th');
        th.innerHTML= `
            ${columna.alias}                
        `;
        container.appendChild(th);
    });
    //crea la cuadricula con los datos:
    response = await fetch("/editor/content",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(filterPag)
    })
    const dataList = await response.json();
    
    if(data.fail){
        toastr.error(data.message);
        return;
    }
    currentContent = dataList;
    //crea las filas de la cuadricula
    const bodyContainer = document.getElementById('bodyContainer');
    bodyContainer.innerHTML = '';
    dataList.forEach(item => {
        const tr = document.createElement('tr');
        tr.id = item._id;
        bodyContainer.appendChild(tr);
    })
    //crea las coluns de cada fila
    dataList.forEach(item =>{
        let filaContainer = document.getElementById(item._id);
        filaContainer.innerHTML = '';
        data.forEach(columna =>{
            
            let codigo = `item.${columna.campo}`;  //concatena las dos referencias y eval() lo convierte en linea de codig
            const td = document.createElement('td');
            td.setAttribute('_id',item._id);
            if(columna.tipo == 'boolean'){
                if(eval(codigo)){
                    td.innerHTML= `Si`;
                }
                else{
                    td.innerHTML= `No`;
                }
            }else{
               td.innerHTML= `${eval(codigo)}`; 
            }

            
            filaContainer.appendChild(td);
        })
    })
}
async function xlsDowload() {
    let str = JSON.stringify(currentContent);
    currentKeys.forEach(item =>{
        let ncampo = new RegExp(`\\"${item.campo}\\":`, 'g');
        let nalias = `"${item.alias}":`;
        str = str.replace(ncampo, nalias);
    })
    let newContent = JSON.parse(str);
    console.log(newContent);
    
    var copy = [];
    for (const element of newContent) {
        copy.push(element);
    }
    
    var filename = `${currentCollection.titulo}.xlsx`;
    var ws_name = "Hoja1";
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(copy);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, filename);
}

async function xlsUpload(){
    
    console.log('uploads');
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(selectedFile);
    let newContent;
    fileReader.onload = async (event) => {
        let data = event.target.result;
        let workbook = XLSX.read(data, { type: "binary" });
        let sheet = workbook.SheetNames[0];
        let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
        rowObject[0].modelo = currentCollection.modelo;
        console.log(rowObject); 
        let str = JSON.stringify(rowObject);
        currentKeys.forEach(item =>{
            let ncampo = new RegExp(`\\"${item.alias}\\":`, 'g');
            let nalias = `"${item.campo}":`;
            str = str.replace(ncampo, nalias);
        })
    let newContent = JSON.parse(str);
    console.log(newContent);
        const res = await fetch('/editor/update', {    
            headers: {
                'Content-Type': 'application/json'
              },
              method: "PUT",
              body: JSON.stringify(newContent)
        });
        const dats = await res.json();
        console.log(dats)
        if(dats.fail){
            toastr.error(dats.message);
            return;
        }
        toastr.info(dats.message);
        this.renderTable();
    }
    
}