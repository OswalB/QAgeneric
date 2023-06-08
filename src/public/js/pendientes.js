let lista = [];



//document.addEventListener('DOMContentLoaded', async () => {
async function init() {
    document.getElementById('title-main').innerHTML='El Mana Pendientes';
    document.getElementById('form-filtro').style.display='none'

    currentKeys = [{ campo: 'client', alias: 'Cliente', tipo: 'string' },
    { campo: 'delivery', alias: 'Fecha entrega', tipo: 'string' }
    ];

    const res = await fetch('/orders/get_resum');
    lista = await res.json();
    console.log(lista);
    if (lista.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir los datos.');

    }
    let container = document.getElementById("accBody1");
    let i = 0, total = 0;
    container.innerHTML = '';
    lista.forEach((item) => {
        if (item.cat != '8' && item.cat != '7') {
            let renglones = '';
            item.detalle.forEach((det) => {
                if (det.saldo > 0) {
                    renglones += `<tr><td>${det.cliente}</td><td>${det.saldo}</td></tr>`;
                }
            })

            total += item.saldo;
            const div = document.createElement('div');
            div.setAttribute('class', 'accordion-item ');
            div.innerHTML = `
                <h2 class="accordion-header" id="flush-heading${i}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${i}" ><div class="flex-fill">${item._id}</div><div class="mx-5">${item.saldo}</div>
                
                </button>
              </h2>
              <div id="flush-collapse${i}" class="accordion-collapse collapse"  data-bs-parent="#accBody1">
            <div class="accordion-body">
                <table class="table table-striped">
                <tbody>
                
                    ${renglones}
                
                </tbody>
                </table>
            </div>
    </div>
                `
            i++;
            container.appendChild(div);
        }
    })
    document.getElementById('titulo1').innerHTML = `(${total}) Producto regular`;
    //------------fundaciones 
    container = document.getElementById("accBody2");
    total = 0;
    container.innerHTML = '';
    lista.forEach((item) => {
        if (item.cat == '7') {
            let renglones = '';
            item.detalle.forEach((det) => {
                if (det.saldo > 0) {
                    renglones += `<tr><td>${det.cliente}</td><td>${det.saldo}</td></tr>`;
                }
            })
            total += item.saldo;
            const div = document.createElement('div');
            div.setAttribute('class', 'accordion-item ');
            div.innerHTML = `
                <h2 class="accordion-header" id="flush-heading${i}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${i}" ><div class="flex-fill">${item._id}</div><div class="mx-5">${item.saldo}</div>
                </button>
              </h2>
              <div id="flush-collapse${i}" class="accordion-collapse collapse"  data-bs-parent="#accBody2">
            <div class="accordion-body">
                <table class="table table-striped">
                <tbody>
                ${renglones}
                </tbody>
                </table>
            </div>
        </div>
                `
            i++;
            container.appendChild(div);
        }
    })
    document.getElementById('titulo2').innerHTML = `(${total}) Producto fundaciones`;
    //------------especiales 
    container = document.getElementById("accBody3");
    total = 0;
    container.innerHTML = '';
    lista.forEach((item) => {
        if (item.cat == '8') {
            let renglones = '';
            item.detalle.forEach((det) => {
                if (det.saldo > 0) {
                    renglones += `<tr><td>${det.cliente}</td><td>${det.saldo}</td></tr>`;
                }
            })
            total += item.saldo;
            const div = document.createElement('div');
            div.setAttribute('class', 'accordion-item ');
            div.innerHTML = `
                <h2 class="accordion-header" id="flush-heading${i}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${i}" ><div class="flex-fill">${item._id}</div><div class="mx-5">${item.saldo}</div>
                </button>
              </h2>
              <div id="flush-collapse${i}" class="accordion-collapse collapse"  data-bs-parent="#accBody3">
            <div class="accordion-body">
                <table class="table table-striped">
                <tbody>
                ${renglones}
                </tbody>
                </table>
            </div>
        </div>
                `
            i++;
            container.appendChild(div);
        }
    })
    document.getElementById('titulo3').innerHTML = `(${total}) Productos especiales`;
}
//})

async function afterLoad(){

}

function renderTable() {
    console.log("renderTable");
}