var mongoose = require("mongoose")
var Schema = mongoose.Schema

mongoose.connect("mongodb://localhost/fotos")

/*
    String
    Number
    Date
    Buffer
    Boolean
    Mixed
    Objectid
    Array
*/

var posibles_valores = ['Masculino', 'Femenino']
var password_validation = { 
    validator: function (pass) {
        return this.password_confirmation == pass
   },
    message: 'Las contrasenas no son iguales - TIENE UN ERROR OJO'
} 

var user_schema = new Schema({
    name: String,
    username: { type: String, required: true, maxlength: [50, 'Username muy grande'] },
    password: { 
        type: String, 
        required: true,
        minlength:[8, 'El password es muy corto'],
        validate: password_validation
    },
    age: { type: Number, min: [5, 'La edad no puede ser menos que 5'], max: [100, 'La edad no puede ser mayor a 100']},
    // email: { type: String, required: true },
    email: { type: String, required: 'El correo es obligatorio' },
    date_of_bird: Date,
    // sex: { type: String, enum: posibles_valores }
    sex: { type: String, enum: { values: posibles_valores, message: 'opcion no valida' } }
})

user_schema.virtual('password_confirmation')
    .get(()=>{
        return this.pass_confirmation
    })
    .set((password)=>{
        this.pass_confirmation = password
    })

var User = mongoose.model('User', user_schema)

module.exports.User = User
