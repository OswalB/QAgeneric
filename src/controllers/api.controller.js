const apiCtrl = {};
const fx = {};
const Client = require('../models/Client');
const Consulta = require('../models/Consulta');
const Categ = require('../models/Categ');
const Editable = require('../models/Editable');
const Product = require('../models/Product');
const Errorl = require('../models/Errorl');
const Order = require('../models/OrderHead');
const passport = require('passport');
const User = require('../models/User');
const Insumo = require('../models/Insumo');
const Serial = require('../models/Serial');
const Formula = require('../models/Formula');
const Criterio = require('../models/Criterio');
const Inalmacen = require('../models/Inalmacen');
const Planilla = require('../models/Planilla');

apiCtrl.__test = (req, res) => {
    
    const panel = { "titulo":"TEST","boton-nuevo":true, "boton-pagination":true};
    res.render('test',{panel});
}

apiCtrl.actualizarEditor  = async(req, res) => {
  try {
    let data = req.body, nuevos = 0, cambios = 0, objNuevos  =[];
  const modelo = data[0].modelo;
  const schema = require(`../models/${modelo}`);
  delete data[0].modelo;
  let msg, response;
  
    for(let item of data) {
      
      if(item._id){
        response = await schema.updateOne({"_id": item._id},item,{"upsert": true});
      }else{
        const newSchema =  new schema(item);
        response = await schema.updateOne({"_id": newSchema._id},newSchema,{"upsert": true});
      }
      
      
      if(response.modifiedCount == 1 ) cambios +=1;  
      if(response.upsertedCount == 1 ) nuevos += 1;
    }
    //objNuevos.forEach( async item =>{
     // const newSchema =  new schema(item);
      
      //await newSchema.save();
    //})
    
    
    msg ={"fail":false,"message":`"Se agregaron ${nuevos} nuevos docuemetos y modificaron ${cambios} existentes"`};
    res.json(msg);

  }catch(e){
      fx.errorlog('actualizarEditor',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}


apiCtrl.actualizarEditorCOPY  = async(req, res) => {
  try {
    let data = req.body, nuevos = 0, cambios = 0, objNuevos  =[];
  const modelo = data[0].modelo;
  const schema = require(`../models/${modelo}`);
  delete data[0].modelo;
  let msg, response;
  
    for(let item of data) {
      
      response = await schema.updateOne({"_id": item._id},item,{"upsert": false});
      
      if(response.n < 1 ){
        objNuevos.push(item);
        nuevos += 1;

      }else{
        if(response.nModified == 1) cambios +=1;
      }
    }
    objNuevos.forEach( async item =>{
      const newSchema =  new schema(item);
      
      await newSchema.save();
    })
    
    
    msg ={"fail":false,"message":`"Se agregaron ${nuevos} nuevos docuemetos y modificaron ${cambios} existentes"`};
    res.json(msg);

  }catch(e){
      fx.errorlog('actualizarEditor',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.almacenSinfacturar  = async(req, res) => {
  try {
    const pipeline=[
      {
        '$match': {
          'facturada': false
        }
      }, {
        '$sort': {
          'createdAt': -1
        }
      }, {
        '$project': { 
          'createdAt': 1, 
          'insumo': 1, 
          'nombreProveedor': 1, 
          'operario': 1, 
          'cantidad': 1
        }
      }
    ];
    let aggRes = await Inalmacen.aggregate(pipeline);
      res.json(aggRes);


      
  }catch(e){
      fx.errorlog('almacenSinfacturar',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.baseFormula  = async(_id) => {
    try {
      const {ObjectId} = require('mongodb');
  let pipeBase = [
    {
      '$match': {
        '_id': new ObjectId(_id)
      }
    }, {
      '$unwind': {
        'path': '$detalle'
      }
    }, {
      '$match': {
        'detalle.siBase': true
      }
    }, {
      '$project': {
        '_id': 0, 
        'detalle.cantidad': 1, 
        'siFormulaOk': 1
      }
    }
  ]
  
  const aggres = await Formula.aggregate(pipeBase);
  
  resultado = 0;
  if(aggres.length == 1){
    resultado = aggres[0].detalle.cantidad;
    if(! aggres[0].siFormulaOk){
      await Formula.updateOne({"_id": ObjectId(_id)},{$set: {"siFormulaOk": true}});
    }
  }else{
    await Formula.updateOne({"_id": ObjectId(_id)},{$set: {"siFormulaOk": false}});
  }
  
  return resultado;  

    }catch(e){
        fx.errorlog('baseFormula',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        
        console.log(e);
    }
}

apiCtrl.changepass = (req, res) =>{
    try {
    const errors = [];
    const {password,confirm_password} = req.body;
    const _id = req.user._id
    
    if(password != confirm_password) {
        errors.push({text: 'Password no coincide.'});
        
    };
    if(password.length < 4) {
        errors.push({text: 'Password debe tener al menos 4 caracteres'});
    };
    if(errors.length > 0) {
        res.render('terceros/changepass',{errors});
    }else{
            fx.setNewPass(_id, password);
            req.flash('success_msg','Passwor cambiado exitosamente.');
            res.redirect('/api/intercambiador');
    }
    }catch(e){
        fx.errorlog('changepass',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.crearEditor  = async(req, res) => {
  try {
    let data = req.body;
  
  const {modelo, modelo2, _id} = req.body;
  const schema = require(`../models/${modelo}`);
  delete data._id;
  if(modelo2){
    data.modelo = modelo2;
  }else{
    delete data.modelo;
  }
  const newSchema = new schema(data);
    const resp = await newSchema.save();
    res.json(resp);
  }catch(e){
      fx.errorlog('crearEditor',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.creaIngreso  = async(req, res) => {
  try {
    data = req.body;
  delete data.insumo.diasVence;
  delete data.insumo.prefijoLote;
  
  let msg
      dataSave = new Inalmacen(data);
      
      await dataSave.save(dataSave);
      res.json({"message":"Ingresado a almacen"});
  }catch(e){
      fx.errorlog('creaIngreso',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.criteriosAll  = async(req, res) => {
  try {
    //const{filterTxt, saltar, limitar} = req.body;
  pipeline=[
    {
      '$sort': {
        'codigo': 1, 
        'nombre': 1
      }
    }
  ]
    const result = await Criterio.aggregate(pipeline);
    res.json(result);
  }catch(e){
      fx.errorlog('criteriosAll',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.deleteEditor  = async(req, res) => {
  try {
    
  let data = req.body;
  
  const {modelo, _id} = req.body;
  const schema = require(`../models/${modelo}`);
    const resp = await schema.deleteOne({ _id: _id });
    res.json(resp);

  }catch(e){
      fx.errorlog('deleteEditor',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.deleteFormula = async(req, res) => {
  console.log(req.body._id);
  try{
    await Formula.deleteOne( { "_id" : req.body._id } );
    res.json({'success': true});
  }catch(e){
    console.log(e);
    res.json({'success': false});
  }
  
  //const response = await Formula
}

apiCtrl.deleteItemFormula  = async(req, res) => {
  try {
    const {_id, idItem} = req.body;
    
    //res.json({"success":'deleted'});
    
    
    await Formula.updateOne({"_id": _id},
        {$pull: {
          detalle: {_id: idItem}
        }  
      });
      let baseF = await apiCtrl.baseFormula(_id);
      let response = await Formula.findOne({_id: _id});
    res.json(response);
  }catch(e){
      fx.errorlog('deleteItemFormula',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

  apiCtrl.deleteItemPlanilla  = async(req, res) => {
    try {
      const {_id, idItem} = req.body;
      
      await Planilla.updateOne({"_id": _id},
          {$pull: {
            detalle: {_id: idItem}
          }  
        });
       
        let response = await Planilla.findOne({_id: _id});
      res.json(response);
    }catch(e){
        fx.errorlog('deleteItemPlanilla',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
  }


apiCtrl.editEditor  = async(req, res) => {
  try {
    let data = req.body, msg, result = [];;
  const{modelo, _id} = req.body;
  if(!modelo){
    result.push({"fail" :true});
    res.json(result);
    return;
  }

  const schema = require(`../models/${modelo}`);
  delete data._id;
  delete data.modelo;
  
  await schema.updateOne(
      {
          "_id": _id
      },{
          $set: data
      }
      )
      msg={"fail":false,"message":"Documento guardado"}
      res.json(msg);
  }catch(e){
      fx.errorlog('editEditor',JSON.stringify(req.body), e, req.user);
      
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.editItemPlanilla  = async(req, res) => {
  let data = req.body, msg, result = [];;
  const{ _id, idItem, cantidad} = req.body;
  try {
    
  
  delete data._id;
  delete data.idItem;
  
  
  let response = await Planilla.updateOne(
      {
          "_id": _id
      },{
        $set:{ 'detalle.$[est].cantidad':cantidad
        }
      },
      {arrayFilters:[{"est._id":idItem}]}
      )

      msg={"fail":false,"message":"Documento guardado", 'cant':cantidad, 'resp':response}
      res.json(msg);
  }catch(e){
      fx.errorlog('editItemPlanilla',JSON.stringify(req.body), e, req.user);
      
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.dispatchQ = async(req, res) => {
    try {
        let pipeline =[
            {
              '$match': {
                'state': 0
              }
            }, {
              '$unwind': {
                'path': '$orderItem'
              }
            }, {
              '$addFields': {
                'serie': '$orderItem._id', 
                'despachado': '$orderItem.dispatch',
                'pedido': '$orderItem.qty'
              }
            }, {
              '$project': {
                'serie': 1, 
                'despachado': 1, 
                'pedido':1,
                '_id': 0
              }
            }
          ]
        let result = await Order.aggregate(pipeline);
        pipeline =[
            {
              '$match': {
                'state': 0
              }
            }, {
              '$project': {
                'totalReq': 1, 
                'TotalDisp': 1
              }
            }
          ]
        let rb = await Order.aggregate(pipeline);
        
        rb.forEach((item)=>{
            const obj = {"serie": item._id, "despachado": item.TotalDisp, "pedido": item.totalReq}
            
            result.push(obj);
        })
        
        res.json(result);  
    }catch(e){
        fx.errorlog('dispatchQ',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }    
}

apiCtrl.basesList  = async(req, res) => {
  try {
    let pipeline =[
      {
        '$match': {
          'siFormulaOk': true
        }
      }, {
        '$unwind': {
          'path': '$detalle'
        }
      }, {
        '$match': {
          'detalle.siBase': true
        }
      }, {
        '$project': {
          '_id': 0, 
          'proceso': '$nombre', 
          'codigoProceso': '$codigoProd', 
          'insumo': '$detalle.nombreInsumo', 
          'codigoInsumo': '$detalle.codigoInsumo', 
          'cantidad': '$detalle.cantidad', 
          'unidad': '$detalle.unidad'
        }
      }
    ]

    let response = await Formula.aggregate(pipeline);
      res.json(response);
      
  }catch(e){
      fx.errorlog('basesList',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.getContent = async(req, res) => {
    
    try{
    const {modelo, saltar, limitar, filterTxt,filterBy, sortBy, sortAsc, bandera, flanco, nofact} = req.body;
    //const schema = require('../models/Order');
    let result = [];
    if(!modelo){
      result.push({"countTotal" : 0});
      res.json(result);
      return;
    }
    let pipeline = [];
    if(bandera){
      if(flanco){
        pipeline.push({'$match': {[bandera]: true}})
      }else{
        pipeline.push({'$match': {[bandera]: false}})
      }
    }
    if(nofact){
        pipeline.push({'$match':{'state': 0}});
    }
    if(filterTxt != '' && filterBy != '') {
      pipeline.push({'$match': {[filterBy]: {'$regex': new RegExp(filterTxt, 'i')}}})
    }
    let orden = -1;
    if(sortBy != '') {
      if(sortAsc)orden = 1;
      pipeline.push({'$sort': {[sortBy]: orden}});
    }
    pipeline.push({'$skip': saltar});
    pipeline.push({'$limit': limitar});
    pipeline.push({'$project': {'__v': 0}});
   
    //console.log(pipeline)
    
      let aggRes = await eval(modelo).aggregate(pipeline);
      res.json(aggRes);
    }catch(e){
        fx.errorlog('getContent',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.getCount = async(req, res) => {
    try {
      let modelo = req.body.modelo;
      let result = [];
      if(!modelo){
        result.push({"countTotal" : 0});
        res.json(result);
        return;
      }
      
        const{administrador, despachador, vendedor, salesGroup, phone} = req.user;
        
        const {bandera, flanco, myClientes, nofact} = req.body;
        let filterTxt =req.body.filterTxt;
        let filterBy = req.body.filterBy;
        
        let pipeline=[];
        if(myClientes){
            if(!administrador || !despachador) {
                if(vendedor){
                    pipeline.push({'$match': {'$or': [{'nit': phone}, {'seller': salesGroup}]}});
                }else{
                    pipeline.push({'$match':{'nit': phone}});
                }
            }
        }
        if(nofact){
            pipeline.push({'$match':{'state': 0}});
        }
        if(bandera){
          if(flanco){
            pipeline.push({'$match': {[bandera]: true}})
          }else{
            pipeline.push({'$match': {[bandera]: false}})
          }
        }
        if(filterBy != ''){
          pipeline.push({'$match': {[filterBy]: {'$regex': new RegExp(filterTxt, 'i')}}})
        }
        pipeline.push({'$count': 'countTotal'})
          result = await eval(modelo).aggregate(pipeline);
          if(result.length < 1 ){
            result.push({"countTotal" : 0});
          }
          
          
          res.json(result);    
    }catch(e){
        fx.errorlog('getCount',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.getHistory  = async(req, res) => {
    try {
        const {ObjectId} = require('mongodb');
        const{idDocument, idItem} = req.body;
        
        const pipeline = 
          [
            {
              '$match': {
                '_id': new ObjectId(idDocument)
              }
            }, {
              '$unwind': {
                'path': '$orderItem'
              }
            }, {
              '$match': {
                'orderItem._id': new ObjectId(idItem)
              }
            }, {
              '$project': {
                '_id': 0, 
                'client': 1, 
                'orderItem.product': 1, 
                'orderItem.qty': 1, 
                'orderItem.dispatch': 1, 
                'orderItem.historyDisp': 1
              }
            }
          ]
          let aggRes = await Order.aggregate(pipeline);
    
    res.json(aggRes);

    }catch(e){
        fx.errorlog('getHistory',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.getKeys  = async(req, res) => {
  try {
    const {modelo} = req.body;
    let result = [];
    if(!modelo){
      result.push({"fail" :true});
      res.json(result);
      return;
    }
    const eschema = require(`../models/${modelo}`);
    let listk = new eschema;
    listk = listk.schema.obj;
    let listaCampos = []; 
    for(key in listk) {
      
      if(key != '_id' && key != '__v' && key != 'password' && key != 'updatedAt' && key != 'createdAt' && listk[key].type){
        let a = '';
        let tipo = listk[key].type;
        tipo = tipo.toLowerCase();
        if(listk[key].alias) a = listk[key].alias;
        const obj = {"campo":key, "alias": a, "tipo":tipo};
        listaCampos.push(obj);
      }
    } 
    
    res.json(listaCampos);

  }catch(e){
      fx.errorlog('getKeys',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.getPipeline  = async(req, res) => {
    try {
      
      
      const modelos = req.body.modelos;
      let fecha1 = req.body.fecha1,
      fecha2 = req.body.fecha2,
      sample=req.body.sample;
      console.log(modelos,fecha1,fecha2,sample);
      let result = [],pipeline, aggRes;
      
      if(modelos.includes('categ')){
        pipeline=[
          {
            '$match': {}
          },{
            '$project': {
                '__v': 0
              }
          }
        ];
        if(sample>0) pipeline.push({'$limit':sample})

        aggRes = await Categ.aggregate(pipeline);
        result.push({'categ':aggRes});
        
      }

      if(modelos.includes('client')){
        pipeline=[
          {
            '$match': {}
          },{
            '$project': {
                '__v': 0
              }
          }
        ];
        if(sample>0) pipeline.push({'$limit':sample})

        aggRes = await Client.aggregate(pipeline);
        result.push({'client':aggRes});
        
      }

      if(modelos.includes('criterio')){
        pipeline=[
          {
            '$match': {}
          }
        ];
        if(sample>0) pipeline.push({'$limit':sample})

        aggRes = await Criterio.aggregate(pipeline);
        result.push({'criterio':aggRes});
        
      }

      if(modelos.includes('formula')){
        pipeline=[
          {
            '$unwind': {
              'path': '$detalle'
            }
          }, {
            '$addFields': {
              'cantidad': '$detalle.cantidad', 
              'insumo': '$detalle.nombreInsumo', 
              'codigoInsumo': '$detalle.codigoInsumo', 
              'siBase': '$detalle.siBase'
            }
          }, {
            '$project': {
              'detalle': 0, 
              'createdAt': 0, 
              'updatedAt': 0
            }
          }
        ];
        if(sample>0) pipeline.push({'$limit':sample})

        aggRes = await Formula.aggregate(pipeline);
        result.push({'formula':aggRes});
        
      }

      if(modelos.includes('inalmacen')){
        pipeline=[
          {
            '$project': {
              '_id': 1,
              'lote':1
            }
          }
        ]
        if(sample>0) pipeline.push({'$limit':sample})
        aggRes = await Inalmacen.aggregate(pipeline);
        
       
        
        result.push({'inalmacen':aggRes});
        console.log(aggRes)
      }



      if(result.length==0){
        result.push({"fail" : true});
      }
      
      res.json(result);
    }catch(e){
        fx.errorlog('getPipeline',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
  }

apiCtrl.getPool  = async(req, res) => {
  try {
    const lote = req.body.lote;
    let pipeline = [
      {
        '$match': {
          'loteOut': lote
        }
      }, {
        '$project': {
          'lotesPool': 1
        }
      }
    ];
    let aggRes = await Planilla.aggregate(pipeline);
    res.json(aggRes);

  }catch(e){
    fx.errorlog('getPool',JSON.stringify(req.body), e, req.user);
    let result = [];
    result.push({"fail" : true});
    res.json(result);
    console.log(e);
}
}
  

apiCtrl.getLotes  = async(req, res) => {
  try {
const codigo = req.body.codigo
//console.log(req.body  )
  let pipeline=[
    {
      '$match': {
        '$and': [
          {
            'insumo.codigo': codigo
          }, {
            'agotado': false
          }
        ]
      }
    }, {
      '$sort': {
        'vence': 1
      }
    }, {
      '$project': {
        'lote': 1, 
        'vence': 1,
        'nombreProveedor': 1,
        'fechaw':1
      }
    },{
      '$addFields':{
        'compuesto': false,
        'copyPool' : []
      }
    }
  ];

  let aggRes = await Inalmacen.aggregate(pipeline);
  
  pipeline=[
    {
      '$match': {
        '$and': [
          {
            'formulaOk': true
          }, {
            'codigoProducto': codigo
          }, {
            'agotado': false
          }
        ]
      }
    }, {
      '$sort': {
        'vence': 1
      }
    }, {
      '$project': {
        'lote': '$loteOut', 
        'vence': 1, 
        'nombreProveedor': 'Prod. propio',
        'fechaw': '$fecha1',
        'copyPool' : '$lotesPool'
      }
    },{
      '$addFields':{
        'compuesto': true
      }
    }
  ]

  let aggRes2 = await Planilla.aggregate(pipeline);
  let resMerge = [...aggRes, ...aggRes2];

  res.json(resMerge);
      
  }catch(e){
      fx.errorlog('getLotes',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

  apiCtrl.getPool_borrar  = async(req, res) => {
    try {
  const codigo = req.body.loteOut
  console.log(req.body  )
    let pipeline=[
      {
        '$match': {
          'loteOut': codigo
        }
      }, {
        '$project': {
          'lotesPool': 1
        }
      }
    ]
    
    
  
    let aggRes2 = await Planilla.aggregate(pipeline);
      
    res.json(aggRes2);
        
    }catch(e){
        fx.errorlog('getPool',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
  }


apiCtrl.inc_serial  = async(req, res) => {
  let incremento = req.body.incremento,
      strSerie  = req.body.strSerie;
  
  let loteAlmacen, lotePlanilla, duplicados, lastId={}, sufijo ='-';
  if(strSerie==null)strSerie='';
  strSerie = strSerie.replace(/\s+/g, '');     //elimina todos los espacios
  strSerie = strSerie.toUpperCase();
  
    try {
      

      do{
        lastId = await Serial.findOne();
        if(!lastId ){
          let newSerial = await new Serial({'consecutivo':0});
          await newSerial.save();
          lastId = await Serial.findOne();
        }
        
        loteAlmacen= await Inalmacen.findOne({"lote":strSerie},{"_id":1});
        lotePlanilla= await Planilla.findOne({"loteOut":strSerie},{"_id":1});
        duplicados = loteAlmacen||lotePlanilla?true:false;
        if(strSerie.length<2) duplicados = true;
        if(strSerie.length<1) sufijo ='';
        
        if(duplicados){
          strSerie=`${lastId.consecutivo}${sufijo}${strSerie}`;
          let counter = lastId.consecutivo += incremento;
          await Serial.updateOne({"_id": lastId._id},{$set: {'consecutivo': counter}});
          duplicados = true;
        }  
      }while(duplicados);

        res.json({'fail':false, 'serial':strSerie});
    }catch(e){
        fx.errorlog('inc_serials',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
  }

apiCtrl.intercambiador = async (req, res) =>{
    
    try {
    const {administrador, cliente, password} = req.user;
    const obsoletePass =  await req.user.matchPassword('3210');
    if(obsoletePass){
        res.redirect('/terceros/changepass');
        return
    }
    if(administrador){
        res.redirect('/ventas/despachos');
        return
    }
    if(cliente){
        res.redirect('/ventas/pedidos');
        return
    }
    }catch(e){
        fx.errorlog('intercambiador',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    } 
}

apiCtrl.header_planilla  = async(req, res) => {
  try {

    let data = req.body;
    const id = data.id;
    delete data.id;
    
    await Planilla.updateOne(
      {
          "_id": id
      },{
          $set: data
      }
      )

      const respuesta = await Planilla.findOne({"_id": id})

      res.json(respuesta);
      
  }catch(e){
      fx.errorlog('header_planilla',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.insumosList  = async(req, res) => {
  try {
    let pipeline = [
      {
        '$sort': {
          'categoria':1,
          'nombre': 1
        }
      }, {
        '$project': {
          '_id': 0, 
          'categoria': 0, 
          'createdAt': 0, 
          'updatedAt': 0
          
        }
      }
    ];
    let msg;
      let lista = await Insumo.aggregate(pipeline);
      msg ="Lista de insumos OK";
      lista[0].message = msg;
    pipeline=[
      {
        '$addFields': {
          'codigo': '$codigoProd', 
          'unidad': 'gramos'
        }
      }, {
        '$project': {
          'codigo': 1, 
          'nombre': 1, 
          'unidad': 1, 
          '_id': 0
        }
      }
    ];
    let masas = await Formula.aggregate(pipeline);
    
    masas.forEach(masa =>{
      lista.push(masa)
    })


      res.json(lista);

  }catch(e){
      fx.errorlog('insumosList',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.insumo_planilla  = async(req, res) => {
  try {
    
    const{idDocument, idItem, idLote, loteIn, vence, compuesto} = req.body;
    console.log(idDocument, idItem);
    await Planilla.updateOne(
      {"_id":idDocument},
        {$set:{ 'detalle.$[est].idLote':idLote,
        'detalle.$[est].loteIn':loteIn,
        'detalle.$[est].vence':vence,
        'detalle.$[est].compuesto':compuesto
              }
        },
        {arrayFilters:[{"est._id":idItem}]}
    )
    msg={"fail":false,"message":"Documento guardado"}
      res.json(msg);
      
  }catch(e){
      fx.errorlog('insumo_planilla',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.lastPedido  = async(req, res) => {
    try {
        const {inicial, actualizada} = req.body
        
        let pipeline =[
            {
              '$match': {
                'state': 0
              }
            }, {
              '$group': {
                '_id': '$state', 
                'ultimo': {
                  '$max': '$createdAt'
                }
              }
            }
          ]
        let result = await Order.aggregate(pipeline);  
        //let response =[];
        //response.push({"ultimo":result[0].ultimo});
        let nuevo = new Date(actualizada);
        
        if(result[0].ultimo > nuevo){
            
            pipeline =[
                {
                '$match': {
                    'state': 0
                }
                }, {
                '$match': {
                    'state': 0, 
                    'createdAt': {
                    '$gt': new Date(inicial)
                    }
                }
                }, {
                '$sort': {
                    'createdAt': -1
                }
                }, {
                '$project': {
                    'createdAt': 1
                }
                }
            ]
            result = await Order.aggregate(pipeline);
            //response.push(result);
        }else{
            result=[];
        }
          
          res.json(result);  

    }catch(e){
        fx.errorlog('lastPedido',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.listCollections  = async(req, res) => {
  try {
    const pipeline =[
      {
        '$sort': {
          'titulo': 1
        }
      }, {
        '$project': {
          'titulo': 1, 
          'modelo': 1, 
          '_id': 0
        }
      }
    ];
    const aggRes = await Editable.aggregate(pipeline);
    res.json(aggRes);    
  }catch(e){
      fx.errorlog('listCollections',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }


apiCtrl.logout = (req, res)=>{
    //req.logout();
    try{
    req.logout(function(err) {
        if (err) { return ; }
    res.redirect('/');
    });
    req.flash('success_msg','Ha cerrado su sesión.');
    res.redirect('/terceros/signin')
    }catch(e){
        fx.errorlog('logout',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.mis_clientes = async(req, res) => {
    
    try {
    const{name, administrador, despachador, cliente, vendedor, salesGroup, phone} = req.user;
    let pipeline = [];
    pipeline.push({'$match': {'siClient': true}});
    if(!administrador || !despachador) {
        if(vendedor){
            pipeline.push({'$match': {'$or': [{'idClient': phone}, {'idSeller': salesGroup}]}});
        }else{
            pipeline.push({'$match':{'idClient': phone}});
        }
    }    
    pipeline.push({'$sort': {'nombre': 1}});
    pipeline.push({'$project': {'nombre': 1,'idClient': 1,'_id':0}});

    
    
        let result = await Client.aggregate(pipeline);
        if(result.length < 1 ){
          result.push({"nombre" : name, "idClient" : phone});
        }
        res.json(result);
      }catch(e){
        
        fx.errorlog('mis_clientes',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
      }
    
}

apiCtrl.my_orders = async(req, res) => {
    try {
        const{administrador, despachador, vendedor, salesGroup, phone} = req.user;
        const {bandera, flanco, myClientes, limitar, saltar} = req.body;
        let filterTxt =req.body.filterTxt;
        let filterBy = req.body.filterBy;
        
        let pipeline = [];
        //pipeline.push({'$match': {'siClient': true}});
        if(!administrador || !despachador) {
            if(vendedor){
                pipeline.push({'$match': {'$or': [{'nit': phone}, {'seller': salesGroup}]}});
            }else{
                pipeline.push({'$match':{'nit': phone}});
            }
        }
        if(filterBy != ''){
            pipeline.push({'$match': {[filterBy]: {'$regex': new RegExp(filterTxt, 'i')}}})
        }    
        pipeline.push({'$sort': {'state':1,'createdAt': -1}});
        pipeline.push({'$skip': saltar});
        pipeline.push({'$limit': limitar});
        
        pipeline.push({'$project': {'state': 1,'totalReq': 1,'TotalDisp': 1,'delivery': 1,'client':1}});
    
        
        let result = await Order.aggregate(pipeline);
        
        res.json(result);    
    

    }catch(e){
        fx.errorlog('my_orders',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.operarios  = async(req, res) => {
  try {
    const pipeline =[
      {
        '$match': {
          'operario': true
        }
      }, {
        '$project': {
          '_id': 0, 
          'name': 1, 
          'pin': 1
        }
      }
    ];
    
    const result = await User.aggregate(pipeline);
    res.json(result);  
  }catch(e){
      fx.errorlog('operarios',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.pedido_save = async(req, res) => {
try {
    let data = req.body;
    let newPedido = new Order(data);
    const purchaser  = await Client.findOne({"idClient":data.nit});
    newPedido.seller = purchaser.idSeller;
    newPedido.sellerName = req.user.name;
    newPedido.save();
    
    res.json({"fail" : false, "msg": 'Pedido enviado exitosamente'});

}catch(e){
        fx.errorlog('pedido_save',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
}
}

apiCtrl.planilla_save  = async(req, res) => {
  try {
    let data = req.body;
    let newPlanilla = new Planilla(data);
    let response = await newPlanilla.save();
    res.json({'fail':false});
      
  }catch(e){
      fx.errorlog('planilla_save',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.procesosList  = async(req, res) => {
  try {
    let pipeline =[
      {
        '$match': {
          'siFormulaOk': true
        }
      },{
        '$sort': {
          'categoria': 1, 
          'nombre': 1
        }
      }, {
        '$unwind': {
          'path': '$detalle'
        }
      }, {
        '$match': {
          'detalle.siBase': true
        }
      }, {
        '$project': {
          '_id': 0, 
          'proceso': '$nombre', 
          'codigoProceso': '$codigoProd', 
          'insumo': '$detalle.nombreInsumo', 
          'codigoInsumo': '$detalle.codigoInsumo', 
          'cantidad': '$detalle.cantidad', 
          'unidad': '$detalle.unidad',
          'categoria':1,
          'diasVence':1
        }
      }
    ];
    
    let lista = await Formula.aggregate(pipeline);
    
    let msg;
    msg ="Lista OK";
    lista[0].message = msg;
    res.json(lista);

  }catch(e){
      fx.errorlog('procesosList',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.production_table  = async(req, res) => {
  try {
    const{administrador, despachador, vendedor, salesGroup, phone} = req.user;
        const {bandera, flanco, myClientes, limitar, saltar, sortBy, sortAsc} = req.body;
        let filterTxt =req.body.filterTxt;
        let filterBy = req.body.filterBy;
        
        let pipeline = [];
        if(filterBy != ''){
          pipeline.push({'$match': {[filterBy]: {'$regex': new RegExp(filterTxt, 'i')}}})
        }   
      let ordenAsc = sortAsc?1:-1;   
      pipeline.push({'$sort': {[sortBy]: ordenAsc}});
      pipeline.push({'$skip': saltar});
      pipeline.push({'$limit': limitar});
      //pipeline.push({'$project': {'state': 1,'totalReq': 1,'TotalDisp': 1,'delivery': 1,'client':1}});
  
      
      let result = await Planilla.aggregate(pipeline);
      
      res.json(result);
      
  }catch(e){
      fx.errorlog('production_table',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.proveedoresList  = async(req, res) => {
  try {
    pipeline =[{
      '$match': {
        'siProvider': true
      }
    }, {
      '$sort': {
        'nombre': 1
      }
    }, {
      '$project': {
        'nombre': 1, 
        'idClient': 1,
        '_id': 0
      }
    }];
      const aggRes = await Client.aggregate(pipeline);
      res.json(aggRes);
      msg ={"fail":false,"message":"success!"};
  }catch(e){
      fx.errorlog('proveedoresList',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.qtyHistory = async(req, res) => {
    
    try {
    let data = req.body;
    const {ObjectId} = require('mongodb');
    const fecha = new Date;
    let dispatchBy = '--';
    if(req.user) dispatchBy = req.user.alias;
    const idDocument = data.idOrder;
    const idItem = data.idItem;
    const qtyHistory = data.value;
    //graba el item de despacho 
    await Order.updateMany(
        {'_id': idDocument},
          {$push:{  'orderItem.$[est].historyDisp':{
            fechaHistory  :fecha,  
            qtyHistory    : qtyHistory,
            dspHistory    : dispatchBy             
            }}
        },
        {arrayFilters:[{"est._id" : idItem}]}
      )
      //consultar el tatal de la historyDisp para el item
      const pipeline = [
        {
          '$match': {
            '_id': new ObjectId(idDocument)
          }
        }, {
          '$unwind': {
            'path': '$orderItem'
          }
        }, {
          '$match': {
            'orderItem._id': new ObjectId(idItem)
          }
        }, {
          '$unwind': {
            'path': '$orderItem.historyDisp'
          }
        }, {
          '$group': {
            '_id': null, 
            'totalDisp': {
              '$sum': '$orderItem.historyDisp.qtyHistory'
            }
          }
        }
      ]
      let aggSubTotal = await Order.aggregate(pipeline);
      //previene error Cannot set properties of undefined
      if(Object.keys(aggSubTotal).length > 0){
        aggSubTotal = aggSubTotal[0].totalDisp;
      }else{
        aggSubTotal = 0;
      }
      //Actaliza la cantidad EN EL ITEM despachad0
      await Order.updateOne(
          {"_id":idDocument},
            {$set:{ 'orderItem.$[est].dispatch':aggSubTotal
                  }
            },
            {arrayFilters:[{"est._id":idItem}]}
        )
      //consultar el tatal de los items   
      const pipeTotal =
      [
        {
          '$match': {
            '_id': new ObjectId(idDocument)
          }
        }, {
          '$unwind': {
            'path': '$orderItem'
          }
        }, {
          '$group': {
            '_id': null, 
            'totalDisp': {
              '$sum': '$orderItem.dispatch'
            }
          }
        }
      ]
      let aggTotal = await Order.aggregate(pipeTotal);
      if(Object.keys(aggTotal).length > 0){
        aggTotal = aggTotal[0].totalDisp;
      }else{
        aggTotal = 0;
      }
      //Actaliza la cantidad EN EL total despachad0
      await Order.updateOne(
        {"_id":idDocument},
          {$set:{ 'TotalDisp':aggTotal
                }
          }
      )
      
      res.json({"fail" : false});
              
    }catch(e){
        fx.errorlog('qtyHistory',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.resumenProduccion  = async(req, res) => {
  try {
      let pipeline=[
          {
            '$match': {
              'state': 0
            }
          }, {
            '$unwind': {
              'path': '$orderItem'
            }
          }, {
            '$group': {
              '_id': '$orderItem.product', 
              'code': {
                '$first': '$orderItem.code'
              }, 
              'saldo': {
                '$sum': {
                  '$subtract': [
                    '$orderItem.qty', '$orderItem.dispatch'
                  ]
                }
              }, 
              'detalle': {
                '$push': {
                  'cliente': '$client', 
                  'saldo': {
                    '$subtract': [
                      '$orderItem.qty', '$orderItem.dispatch'
                    ]
                  }
                }
              }
            }
          }, {
            '$sort': {
              '_id': 1
            }
          }
        ]
        let result = await Order.aggregate(pipeline);
        pipeline =[
          {
            '$sort': {
              'nombre': 1
            }
          }, {
            '$project': {
              '_id': 0, 
              'codigo': 1, 
              'categoria': 1
            }
          }
        ]
        const cats = await Product.aggregate(pipeline);
        result.forEach((item)=>{
          const respuesta = cats.find(({ codigo }) => codigo === item.code);
          if(respuesta){
              item.cat = respuesta.categoria;
          }    
      
      })
      res.json(result);

  }catch(e){
      fx.errorlog('resumenProduccion',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.signup = async (req,res) =>{
    
    try{
    const errors = [];
    const {name, phone, password,confirm_password} = req.body;
    if(password != confirm_password) {
        errors.push({text: 'Password no coincide.'});
        
    };
    if(password.length < 4) {
        errors.push({text: 'Password debe tener al menos 4 caracteres'});
    };
    if(errors.length > 0) {
        res.render('terceros/signup',{
            errors,
            name,
            phone
        })
    }else{
        const phoneUser = await User.findOne({phone: phone});
        if(phoneUser){
            req.flash('error_msg','El numero de identificación ya esta registrado.');
            res.redirect('/terceros/signup');
        }else{
            // ----------------------SAVE
            const newUser = new User({name, phone, password});
            newUser.password = await newUser.encryptPassword(password);
            let aliasb = fx.txtAlias(name);
            while (await User.findOne({alias:aliasb})) {
                aliasb = fx.txtAlias2(aliasb); 
            }
            
            
            newUser.alias=aliasb;
            newUser.cliente=true;
            newUser.vendedor=false;
            newUser.despachador=false;
            newUser.administrador=false;
            await newUser.save();
            req.flash('success_msg','Cuenta creada exitosamente.');
            res.redirect('/terceros/signin');
            
        }
    }
    }catch(e){
        fx.errorlog('signup',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}

apiCtrl.render_almacen  = async(req, res) => {
  const panel = {"boton-nuevo":true,
                "titulo":"Ingreso de insumos",
                "boton-pagination":true,  
                "boton-guardar":true,
                "boton-herramientas":true
              };
    res.render('produccion/almacen',{panel});  
}

apiCtrl.render_changepass = async(req, res) => {
    const panel = {"boton-ingresar":true};
    res.render('terceros/changepass',{panel});
}

apiCtrl.render_produccion = async(req, res) => {
    const panel = {"titulo":"Productos pendientes", "boton-pagination":true};
    res.render('produccion/pendientes',{panel});
}

apiCtrl.render_despachos = async(req, res) => {
    const panel = {"boton-facturados":true, "boton-pagination":true,"titulo":"Despachador"};
    res.render('ventas/despachos',{panel});
}

apiCtrl.render_editor = async(req, res) => {
  const panel = {"boton-opciones":true,"boton-pagination":true,"titulo":"Editor de documentos"};
  res.render('api/editor',{panel});
}

apiCtrl.render_formulas  = async(req, res) => {
  try {
    const panel = {"boton-borrar":true, "boton-editar":true,"boton-nuevo":true, "boton-pagination":true,"titulo":"Formulas"};
    res.render('produccion/formula',{panel});
  }catch(e){
      fx.errorlog('render_formulas',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

apiCtrl.render_index = async(req, res) => {
    const panel = {"boton-ingresar":true};
    res.render('index',{panel});
}

apiCtrl.render_pedidos = async(req, res) => {
    const panel = {"usuario": req.user, "titulo":"Pedidos", "boton-nuevo":true, 'boton-vista':true, "boton-pagination":true};
    res.render('ventas/pedidos',{panel});
}

apiCtrl.render_planillas = async(req, res) => {
  const panel = {"usuario": req.user, "titulo":"Planilla de produccion", "boton-nuevo":true, "boton-pagination":true};
  res.render('produccion/planilla',{panel});
}

apiCtrl.render_reports  = async(req, res) => {
  const panel = {"titulo":"Generar Informes",
                "boton-pagination":true,  
                "boton-guardar":true,
                "boton-opciones":true
              };
    res.render('api/report',{panel});  
}

apiCtrl.render_signin = async(req, res) => {
    const panel = {"boton-ingresar":true};
    res.render('terceros/signin',{panel});
}

apiCtrl.render_signup = async(req, res) => {
    const panel = {"boton-ingresar":true};
    res.render('terceros/signup',{panel});
}

apiCtrl.setItemFormula  = async(req, res) => {
  try {
    const {nombre, codigo,  cantidad, unidad, siBase, _id} = req.body;
     
    const {ObjectId} = require('mongodb');
    let valCant = parseFloat(cantidad);
    
      await Formula.updateMany({_id: _id},{
          $push:{
              'detalle':{
                  nombreInsumo:nombre,
                  codigoInsumo:codigo,
                  cantidad:valCant,
                  siBase:siBase,
                  unidad:unidad
              }
          }
      });
    let baseF = await apiCtrl.baseFormula(_id);
    
    let response = await Formula.findOne({_id: _id});
    res.json(response);
  }catch(e){
      fx.errorlog('setItemFormula',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
  }

  apiCtrl.setItemPlanila  = async(req, res) => {
    try {
      const {nombreInsumo, codigoInsumo,  cantidad, unidad, _id} = req.body;
       
      let valCant = parseFloat(cantidad);
      
        await Planilla.updateMany({_id: _id},{
            $push:{
                'detalle':{
                    nombreInsumo:nombreInsumo,
                    codigoInsumo:codigoInsumo,
                    cantidad:valCant,
                    unidad:unidad
                }
            }
        });
      
      let response = await Planilla.findOne({_id: _id});
      res.json(response);
    }catch(e){
        fx.errorlog('setItemPlanila',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
    }  

apiCtrl.setState = async(req, res) => {
    try {
        data = req.body;
        await Order.findByIdAndUpdate(data.idOrder, {"state": data.state});
        res.json({"fail":false});
    }catch(e){
        fx.errorlog('setState',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}


apiCtrl.signin = passport.authenticate('local',{
        failureRedirect:'/terceros/signin',
        successRedirect:'/api/intercambiador',
        failureFlash: true,
        
})

apiCtrl.unPedido = async(req, res) => {
    try {
        let pedido = await Order.find({_id:req.params.id});
        res.json(pedido);
    }catch(e){
        fx.errorlog('unPedido',JSON.stringify(req.body), e, req.user);
        let result = [];
        result.push({"fail" : true});
        res.json(result);
        console.log(e);
    }
}
  
apiCtrl.una_formula = async(req, res) => {
  
  try {
    let pipeline =[
      {
        '$match': {
          'codigoProd': req.body.codigo
        }
      }, {
        '$unwind': {
          'path': '$detalle'
        }
      }, {
        '$addFields': {
          'newCantidad': {
            '$round': [
              {
                  '$multiply': [
                      '$detalle.cantidad', req.body.porcentaje
                  ]
              }, 2
          ]
          }
        }
      }, {
        '$project': {
          '_id': 0, 
          'newCantidad': 1, 
          'detalle.unidad': 1, 
          'siFormulaOk': 1, 
          'diasVence':1,
          'detalle.siBase': 1, 
          'detalle.codigoInsumo': 1, 
          'detalle.nombreInsumo': 1
        }
      }
    ]
    
    const aggres = await Formula.aggregate(pipeline);
    
    for (i in aggres){
      pipeline =[
        {
          '$match': {
            '$and': [
              {
                'agotado': false
              }, {
                'insumo.codigo': aggres[i].detalle.codigoInsumo
              }
            ]
          }
        }, {
          '$limit':2
        }, {
          '$project': {
            'lote': 1, 
            'vence': 1
          }
        }
      ];
      const aggLotes = await Inalmacen.aggregate(pipeline);
      if(aggLotes.length == 1){
        aggres[i].detalle.loteIn = aggLotes[0].lote;
        aggres[i].detalle.vence = aggLotes[0].vence;
        aggres[i].detalle.compuesto = false;
        aggres[i].copyPool = [];
      }


      pipeline=[
        {
          '$match': {
            'agotado': false, 
            'formulaOk': true, 
            'codigoProducto': aggres[i].detalle.codigoInsumo
          }
        }, {
          '$limit': 2
        }, {
          '$project': {
            '_id': 0, 
            'lote': '$loteOut', 
            'vence': 1,
            'lotesPool':1
          }
        }
      ]
      const aggLotesPI = await Planilla.aggregate(pipeline);
      if(aggLotesPI.length == 1){
        aggres[i].detalle.loteIn = aggLotesPI[0].lote;
        aggres[i].detalle.vence = aggLotesPI[0].vence;
        aggres[i].detalle.compuesto = true;
        aggres[i].copyPool = aggLotesPI[0].lotesPool ;
      }




    }

    
  
    if(aggres.length > 0){
      if(aggres[0].siFormulaOk){
        res.json(aggres);
      }else{
        res.json({"fail":true})
      }
    }else{
      res.json({"fail":true})
    }
    
    
  }catch(e){
      fx.errorlog('una_formula',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}

apiCtrl.reset_pass = (req, res) =>{
  
  const {_id} = req.body;
  console.log(_id)
  fx.setNewPass(_id, '3210');
          req.flash('success_msg','Password reseteado exitosamente.');
          res.redirect('/api/intercambiador');
  
}

apiCtrl.reset_passadmin = (req, res) =>{
  try {
    const {_id} = req.body;
    console.log(_id)
  fx.setNewPass(_id, '3210');  
  res.json("Nuevo password : 3210");
}catch(e){
      fx.errorlog('reset_passadmin',JSON.stringify(req.body), e, req.user);
      let result = [];
      result.push({"fail" : true});
      res.json(result);
      console.log(e);
  }
}


fx.setNewPass = async(iduser, newPass) =>{
  const {ObjectId} = require('mongodb');
    if(iduser){
        iduser= new ObjectId(iduser);
        usuario = await User.findOne({_id : iduser});
    const password = await usuario.encryptPassword(newPass);
    await User.updateOne({_id : iduser},{password : password});
    }
    
}

fx.txtAlias = (name) => {
    let temp ="";
    name = name.toLowerCase();
    temp = name.charAt(0);
    for(let i=1; i<name.length; i++){
        let caracter = name.charAt(i);
        let vocal = true;
        vocal = (caracter == 'a') || (caracter == 'e') || (caracter == 'i') || (caracter == 'o') || (caracter == 'u')  || (caracter == ' ');
        if(!vocal){
            temp += caracter ;
        }    
    }
    temp = temp.substring(0,3);
    return temp;
}

fx.txtAlias2 = (name1) =>{
    let result1= Math.random().toString(36).substring(4,5);  
    result1 = name1.substring(0,2) + result1;
    return result1;
}

fx.errorlog = async(modulo, body, errorTxt, objuser ) =>{
    let fechaHora = new Date();
    fechaHora = fechaHora.toLocaleDateString('es-us',{weekday: 'short',day:'2-digit',month:'short',hour:'2-digit', minute:'2-digit'});
    let user = 'no logged';
    if(objuser)user = objuser.name
    

    const newErrorlog = new Errorl({modulo, body, fechaHora, errorTxt, user });
    await newErrorlog.save();
    
    console.log(newErrorlog);
}


module.exports = apiCtrl ;

