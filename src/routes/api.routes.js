const {Router} = require('express');
const router = Router();
const {
    __test,
    actualizarEditor,
    almacenSinfacturar,
    changepass,
    crearEditor,
    creaIngreso,
    criteriosAll,
    deleteEditor,
    deleteFormula,
    deleteItemPlanilla,
    deleteItemFormula,
    dispatchQ,
    editEditor,
    editItemPlanilla,
    getContent,
    getCount,
    getHistory,
    getKeys,
    getLotes,
    getPool,
    getPipeline,
    header_planilla,
    inc_serial,
    insumo_planilla,
    intercambiador,
    insumosList,
    logout,
    lastPedido,
    listCollections,
    mis_clientes,
    my_orders,
    operarios,
    pedido_save,
    planilla_save,
    procesosList,
    production_table,
    proveedoresList,
    qtyHistory,
    setState,
    signup,
    signin,
    render_almacen,
    render_changepass,
    render_despachos,
    render_editor,
    render_formulas,
    render_pedidos,
    render_planillas,
    render_index,
    render_produccion,
    render_reports,
    render_signin,
    render_signup,
    reset_pass,
    reset_passadmin,
    resumenProduccion,
    setItemFormula,
    setItemPlanila,
    unPedido ,
    una_formula
} = require('../controllers/api.controller');


const {isAuthenticated, isAdmin} = require('../helpers/auth');

router.delete('/control/del_formula', deleteFormula);
router.delete('/control/del-item-formula', deleteItemFormula);
router.delete('/control/del-item-planilla', deleteItemPlanilla);
router.delete('/editor/delete', deleteEditor);

router.get('/__',__test);
router.get('/',render_index);
router.get('/api/editor', isAuthenticated, render_editor);
router.get('/api/intercambiador', intercambiador);
router.get('/api/operarios', operarios);
router.get('/api/reports', isAuthenticated, render_reports);
//router.get('/control/bases_list', basesList);
router.get('/control/insumos_list', insumosList);
router.get('/control/proveedores-list', proveedoresList);

router.get('/despachos/disp', dispatchQ);
router.get('/editor/list_collections',isAdmin, listCollections);
router.get('/orders/get_resum', resumenProduccion);
router.get('/orders/resum', render_produccion);
router.get('/produccion/almacen', render_almacen);
router.get('/produccion/formulas', render_formulas);

router.get('/produccion/planillas', render_planillas);
router.get('/produccion/procesos_list', procesosList);
router.get('/terceros/changepass', render_changepass);
router.get('/terceros/logout', logout);
router.get('/terceros/signin', render_signin);
router.get('/terceros/signup', render_signup);
router.get('/ventas/despachos', render_despachos);
router.get('/ventas/pedidos', isAuthenticated, render_pedidos);
router.get('/ventas/pedido/:id', unPedido);

router.post('/api/gen_count', getCount);
router.post('/api/gen_pipe', getPipeline);
router.post('/control/almacen-sinfacturar', almacenSinfacturar);
router.post('/control/criterios-all', criteriosAll)
router.post('/control/set-item-formula', setItemFormula);
router.post('/editor/content', getContent);
router.post('/editor/crear', crearEditor);
router.post('/editor/edit', editEditor);
router.post('/editor/keys', getKeys);
router.post('/orders/getHistory', getHistory);
router.post('/produccion/incs', inc_serial);
router.post('/produccion/edit-item-planilla',editItemPlanilla);
router.post('/produccion/ordenes',production_table)

router.post('/produccion/pool',getPool)
router.post('/produccion/lotes', getLotes);

router.post('/produccion/set-item-formula',setItemPlanila)
router.post('/produccion/una_formula',una_formula)
router.post('/terceros/changepass', changepass);

router.post('/terceros/mis_clientes', mis_clientes);
router.post('/terceros/reset_pass', reset_pass);
router.post('/terceros/reset_passadmin', reset_passadmin);
router.post('/terceros/signin', signin);
router.post('/terceros/signup', signup);
router.post('/ventas/last_pedido', lastPedido);
router.post('/ventas/my_orders', my_orders);

router.put('/control/ingreso-almacen', creaIngreso);
router.put('/dispatch/qtyHistory', qtyHistory);
router.put('/dispatch/state', setState);
router.put('/editor/update', actualizarEditor);
router.put('/produccion/header', header_planilla);
router.put('/produccion/insumo_planilla', insumo_planilla);
router.put('/produccion/planilla', planilla_save);
router.put('/ventas/pedidos', pedido_save);

module.exports = router;



