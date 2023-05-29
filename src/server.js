const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const morgan = require('morgan');
//const methodOverride = require('method-override');
const flash = require('connect-flash');  
const session = require('express-session');
const passport = require('passport');
const MongoStore = require("connect-mongo");

   
const MONGODB_URI = process.env.MONGODB_URI;

//initializations
const app = express();
require('./config/passport');

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs.engine({
    defaultlayout: 'main',
    layoutsDir : path.join(app.get('views'), 'layouts'),
    partialsDir : path.join(app.get('views'), 'partials'),
    extname : '.hbs'
}));

app.set('view engine', '.hbs');
//middlewares

app.use(morgan('dev')); 
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const oneWeek = 7 * 24 * 60 * 60 * 1000; // 

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneWeek * 2},
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        autoReconnect: true,
        autoRemove : 'disabled'
        
    })

}));

app.use(passport.initialize());
app.use(passport.session());  
app.use(flash());



//gloval variables

app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    if(req.user){ 
        res.locals.nik = req.user.name;
        res.locals.admin= req.user.administrador;
        res.locals.disp= req.user.despachador;
        res.locals.owner = req.user.vendedor;
        res.locals.operario = req.user.operario;
    
    }
    next();

})

//routes 

app.use(require('./routes/api.routes'));

app.use(require('./routes/index.routes'));

//static files 
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', )

module.exports = app;