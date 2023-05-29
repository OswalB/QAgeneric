const mongoose = require('mongoose');

let MONGODB_URI = process.env.MONGODB_URI;
if(process.env.NODE_ENV == 'development'){
    MONGODB_URI=process.env.MONGODB_LOCAL
    //console.log(MONGODB_URI)
}

mongoose.connect(MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
    .then(db => console.log('database is connected..'))
    .catch(err => console.log(err))