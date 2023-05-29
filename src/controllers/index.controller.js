const indexCtrl = {};

const Note = require('../models/Note');



indexCtrl.renderNotes = async (req, res) => {
    
    const panel = {"titulo":"Notas",
                "boton-nuevo":true  
                
              };
    const notes = await Note.find({}).lean().sort({createdAt:'desc'});
    res.render('notes/all-notes', {notes,panel});    
};

indexCtrl.renderNoteForm = (req, res) => {
    
    res.render('notes/new-note')
    //console.log('usuario??: ' + req.user.vendedor);
};

indexCtrl.createNewNote = async (req, res) => {
    
    const {title, description} = req.body;
    const newNote = new Note({title, description});
    newNote.user = req.user.id ;
    await newNote.save();
    
    req.flash('success_msg','Note Added Successfully');
    res.redirect('/notes');
};

indexCtrl.deletenote = async(req, res) =>{
    console.log('prueba ruta dell',req.body)
    
    await Note.findByIdAndDelete(req.body._id);
}

indexCtrl.renderEditForm = async (req, res) => {
    const note = await Note.findById(req.params.id).lean();
    if(note.user != req.user.id){
        req.flash('error_msg','NOT authorized');
        return res.redirect('/notes');
    }
    
    res.render('notes/edit-note', {note});
};

indexCtrl.updateNote = async (req, res) =>{
    console.log('updateNote??', req.params.id)
    const {title, description} = req.body;
    await Note.findByIdAndUpdate(req.params.id, {title, description})
    req.flash('success_msg','Note Updated Successfully');
    res.redirect('/notes');
};




module.exports = indexCtrl  ;