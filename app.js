var express = require("express");
var bodyParser = require("body-parser")

//SOCKET IO
var http = require('http')
var realtime = require('./realtime')

// session - Con la variable de sesion cuando reiniciamos el server, se pierde esta variable por lo cual hay que loguearse nuevamente **
// var session = require('express-session')
// session - Usando cookies, el id de la sesion queda almacenada del lado del cliente **

// COOKIE-SESSION **
// var cookieSession = require('cookie-session')

var User = require('./models/user').User

var app = express()

// REDIS **
// Para usar Redis, es necesario usar express-session por lo cual procedo a comentar cookie-session 
/// duplico variable session para no perderme luego
var redis   = require("redis");
var client  = redis.createClient(7001);
var session = require('express-session')
var RedisStore = require('connect-redis')(session)
var sessionMiddleware = session({
    store: new RedisStore({ host: 'localhost', port: 7001, client: client }),
    secret: 'super ultra secret word'
})

// SOCKET IO
var server = http.Server(app)
realtime(server, sessionMiddleware)

var router_app = require('./routes_app')
var session_middleware = require('./middlewares/session')

// method-override es un middleware **
var methodOverride = require('method-override')
app.use(methodOverride('_method'))

// var mongoose = require("mongoose")

// MONGO DB **
// mongoose.connect("mongodb://localhost/fotos")

// var userSchemaJSON = {
//     email:String,
//     password:String
// }

// var user_schema = new mongoose.Schema(userSchemaJSON)
// var User = mongoose.model("User", user_schema)
// MONGO DB **

// REDIS **
app.use(sessionMiddleware)

app.use("/public", express.static(__dirname + '/public'));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// session - comento para usa cookies
// app.use(session({
//     secret: 'secret123456789',
//     resave: false,
//     saveUninitialized: false
// }))

// session - usando cookies - comento para usar redis
// app.use(cookieSession({
//     name: 'session',
//     keys: ['llave-1', 'llave-2']
// }))

app.set("view engine", "jade")

app.get("/", (req, res) =>{
    console.log(req.session.user_id)
    res.render("index")
})

app.post("/", (req, res)=>{
    res.render("form")
})

app.get("/signup", (req, res)=>{
    User.find((err, docs)=>{
        console.log(docs)
        res.render("form")
    })
})

app.post("/users", (req, res)=>{

    var user = new User({
        email: req.body.email, 
        password: req.body.password, 
        password_confirmation: req.body.password_confirmation,
        username: req.body.username
    })

    console.log(user.password_confirmation)

    // user.save((err, user)=>{
    //     if(err){
    //         console.log(String(err))
    //     }
    //     res.send(user)
    // })

    // PROMISES - En vez de recibir un callback, retorna una promesa.
    user.save().then((us)=>{
        res.send('Guardamos el usuario exitosamente' + us)
    }, 
    (err)=>{
        if(err){
            console.log(String(err))
            res.send('No pudimos guardar la informacion')            
        }
    })

})

app.get("/login", (req, res) =>{
    res.render("login")
})

app.post("/sessions", (req, res)=>{

    // User.find({ email: req.body.email, password: req.body.password }, "username email", (err, docs)=>{
    //     console.log(docs)
    //     res.send("Hola Mundo")
    // })

    User.findOne({ email: req.body.email, password: req.body.password }, "username email password", (err, docs)=>{
        console.log(docs)
        req.session.user_id = docs._id
        // res.send("Hola Mundo")
        res.redirect('/app')
    })

})

app.use('/app', session_middleware)
app.use('/app', router_app)

// app.listen(8080)

// SOCKET IO
server.listen(8080)
