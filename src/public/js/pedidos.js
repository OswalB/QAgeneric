let misClientes = [], groups =[], listProducts = [], docPedido ={}, jsonPedido =[], misPedidos, order;
document.getElementById('btnMas').addEventListener('click', async e=>{
    let valor = parseInt(document.getElementById('inHoras').value);
    valor+=1;
    
    document.getElementById('inHoras').value = valor;
    document.getElementById('alertPlazo').style.display = 'none';
    if(valor < 2)document.getElementById('alertPlazo').style.display = '';
    let fechaEntrega =entrega(valor);
    document.getElementById('dateOrder').value = fechaEntrega.fechaDisplay;
    docPedido.delivery = fechaEntrega.fechaEntrega;
})
document.getElementById('btnMenos').addEventListener('click', async e=>{
    let valor = parseInt(document.getElementById('inHoras').value);
    valor-=1;
    if(valor < 1)valor=0;
    document.getElementById('inHoras').value = valor;
    document.getElementById('alertPlazo').style.display = 'none';
    if(valor < 2)document.getElementById('alertPlazo').style.display = '';
    let fechaEntrega =entrega(valor);
    document.getElementById('dateOrder').value = fechaEntrega.fechaDisplay;
    docPedido.delivery = fechaEntrega.fechaEntrega;
})
document.getElementById('btnNuevo').addEventListener('click', async e=>{
    if(document.getElementById('nombre').value) {
        toastr.warning('El pedido actual no ha sido enviado','Atencion!')
        const resp = confirm('El pedido actual no ha sido enviado.\n¿Desea borrar el contenido e iniciar un pedido nuevo?');
        if(!resp) return;
    }
    clearInputs();
    docPedido = {};
    await renderClientes('');
    document.getElementById('inHoras').value = 2;
    const fecha = entrega(2);
    docPedido.delivery = fecha.fechaEntrega;
    document.getElementById('dateOrder').value = fecha.fechaDisplay;
    $('#clientesModal').modal('show');
})

document.getElementById('btnFaltantes').addEventListener('click', async e=>{
    backOrder(true);    //true: faltantes ; false: copia
    
})

document.getElementById('btnCopiar').addEventListener('click', async e=>{
    backOrder(false);    //true: faltantes ; false: copia
    
})

document.getElementById('inSearch').addEventListener('input',async e => {
    text = document.getElementById('inSearch').value;
    text = text.toUpperCase();
    renderClientes(text);
})

document.getElementById('btnVista').addEventListener('click', async e=>{
    renderModalVista();
    $('#vistadrop').modal('show');
    docPedido.id_compras = document.getElementById('compra').value;
    docPedido.notes = document.getElementById('notes').value;
    docPedido.orderItem = jsonPedido;
    
})

document.getElementById('listClientes').addEventListener('click',async e => {
    let nit = e.target.getAttribute('_nit');
    let nombre = e.target.innerText;
    setPaso(1);
    docPedido.client = nombre;
    docPedido.nit = nit;
    document.getElementById('nombre').value = nombre;
    
    $('#clientesModal').modal('hide');
})

document.getElementById('btnSend').addEventListener('click',async e => {
    toastr.info('Enviando...','Pedido');
    const res = await fetch('/ventas/pedidos', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify(docPedido)
      });
      const data = await res.json();
      
        if(data.fail) {
            toastr.error('Reintente!','No se ha podido enviar.','Pedido');
            return false;
            
        }
        toastr.remove();
        toastr.success(data.msg,'Pedido');
        
        clearInputs();
        
        setPaso(0);
        $('#vistadrop').modal('hide');
        await renderTable(); 
})

document.getElementById('inHoras').addEventListener('input',async e => {
    let plazo =0;
    if(document.getElementById('inHoras').value){
        plazo = parseInt(document.getElementById('inHoras').value);
    }
    
    
    
    if(plazo < 1){
        plazo=0;
        document.getElementById('inHoras').value = plazo;
    }
    document.getElementById('alertPlazo').style.display = 'none';
    if(plazo < 2)document.getElementById('alertPlazo').style.display = '';
    let fechaEntrega =entrega(plazo);
    document.getElementById('dateOrder').value = fechaEntrega.fechaDisplay;
    docPedido.delivery = fechaEntrega.fechaEntrega;
})

document.getElementById('misPedidosBody').addEventListener('click', async e=>{
    toastr.warning('Cargando...','Espere');
    const idPedido = e.target.getAttribute('_idpedido');
    
    const res = await fetch(`/ventas/pedido/${idPedido}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "GET"
      });
      const data = await res.json();
      order =data[0];
      
      document.getElementById('pedidoLabel').innerHTML=order.client;

        if(data.fail) {
            toastr.error('Reintente!','Pedido');
            return false;
        }
        toastr.remove();
        let oc ="";
            if(order.id_compras){oc = "O.C.# "+ order.id_compras;}
            const avr = Math.trunc( (100 * order.TotalDisp) / order.totalReq);
            let estado = "";
            if(order.notes){estado = "bg-warning"};
            const delivery = new Date(order.delivery);
            const created = new Date(order.createdAt);
            let pill ='';
            if(order.state == 1){pill= '<span class="position-absolute top-0 start-200 translate-middle badge        rounded-pill bg-success">Finalizado!</span>';}
           document.getElementById('cardBody').innerHTML=
           `    
                <div class="card-header ${estado}">
                    <h5 class="card-header">Entregar: ${delivery.toLocaleDateString()}-${delivery.toLocaleTimeString()} ${order.notes} ${oc}</h4>
                    <div class="progress">
                        <div class="progress-bar bg-info" role="progressbar" style="width: ${avr}%;" aria-valuenow="${avr}" aria-valuemin="0" aria-valuemax="100">${avr}%</div>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">Usuario: ${order.sellerName}, enviado: ${created.toLocaleDateString()}-${created.toLocaleTimeString()} 
                    ${pill}
                    </button>
                    
                    </h5>
                    <table class="table table-hover table-bordered">
                        <thead>
                            <tr>
                                <th scope="col" >Producto</th>
                                <th scope="col" class="col-1">Pedido</th>
                                <th scope="col" class="col-1">Desp.</th>
                                <th scope="col" class="col-3">Cantidad</th>
                            </tr>
                        </thead>
                            <tbody id="body1">
                            </tbody>
                    </table>    

                </div>   
                
                `; 
            const bodyContainer = document.getElementById('body1');
            bodyContainer.innerHtml = '';
            let j = 0;
            for(let item of order.orderItem){
                //console.log(item);
                let dispatchBy = '--';
                let status = "bg-secondary";
                let disp=0;
                if(item.qty == item.dispatch){status = "bg-success";}
                if(item.qty > item.dispatch){status = "bg-primary";}
                if(item.qty < item.dispatch){status = "bg-warning";}
                if(item.dispatchBy){dispatchBy = item.dispatchBy};
                if(item.dispatch){disp = item.dispatch}
                const tr = document.createElement('tr');
                tr.innerHTML =`
                    <th class=" text-white ${status}" scope="row">${item.product}</th>
                    <td class=" text-white text-right ${status}">${item.qty}</td>
                    <td>${dispatchBy}</td>
                    <td>${disp}</td>
                `;
                bodyContainer.appendChild(tr);
                j += 1;

            }
        
$('#pedidodrop').modal('show');

})


    

    async function getListas(){
        let filterPag ={};
        //modelo, saltar, limitar, filterTxt,filterBy, sortBy, sortAsc, bandera, flanco
        filterPag.filterTxt = '';
        filterPag.modelo = 'Categ';
        filterPag.sortBy = 'codigo';
        filterPag.sortAsc = true;
        filterPag.saltar = 0;
        filterPag.limitar = 100;
        let response = await fetch("/editor/content",{
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(filterPag)
        })
        let data = await response.json();
        
        if(data.fail){
            return;
        }
        groups = data;
        filterPag.filterTxt = '';
        filterPag.modelo = 'Product';
        filterPag.sortBy = 'corto';
        filterPag.sortAsc = true;
        filterPag.saltar = 0;
        filterPag.limitar = 500;
        response = await fetch("/editor/content",{
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: JSON.stringify(filterPag)
        })
        data = await response.json();
        
        if(data.fail){
            
            return;
        }
        listProducts = data;
    }    

    async function renderAccordion(){
        const productsContainer = document.getElementById('accordionItems');
        productsContainer.innerHTML='';
        var i = 0;
        groups.forEach(itemGroup =>{
            const div = document.createElement('div');
            div.class='';
            div.innerHTML =`
                
                    
                    <div class="accordion-item" >
                        <h2 class="accordion-header mb-0" id="heading${i}">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                                ${itemGroup.nombre}
                            </button>
                        </h2>
                    </div>
                   
                    <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordionItems">
                        <div class="accordion-body">           
                            <table class="table  table-hover">
                            <tbody id="item${i}">
                            
                            </tbody>
                            </table>            
                        </div>
                    </div>
                    
               
            `
            productsContainer.appendChild(div); 

            const itemsContainer = document.getElementById('item'+i);
            itemsContainer.innerHTML='';

            listProducts.forEach(product => {
                if(product.categoria === itemGroup.codigo){

                const tr = document.createElement('tr');
                //divItem.class='';
                //tr.setAttribute("class",  "bg-success text-light");
                tr.innerHTML = `
                <td><label for="${product.codigo}">
                    ${product.nombre}
                </label></td>
                <td><input id="${product.codigo}" _idProduct="${product.codigo}" type="number"  min="0"  style="width:80px" class="text-end inpedido"></td>
                
                `
                itemsContainer.appendChild(tr);
                }
            })
            
        
            
            i += 1;
        })  
    }

    async function getMisClientes(){
        let response = await fetch("/terceros/mis_clientes",{
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({})
        })
        const data = await response.json();
        
        misClientes = data;
        
    }

    async function renderClientes(filtro){
        const container = document.getElementById('listClientes');
        container.innerHTML = '';
        misClientes.forEach(item =>{
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
    function setPaso(paso){
        let state = ''
        if(paso < 1){
            state = 'none';
        }
        document.getElementById('step01').style.display = state;
        document.getElementById('step02').style.display = state;
        document.getElementById('step03').style.display = state;
        document.getElementById('step04').style.display = state;
        document.getElementById('step05').style.display = state;
        document.getElementById('accordionItems').style.display = state;
        document.getElementById('btnVista').style.display = state;
        state = '';
        
        
    }

    function renderModalVista(){
        let client = document.getElementById('nombre').value;
        let delivery = document.getElementById('dateOrder').value;
        document.getElementById('vistaLabel').innerHTML=`Cliente: ${client} entregar el ${delivery}`;
        let precioF, totalProducts =0, precioTotal=0;
        const vistaContainer=document.getElementById('vistaPrevia');
        vistaContainer.innerHTML ='';
        jsonPedido =[];
        listProducts.forEach(product =>{
            const itemProduct = document.getElementById(product.codigo);
            
            if(itemProduct.value >0){
                jsonPedido.push({'code':product.codigo,'product':product.corto, 'qty':itemProduct.value, 'dispatch':0})
                const tr = document.createElement('tr');
                tr.innerHTML= `
                    <th scope="row">*</th>
                    <td>${product.nombre}</td>
                    <td>${itemProduct.value}</td>
                `;
                vistaContainer.appendChild(tr);
                totalProducts += parseInt(itemProduct.value);
                precioTotal+= parseInt(itemProduct.value) * product.precio;
                precioF = new Intl.NumberFormat().format(precioTotal)
            }
        })
        const tr = document.createElement('tr');
        tr.innerHTML= `
            
            <th scope="row"></th>
            <th scope="col">TOTAL</td>
            <th scope="col">${totalProducts}</td>
        `;
        vistaContainer.appendChild(tr); 
        const tr2 = document.createElement('tr');
        tr2.innerHTML= `

            <th scope="row"></th>
            <th scope="col"></td>
            <th scope="col">${precioF}</td>
        `;
        vistaContainer.appendChild(tr2);
        docPedido.totalReq=totalProducts;
        if(totalProducts < 1){
            document.getElementById('btnSend').setAttribute('disabled','true');
        }else{
            document.getElementById('btnSend').removeAttribute('disabled');
        }


    }




async function init(){
    document.getElementById('title-main').innerHTML='El Mana - Pedidos';
    filterPag.myClientes = true;
    currentKeys =[{campo: 'client', alias: 'Cliente', tipo: 'string'}];
    filterPag.modelo = 'Order';
    
}

async function afterLoad(){
    setPaso(0);
    await getMisClientes();
    await getListas();
    await renderAccordion();//service.renderTable
    document.getElementById('seccOrdenar').style.display = 'none';
    await renderTable();
}

async function renderTable(){
    
    toastr.info('Recibiendo...','Mis pedidos');
        const res = await fetch("/ventas/my_orders",{
            headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify(filterPag)
        })

        const data = await res.json();
        
        if(data.fail) {
            toastr.error('Reintente!','No se ha podido recibir.','Pedido');
            return false;
            
        }
        toastr.remove();
        misPedidos = data;


        const vistaContainer=document.getElementById('misPedidosBody');
        vistaContainer.innerHTML ='';
        misPedidos.forEach(pedido =>{
            let colort = '';
            const avr = Math.trunc( (100 * pedido.TotalDisp) / pedido.totalReq);
            let entrega = new Date(pedido.delivery);
            entrega=`${entrega.getDate()}/${(entrega.getMonth()+1)} ${entrega.getHours()}:${+entrega.getMinutes()}`;
            const tr = document.createElement('tr');
            if(pedido.state == '0'){
                tr.setAttribute("class",  "bg-success text-light");
                colort = 'text-light'
            }    
                tr.innerHTML= `
                   <td class="${colort}" _idpedido="${pedido._id}">${(entrega)}</td>
                   <td class="${colort}" _idpedido="${pedido._id}">${pedido.client}</td>
                   <td class="${colort}" _idpedido="${pedido._id}">${avr}%</td>
                `;
                vistaContainer.appendChild(tr);
        })
}    

function clearInputs(){
    let limpiar = document.getElementsByClassName('inpedido');
        
        for(i=0; i < limpiar.length; i++) {
            limpiar[i].value='';
        }
}

function entrega(plazo){
    let sethabiles=[
        [],
        [8,9,10,11,12,14,15,16],
        [8,9,10,11,12,14,15,16],
        [8,9,10,11,12,14,15,16],
        [8,9,10,11,12,14,15,16],
        [8,9,10,11,12,14,15,16],
        [8,9,10,11,12],
        ]
      let f,h,d ;
      f = new Date();
      for(p=1;p<parseInt(plazo)+1;p++){
          f.setHours(f.getHours() + 1);
          h = f.getHours();
          d = f.getDay();
          while(nohabil(sethabiles[d],h)){
            
              f.setHours(f.getHours() + 1);
              h = f.getHours();
              d = f.getDay();
          }
      }
      
      return {"fechaEntrega":f, "fechaDisplay":f.toLocaleDateString('es-us',{weekday: 'short',day:'2-digit',month:'short',hour:'2-digit', minute:'2-digit'})};
}

function nohabil(arrayDia, hora){
    let response = true;
    for(i=0; i<arrayDia.length; i++){
         
        if( hora == arrayDia[i] ){
            response = false;
            break;
        }   
         
    }
      return response;
}

function backOrder(faltantes){
    
    if(document.getElementById('nombre').value) {
        toastr.warning('El pedido actual no ha sido enviado','Atencion!')
        const resp = confirm('El pedido actual no ha sido enviado.\n¿Desea borrar el contenido e iniciar un pedido nuevo?');
        if(!resp) return;
    }
    clearInputs();
    setPaso(1);
    $('#pedidodrop').modal('hide');
    document.getElementById('nombre').value = order.client;
    document.getElementById('compra').value = order.id_compras;
    document.getElementById('inHoras').value = 2;
    const fecha = entrega(2);
    docPedido.delivery = fecha.fechaEntrega;
    document.getElementById('dateOrder').value = fecha.fechaDisplay;
    document.getElementById('notes').value = order.notes;
    docPedido.client = order.client;
    docPedido.nit = order.nit;
    order.orderItem.forEach(item => {
        if(faltantes){
            let pendiente = item.qty - item.dispatch;
            if(pendiente > 0) {
                document.getElementById(item.code).value = pendiente;
            }
        }else{
            document.getElementById(item.code).value = item.qty;
        }    
        
        
    })
}