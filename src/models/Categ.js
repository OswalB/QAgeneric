const {Schema, model}= require('mongoose');
const CategSchema = new Schema({
    codigo:{
        type: 'string',
        required: true,
        alias: 'Codigo'
    },
    nombre:{
        type: 'string',
        required: true,
        alias: 'Nombre'
    }

},{
    versionKey: false 
})

module.exports = model('Categ',CategSchema);