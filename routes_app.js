var express = require('express')
var Imagen = require('./models/imagenes')
var router = express.Router()
var formidable = require('formidable')
var fs = require('fs') 
// REDIS **
var redis   = require("redis");
var client  = redis.createClient(7001);

var image_finder_middleware = require('./middlewares/find_image')

router.get('/', (req, res)=>{
    Imagen.find({}).populate('creator').exec((err, imagenes)=>{
        if(err) console.log(err);
        res.render('app/home', { imagenes: imagenes })
    })
})

// REST

router.get('/imagenes/new', (req, res)=>{
    res.render('app/imagenes/new')
})

// MIDDLEWARE **
router.all('/imagenes/:id', image_finder_middleware)
router.all('/imagenes/edit/:id', image_finder_middleware)

router.get('/imagenes/edit/:id', (req, res)=>{
    // Sin middleware **
    // Imagen.findById(req.params.id, (err, img)=>{
    //     res.render('app/imagenes/edit', {imagen: img})
    // })

    // Con el middleware image_finder_middleware ya que definiendo la variable en el locals, ya la misma se encuentra disponible en las vistas **
    res.render('app/imagenes/edit')
})

router.route('/imagenes/:id')
    .get((req, res)=>{
        // Sin middleware **
        // Imagen.findById(req.params.id, (err, img)=>{
        //     res.render('app/imagenes/show', {imagen: img})
        // })

        // A MODO DE PRUEBA, ESTA LINEA ***
        // client.publish('images', res.locals.imagen.toString())

        // Con el middleware image_finder_middleware ya que definiendo la variable en el locals, ya la misma se encuentra disponible en las vistas **
        res.render('app/imagenes/show')
    })
    .put((req, res)=>{
        // Sin middleware **
        // Imagen.findById(req.params.id, (err, img)=>{
        //     img.title = req.body.title
        //     img.save((err)=>{
        //         if(!err){
        //             res.render('app/imagenes/show', {imagen: img}) 
        //         }
        //         else{
        //             res.redirect('/app/imagenes/edit/'+img._id);
        //         }
        //     })
        // })

        // Con middleware **
        res.locals.imagen.title = req.body.title
        res.locals.imagen.save((err)=>{
            if(!err){
                res.render('app/imagenes/show') 
            }
            else{
                res.redirect('/app/imagenes/edit/'+req.params.id);
            }
        })
    })
    .delete((req, res)=>{
        Imagen.findOneAndRemove({ _id:req.params.id }, (err)=>{
            if(!err){
                res.redirect('/app/imagenes')
            }   
            else{
                console.log(err)
                res.redirect('/app/imagenes/'+req.params.id)
            }
        })
    });


router.route('/imagenes')
    .get((req, res)=>{
        // Imagen.find({ creator: res.locals.user._id }, (err, imagenes)=>{
        Imagen.find({}, (err, imagenes)=>{
            if(err){
                res.redirect('/app');
                return;
            }

            res.render('app/imagenes/index', {imagenes: imagenes})
        })
    })
    .post((req, res)=>{

        // console.log(`ID DEL USUARIO: ${res.locals.user._id}`);

        var form = new formidable.IncomingForm()

        form.parse(req)

        let fields = {}
        let path = ''
        let extension = ''

        form.on('fileBegin', (name, file)=>{
            file.path = __dirname + '/uploads/' + file.name
            
            extension = file.name.split('.').pop()
            path = file.path
        })

        form.on('file', (name, file)=>{
            console.log('Uploaded file '+ file.name)
        })

        form.on('field', function (name, field) {
            console.log('Got a field:', field);
            console.log('Got a field name:', name);
            
            fields[name] = field
        })

        form.on('end', function() {
        
            let data = {
                title: fields.title,
                creator: res.locals.user._id,
                extension: extension
            }

            var imagen = new Imagen(data)
    
            imagen.save((err)=>{
                if(!err){

                    var imgJSON = {
                        "id": imagen._id,
                        "title": imagen.titulo,
                        "extension": imagen.extension
                    }

                    client.publish('images', JSON.stringify(imgJSON))
                    fs.rename(path, 'public/imagenes/'+imagen._id+'.'+extension)
                    res.redirect('/app/imagenes/'+ imagen._id)
                }
                else{
                    console.log(err)
                    res.render('app/imagenes/new')
                }
            })
        });

    })
    

module.exports = router