const {Schema, model} = require('mongoose');
const ConsultaSchema = new Schema({
    
    nombre:{
        type: 'string',
        required: true,
        alias: 'Titulo consulta'
    },
    str_pipeline:{
        type: 'string',
        required: true,
        alias: 'Pipeline'
    },
    inputs:[
        {
            varName:{ 
                type: 'String',
                required: true,
                alias: 'nombre Campo'
            },
            inputType:{ 
                type: 'String',
                required: true,
                alias: 'Tipo Campo'
            }
        }
    ]
    
},{
    timestamps: true,
    versionKey: false 
});

module.exports = model('Consulta', ConsultaSchema);