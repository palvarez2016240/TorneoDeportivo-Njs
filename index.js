const mongoose = require("mongoose");
const app = require("./app");

var Admin = require("./src/controladores/usuario.controlador")
mongoose.Promise = global.Promise;
mongoose.connect('mongodb+srv://admin:admin@dbtorneodeportivo.ors0h.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology:true}).then(()=>{

    console.log('Se encuentra conectado a la base de datos');
    
    Admin.ADMIN();
    
    app.listen(process.env.PORT || 3000,function(){
        console.log('El servidor esta funcionando en el puerto 3000')
    })    

}).catch(err => console.log(err));
