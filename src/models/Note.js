const {Schema, model}= require('mongoose');
const NoteSchema = new Schema({
    title:{
        type: 'string',
        required: true
    },
    description:{
        type: 'string'
    },
    user:{
        type: 'string',
        required: true
    }

},{
    timestamps: true,
    versionKey: false 
})

module.exports = model('Note',NoteSchema);