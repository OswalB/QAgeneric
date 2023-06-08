let documentList =[
  {'value':'categ','caption':'Categorías de productos','chk':false}, 
  {'value':'client','caption':'Clientes','chk':false},
  {'value':'criterio','caption':'Criterios aceptación','chk':false},
  {'value':'formula','caption':'Formulas','chk':true},
  {'value':'inalmacen','caption':'Ingreso a almacen','chk':true},
  {'value':'insumo','caption':'Insumos','chk':false},
  {'value':'orderhead','caption':'Pedidos','chk':true},
  {'value':'planilla','caption':'Planillas producción','chk':true},
  {'value':'product','caption':'Productos terminados','chk':false},
  {'value':'user','caption':'Usuarios','chk':false}
];
let varSnd ={'fecha1':'',
              'fecha2':'',
              'modelos':[],
              'sample':''
            };


document.addEventListener('DOMContentLoaded',async() =>{
    filterPag.myClientes=false;
  currentKeys =[{campo: 'client', alias: 'Cliente', tipo: 'string'},
                {campo: 'delivery', alias: 'Fecha entrega', tipo: 'string'}
  ];
  filterPag.modelo = 'Consulta';  
  
  
});
document.getElementById('btn-download').addEventListener('click', e =>{
  changeSnd();
})

document.getElementById('containerFilter').addEventListener('change', e =>{

  

})




//*************FUNCIONES ************************

async function changeSnd(){
  let collection = document.getElementsByClassName('chk-download');
  varSnd.modelos=[];
  for(i in collection){
    if(collection[i].checked){
      varSnd.modelos.push(collection[i].value);
    }
  }
  let f1 =document.getElementById('inFecha1').value,
  f2 =document.getElementById('inFecha2').value,
  samp =document.getElementById('inSample').value;
  
  f1=new Date(f1);
  f2=new Date(f2);
  if(f1=='Invalid Date' || f2=='Invalid Date'){
    alert('Revise los campos fecha de inicio y final!, reintente nuevamente');
    return
  }
  samp =parseInt(samp);
  varSnd.fecha1=f1;
  varSnd.fecha2=f2;
  varSnd.sample = samp;


  console.log(varSnd);

  toastr.info('Enviando...','Consulta');
    const res = await fetch('/api/gen_pipe', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(varSnd)
      });
      const data = await res.json();
      console.log(data);
        if(data[0].fail) {
            toastr.error('Reintente!','No se ha podido enviar.','Consulta');
            return false;
            
        }
        toastr.remove();
        toastr.success(data.msg,'Hecho');
}


function init(){
  
}

function renderTable(){
    console.log("renderTable");
    let container = document.getElementById('containerFilter'), i=0;
    container.innerHTML='';
    const div = document.createElement('div');
    div.innerHTML=`<h5>Seleccine las colecciones que desea actualizar en el equipo local</h5>`;
    container.appendChild(div);
    
    documentList.forEach(item =>{
      const li = document.createElement('li');
      li.setAttribute('class','list-group-item');
        li.innerHTML=`
          <input id="incheck${i}" class="form-check-input me-1 chk-download" type="checkbox" value="${item.value}" ${item.chk?'checked':''}>
          <label for="incheck${i}">${item.caption}</label>
        `
      container.appendChild(li);
      i++;
    })

} 




