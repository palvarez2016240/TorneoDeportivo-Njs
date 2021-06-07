const mongoose = require("mongoose")
const app = require("./app")

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/dbTorneoDeportivo', { useNewUrlParser: true , useUnifiedTopology: true }).then(()=>{
    console.log('Bienvenido!');

    app.listen(3000, function (){
        console.log("Torneo Deportivo corriendo");
    })
}).catch(err => console.log(err))