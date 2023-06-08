var localOrders, itemCollection =[], idTimerRes, coleccionIn, actividad =true, cantMsgs, activityId, ultima={}, nuevos =[], idBtn;
const segs = 1000, mins = 60 * segs, timeQueryNews = 5 * mins, timeActivity = 3 * mins ;

document.getElementById('check_estado').addEventListener('click',async e =>{
    let chkEstado = document.getElementById('check_estado').checked;
    let lblTexto = 'Todos los pedidos';
    filterPag.nofact = false;
    filterPag.sortAsc = false;
    filterPag.sortBy = 'createdAt'
    if(chkEstado){
        filterPag.sortAsc = true;
        filterPag.sortBy = 'delivery'
        lblTexto = 'Pedidos sin facturar';
        filterPag.nofact = true;
    } 
    document.getElementById('lbl_estado').innerHTML= lblTexto;
    currentPage = 1;
    footer(); 
    renderTable(); 
})

addEventListener('pointerover', (event) => {
    actividad = true;
    
    clearTimeout(activityId);
    activityId = setTimeout(timerActivity, timeActivity);
    
});
document.getElementById('itemAlert').addEventListener('click',async e =>{
    await service.putQty();
})
document.addEventListener('DOMContentLoaded',async() =>{
    //service = new Service();
    
                    
    //await renderTable();
  })

document.getElementById('accordionPanel').addEventListener('click',async e =>{
    let i =e.target.getAttribute('idcard');
    if (e.target.classList.contains('btn-hide')){
        
        document.getElementById('acc-item'+i).style.display = 'none';
    }
    if (e.target.classList.contains('clip')){
        e.preventDefault();
        toastr.warning('ESPERE!');
        await actInputs();
        
        let _id = localOrders[i]._id;
        let toClip = localOrders[i].orderItem;
        const res = await fetch('/dispatch/state',{
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'PUT',
            body: JSON.stringify({"idOrder":_id,"state":1})
        })
        const dara = await res.json();
        let pyme = '';
        for(element of toClip){
            if(element.dispatch>0){
                pyme += `${element.code}\t\t${element.dispatch}\n`;
            }
            
        }
        document.getElementById('btnHide'+i).style.display="";
        toastr.remove();
        toastr.success('Informacion en portapapeles','Facturación')
        //navigator.clipboard.writeText(pyme);
        if (typeof (navigator.clipboard) == 'undefined') {
            
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
}) 

document.getElementById('cardsContainer').addEventListener('input',async e =>{
    let i =e.target.getAttribute('_idt');
    idBtn = 'fac'+i;
    document.getElementById(idBtn).disabled = true;
})

document.getElementById('cardsContainer').addEventListener('change',async e =>{
    
    let idInput = e.target.getAttribute('id');
    if(idInput){
        let value0 = parseInt(document.getElementById(idInput).value);
        if(value0 === 0){
            document.getElementById(idInput).value ='';
            return;
        } 
        let idOrder = e.target.getAttribute('_idOrder');
        //let idt = e.target.getAttribute('_idt');
        let idItem = e.target.getAttribute('_idItem');
        const description = document.getElementById('lbl'+idItem).innerHTML;
        
        itemCollection=({"idItem": idItem, "idOrder": idOrder, "value": value0, "description": description});
        document.getElementById(idInput).value ='';
        document.getElementById(idInput).placeholder ='espere...';
        await service.putQty();
        
       
                //
        //document.getElementById(idInput).setAttribute('placeholder',77);

        //document.getElementById(idInput).value ='';
    }    
})

document.getElementById('cardsContainer').addEventListener('click',async e =>{
    let idDoc = e.target.getAttribute('_idDoc');
    let idItem = e.target.getAttribute('_idItem');
    let idOrder  = e.target.getAttribute('_idOrder');
    let idin = e.target.getAttribute('idin');
    const id = e.target.getAttribute('id');
    if(idin){
        
        let response = await fetch("/orders/getHistory",{
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({"idDocument":idOrder,"idItem":idItem})
        })
        const data = await response.json();
        let cantidad = data[0].orderItem.dispatch;
        document.getElementById(id).placeholder=cantidad;
        
    }
    if(idDoc && idItem) {
        
        await getHistory(idDoc, idItem);
    }

    
    
})

class Service{
    async putQty(){ 
        //deshabilitar(true);
       startTest(); 
       const res = await fetch('/dispatch/qtyHistory', {    
                headers: {
                    'Content-Type': 'application/json'
                  },
                  method: "PUT",
                  body: JSON.stringify(itemCollection)
            });
            const data = await res.json();
            
            
            let idInput = 'in_'+itemCollection.idItem;
            
                if(data.fail) {
                    deshabilitar(true);
                    clearTimeout(idTimerRes);
                    document.getElementById(idInput).setAttribute('placeholder','Reintentar!!');
                    conservar = itemCollection;
                    toastr.error(`No se ha podido enviar ${itemCollection.description}`);
                }else{
                    alertSend(false);
                    clearTimeout(idTimerRes);
                    await actInputs();
                    deshabilitar(false);
                    //document.getElementById(idInput).setAttribute('placeholder',77);
                    toastr.remove();
                    toastr.options = {"timeOut":"3000"};
                    toastr.success('Enviado: O.K.', itemCollection.description);
                    document.getElementById(idBtn).disabled = false;
                }
        /*        
        }
        
        if(conservar.length > 0){
            deshabilitar(true);
        }else{
            deshabilitar(false);
        } 

        itemCollection = conservar;*/
    }
}


async function init(){
    document.getElementById('title-main').innerHTML='El Mana Despachos';
    filterPag.myClientes = false;//contador de registros solo mis clientes
    page.szItems = 15;
    page.ordenPor = 'delivery';
    page.sortAsc = false;
    page.filterBy = '0';
    page.filterTxt = '';
    filterPag.modelo = 'Order';
    filterPag.nofact=true;
    currentKeys =[
        {campo: 'client', alias: 'Cliente', tipo: 'string'},
        {campo: 'orderItem.code', alias: 'Codigo', tipo: 'string'},
        {campo: 'lote', alias: 'Lote', tipo: 'string'}
    ];
    

    


}

async function afterLoad(){
    document.getElementById('seccOrdenar').style.display = 'none';
     reloj(); 
    activityId = setTimeout(timerActivity, timeActivity);
    ultima.inicial = new Date();
    ultima.actualizada = ultima.inicial;
    //ultima.actualizada = new Date(ultima.inicial.setHours(ultima.inicial.getHours() - 24))
    service = new Service(); 
    await  consultarUltima(); 
    renderTable()
}

async function getHistory(idDocument, idItem){
    
    toastr.info('Recibiendo...');
        let response = await fetch("/orders/getHistory",{
            headers: {'content-type': 'application/json'},
            method: 'POST',
            body: JSON.stringify({"idDocument":idDocument,"idItem":idItem})
        })
        const data = await response.json();
        let pendiente = data[0].orderItem.qty - data[0].orderItem.dispatch;
        const vistaContainer = document.getElementById('headerVista');
        vistaContainer.innerHTML='';
        const div = document.createElement('div');
        div.setAttribute('class', 'modal-content');
        div.innerHTML = `
        <div class="modal-header">
            <h5 class="modal-title" id="vistaLabel">Detalle de embalaje Cliente: ${data[0].client}<br>${data[0].orderItem.product}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <table id="tableHistory" class="table table-success table-striped">
                <thead>
                    <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Dsp.</th>
                    <th scope="col">Cantidad</th>
                    </tr>
                </thead>
                <tbody id="vistaHistory">

                </tbody>
                <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Despachado:</th>
              <th scope="col">${data[0].orderItem.dispatch}</th>
            </tr>
            <tr>
              <th scope="col"></th>
              <th scope="col">Pedido:</th>
              <th scope="col">${data[0].orderItem.qty}</th>
            </tr>
            <tr>
              <th scope="col"></th>
              <th scope="col">Pendiente:</th>
              <th scope="col">${pendiente}</th>
            </tr>
          </thead>
            </table>
        </div>
      <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        
      </div>
        `;
        vistaContainer.appendChild(div);

        


        const vistaContainer2=document.getElementById('vistaHistory');
        vistaContainer2.innerHTML ='';
              
        data[0].orderItem.historyDisp.forEach(fila =>{
            //count++;
            let fecha = new Date(fila.fechaHistory);
            let fechaTxt =  `${fecha.toLocaleDateString('es-us',{weekday: 'short',day:'2-digit',month:'short',hour:'2-digit', minute:'2-digit'})}`;
                const tr = document.createElement('tr');
                tr.innerHTML= `
                    <td>${fechaTxt}</td>
                    <td>${fila.dspHistory}</td>
                    <td>${fila.qtyHistory}</td>
                `;
                vistaContainer2.appendChild(tr);
                
            //}
        })
        $('#exampleModal').modal('show');
        toastr.remove();
}

async function actInputs(){
    const res = await fetch('/despachos/disp');
    const data = await res.json();
    
    let setItems = document.getElementsByClassName('it-input');
    for(i=0; i<setItems.length; i++){
        const _id = setItems[i].id.substring(3,50);
        const result = data.find(({ serie }) => serie === _id);
        if(result){
            setItems[i].setAttribute('placeholder',result.despachado);
        }else{
            setItems[i].setAttribute('placeholder','###'); 
        }
    }

    localOrders.forEach((orden)=>{
        orden.orderItem.forEach((item)=>{
            const result = data.find(({ serie }) => serie === item._id);
        if(result){
            item.dispatch = result.despachado;
        }    
        })
    })

    setItems = document.getElementsByClassName('it-desc');
    
    for(i=0; i<setItems.length; i++){
        const _id = setItems[i].id.substring(3,50);
        const result = data.find(({ serie }) => serie === _id);
        if(result){
        let dif = result.pedido - result.despachado;
        
        let clase = 'it-desc text-white';
        if(result.despachado == 0){
            clase += ' bg-secondary';
        }else{
            if(dif == 0) clase += ' bg-success';
            if(dif < 0) clase += ' bg-warning';
            if(dif > 0) clase += ' bg-primary';
        }
            
        
        setItems[i].setAttribute('class',clase);
    }
    }
    setItems = document.getElementsByClassName('progress-bar');
    
    for(i=0; i<setItems.length; i++){
        const _id = setItems[i].id.substring(4,50);
        
        const result = data.find(({ serie }) => serie == _id);
        
        if(result){
            const avr = Math.trunc( (100 * result.despachado) / result.pedido);
            
            setItems[i].style.width = avr+'%';
            setItems[i].innerHTML = `${avr}%`;
        }
    }
    


}


async function renderTable(){
    //filterPag.sortBy= 'delivery';
    let chkEstado = document.getElementById('check_estado').checked;
    filterPag.sortAsc = false;
    filterPag.sortBy = 'createdAt'
    if(chkEstado){
        filterPag.sortAsc = true;
        filterPag.sortBy = 'delivery';
        filterPag.nofact = true;
    } 
    
    const res = await fetch('/editor/content', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(filterPag)
    });
    const data = await res.json();
    
    if(data.fail) {
        toastr.error('Reintente!','No se ha podido recibir.','Pedido');
        return false;
            
    }
    localOrders = data;
    /*for(let order of localOrders){
        if(order.createdAt > ultimaGuardada){
            const i = nuevos.indexOf(order._id);
            if(i < 0) nuevos.push(order._id);
        }
    }*/
    renderCards();
} 

async function renderCards(){
    const cardsContainer = document.getElementById("cardsContainer");
    let i = 0;
        cardsContainer.innerHTML = '';
        for(let order of localOrders){
            let horasentrega = hoursAgo(order.delivery);
            let colorh = 'success';
            if(horasentrega.horas < 0)colorh = 'danger';
            let oc ="";
            if(order.id_compras){oc = "O.C.# "+ order.id_compras;}
            const avr = Math.trunc( (100 * order.TotalDisp) / order.totalReq);
            let estado = "";
            if(order.notes){estado = "bg-warning"};
            let delivery = new Date(order.delivery);
            delivery = fechaFormated(delivery);
            let created = new Date(order.createdAt);
            created = fechaFormated(created);
            let pill ='';
            const indice = nuevos.indexOf(order._id);
            if(indice > -1)
            pill =`<span class="position-absolute top-2 start-11 translate-middle badge rounded-pill bg-warning">Nuevo
            <span class="visually-hidden">unread messages</span>
            </span>`;
            let estilo = 'none';
            if(order.state == 1)estilo = 'inline';
            const divCard = document.createElement('div');
            divCard.setAttribute('class', 'accordion-item ');
            divCard.setAttribute('id', 'acc-item'+i);
            divCard.innerHTML =`
            <h3 class="accordion-header" id="heading${i}">
                <button class="accordion-button collapsed fs-5" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}">
                    <div class="flex-fill">${order.client}${pill}</div>
                    <h5 id="reloj${i}" class="text-${colorh}">${horasentrega.texto}</h5>
                </button>
            </h3>
            <div id="collapse${i}" class="accordion-collapse collapse" data-bs-parent="#accordionPanel">
                <div class="accordion-body">
                    <div class="card">
                        <div class="card-header ${estado}">
                            <span class="fs-5">
                                Entregar el: ${delivery} - ${order.notes} - ${oc}
                            </span>
                            <div class="progress">
                                <div id="pbar${order._id}" class="progress-bar bg-info" role="progressbar" style="width: ${avr}%;" aria-valuenow="${avr}" aria-valuemin="0" aria-valuemax="100">${avr}%</div>
                            </div>
                        </div>
                        <div class="card-body">
                            <span>Enviado el : ${created}, por: ${order.sellerName}</span>
                            <button id="fac${i}"class="btn btn-primary mx-2 clip position-relative" idcard=${i} href="#" >Facturar<span class="position-absolute top-0 start-200 translate-middle badge rounded-pill bg-danger" style = display:${estilo} >Finalizado!</span></button>
                            <button id="btnHide${i}"class="btn btn-primary mx-2 btn-hide position-relative" idcard=${i} href="#"  style = display:none>Ocultar</button>
                            <table class="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th scope="col" >Prod.</th>
                                        <th scope="col" >Pedido</th>
                                        <th scope="col" >Hist.</th>
                                        <th scope="col" >Cant.</th>
                                    </tr>
                                </thead>
                                <tbody id="body${i}">
                                </tbody>
                            </table> 
                        </div>    
                    </div>
                </div>
            </div>
            `;
            cardsContainer.appendChild(divCard);
            const bodyContainer = document.getElementById('body'+i);
            bodyContainer.innerHtml = '';
            let j = 0;
            for(let item of order.orderItem){
                let status = "bg-secondary";
                if(item.qty == item.dispatch){status = "bg-success";}
                if(item.qty > item.dispatch && item.dispatch > 0){status = "bg-primary";}
                if(item.qty < item.dispatch){status = "bg-warning";}
                if(item.dispatchBy){dispatchBy = item.dispatchBy};
                let valueDisp=item.dispatch;
                const idtr = i;
                const tr = document.createElement('tr');
                tr.innerHTML =`
                    <th id="c1_${item._id}" class="text-white ${status} it-desc" >
                        <label id="lbl${item._id}" for="in_${item._id}">${item.product}</label>
                    </th>
                    <td id="c2_${item._id}" class=" text-white ${status} it-desc">
                        <label for="in_${item._id}">${item.qty}</label>
                    </td>
                    <td _idItem="${item._id}" _idDoc="${order._id}">
                        <label  id="c3_${item._id}" ><i _idItem="${item._id}" _idDoc="${order._id}" class="fa fa-search-plus" aria-hidden="true"></i></i>
                    </td>
                    <td>
                        <input idin=true id="in_${item._id}" type="number"  class="form-control text-end it-input" placeholder="${valueDisp}" value="" _idOrder="${order._id}" _idItem="${item._id}" _qty="${item.qty}" _dispatch="${valueDisp}" _dispatchBy="${item.dispatchBy}" _idt="${idtr}">
                    </td>
                `;
                bodyContainer.appendChild(tr);
                j += 1;
            }

            i++;
        } 

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

function hoursAgo(f){
    entrega = new Date(f);
    const hoy = new Date();
    enminutos = Math.trunc((entrega-hoy) / 60000);
    h = Math.trunc(enminutos/60);
    m = enminutos - (h*60)
    hh = ("0" + Math.abs(h)).slice(-2);
    mm = ("0" + Math.abs(m)).slice(-2);
    const texto = `${hh}:${mm}`;
    j = {"texto":texto, "horas":h}
    
    return j;
}

function startTest(){
    toastr.options = {
        "closeButton": true,
        "newestOnTop": true,
        "positionClass": "toast-top-right",
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "15000"
      }
      toastr.remove();
      toastr.info('Enviando datos');
      //idTimerRes = setTimeout(alertSend, 6000,true);
}

function timerActivity(){
    actividad = false;
    
}
async function consultarUltima(){
    
    ultimaId = setTimeout(consultarUltima,timeQueryNews);
    if(actividad){
        const res = await fetch('/ventas/last_pedido',{
            headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify(ultima)
        });
        let test = await res.json();
        
        if(test.length > 0) {
            
            ultima.actualizada = test[0].createdAt;
            nuevos =[];
            for(i=0; i<test.length; i++) {
                nuevos.push(test[i]._id);
            }         
            await renderTable();
            await renderCards(); 
        }
    }
}

function reloj(){
    setTimeout(reloj, 60000);
    
    
    let i = 0;
    if(localOrders){
    for(let order of localOrders){
        let horasentrega = hoursAgo(order.delivery);
        let colorh = 'text-success';
        if(horasentrega.horas < 0)colorh = 'text-danger';
        const element = document.getElementById('reloj' + i);
        element.removeAttribute('class');
        element.setAttribute('class', colorh );
        element.innerHTML = horasentrega.texto;
        i++;
    }   
} 
}

function deshabilitar(estado){
    coleccionIn = document.querySelectorAll('.form-control');
    
    coleccionIn.forEach(input =>{
        input.disabled = estado;
    })
    /**/
}

function alertSend(estado){
    
    const element = document.getElementById("seccAlert");
    if(estado){
        
        element.style.display = '';
        window.scroll({top: 0,left: 0,behavior: 'smooth'});
    }else{
        element.style.display = 'none';
    }
}
