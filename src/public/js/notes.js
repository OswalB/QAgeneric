
document.getElementById('container').addEventListener('click',async e =>{
    let __id = e.target.getAttribute('_id');
    let role = e.target.getAttribute('role');
    let noteObj ={};
    noteObj._id = __id;
    
    if(role == 'btn_del'){
        rc = confirm("¿Seguro que desea Eliminar esta nota?");
        if(!rc){
            toastr.info('No se hicieron cambios');  
            return;  
        } 
        toastr.info('Enviando...');
        await fetch("/notes/delete",{
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(noteObj)
        });
        document.location.reload();
    }
    if(role == 'btn_edit'){
        const url = `/notes/edit/${__id}`
        console.log('editando', url); 
        window.location.href = url;
        
    }
    
})

document.getElementById('btnNuevo').addEventListener('click',async e =>{
    console.log('boton nevo')
    window.location.href = '/notes/add';
    
})

document.addEventListener('DOMContentLoaded',async() =>{
     
    currentKeys =[{campo: 'nombre', alias: 'Prodcto', tipo: 'string'},
    {campo: 'codigoProd', alias: 'Codigo', tipo: 'string'}]; 
    
})
function init(){
    document.getElementById('title-main').innerHTML='El Mana - notes'
}

function renderTable(){}