const {Schema, model} = require('mongoose');
const PlanillaSchema = new Schema({
    agotado:{
        type: 'Boolean',
        alias: 'Lote agotado',
        default: false
    },
    formulaOk:{
        type: 'Boolean',
        alias: 'Form. O.k',
        default: false
    },
    esPlanilla:{
        type: 'Boolean',
        alias: 'Planilla',
        default: true
    },
    vence:{
        type: 'Date',
        required: true,
        alias: 'Vence'
    },
    fecha1:{
        type: 'Date',
        required: true,
        alias:'Fecha proceso'
    },
    t1:{type:'String',
        alias:'Hora inicio'},
    t2:{type:'String',
        alias:'Hora final'},
    time:{
        type: 'Number',
        alias:'Tiempo'
        
    },
    loteOut:{
        type: 'String',
        required: true,
        unique: true,
        alias:'Lote'
    },
    operario:{
        type: 'String',
        required: true,
        alias:'Operario'
    },
    producto:{
        type: 'String',
        required: true,
        alias:'Producto'

    },
    codigoProducto: {
        type: 'String', 
        required: true,
        alias:'Codigo'
    },   
    brix:{
        type: 'Number', 
        default: 0,
        alias:'°Brix'
    },
    cantProd:{
        type: 'Number',
        default: 0,
        alias:'Producido'
    }, 
    lotesPool:[],
    detalle:[{
        cantidad:{
            type: 'Number',
            default: 0,
            required: true
        },codigoInsumo:{
            type: 'String',
            required: true
        },
        nombreInsumo:{
            type: 'String',
            required: true
        },
        unidad:{
            type: 'String'
        },
        loteIn:{
            type: 'String'
        },
        compuesto:{
            type: 'Boolean',
            default: false
        },
        vence:{
            type:'Date'
        }
    }]
},{
    timestamps: true,
    versionKey: false 
});

module.exports = model('Planilla', PlanillaSchema);