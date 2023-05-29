const {Schema, model}= require('mongoose');

const OrderHeadSchema = new Schema({
    
    seller:{
        type: 'string',
        requiered: true
    },
    sellerName:{
        type: 'string',
        requiered: false
    },
    client:{
        type: 'string',
        requiered: true
    },
    nit:{
        type: 'string',
        requiered: true
    },
    delivery:{
        type: 'date',
        requiered: true
    },
    notes:{
        type: 'string'
    },
    state:{
        type: 'number',
        default:0
    },
    id_compras:{
        type: 'string'
    },
    totalReq:{
        type: 'number',
        default:0
    },
    TotalDisp:{
        type: 'number',
        default:0
    },
    orderItem:[{
        code: {
            type: 'string',
            requiered: true
        },
        product: {
            type: 'string',
            requiered: true
        },
        qty: {
            type: 'number',
            requiered: true
        },
        dispatch: {
            type: 'number',
            requiered: true
        },
        dispatchBy: {
            type: 'string',
            requiered: false
        },
        dispatchDate:{
            type: 'date'
        },
        historyDisp:[{
            fechaHistory:{
                type: 'date',
                requiered: true
            },
            dspHistory:{
                type: 'string'
            },
            qtyHistory: {
                type: 'number',
                requiered: true
            }
        }]
    }]
},{
    timestamps: true,
    versionKey: false 
});


module.exports = model('OrderHead',OrderHeadSchema);