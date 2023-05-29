const {Router} = require('express');
const router = Router();

const { 
    createNewNote,
    
    renderEditForm,
    renderIndex,
    renderNotes, 
    renderNoteForm, 
    updateNote,
    deletenote
    
} = require('../controllers/index.controller');
const {isAuthenticated, isAdmin} = require('../helpers/auth');

router.get('/notes', isAuthenticated, renderNotes);
router.get('/notes/add', isAuthenticated ,renderNoteForm);
router.post('/notes/new-note', isAuthenticated, createNewNote);
router.post('/notes/delete', isAuthenticated, deletenote);
router.get('/notes/edit/:id', isAuthenticated, renderEditForm)
router.post('/notes/edit/:id', isAuthenticated, updateNote);

module.exports = router;