var Imagen = require('../models/imagenes')
var ownerCheck = require('./image_permission')

module.exports = (req, res, next) =>{
    // Imagen.findById(req.params.id, (err, img) => {
    //     if(img != null){
            
    //         console.log(`ENCONTRE LA IMAGEN ${img.title} Y SU CREADOR ES ${img.creator}`)

    //         res.locals.imagen = img
    //         next()
    //     }
    //     else{
    //         res.redirect('/app')
    //     }
    // })

    Imagen.findById(req.params.id).populate('creator').exec(
        (err, img) => {
            if(img != null && ownerCheck(img, req, res)){
                
                console.log(`ENCONTRE LA IMAGEN ${img.title} Y SU CREADOR ES ${img.creator}`)

                res.locals.imagen = img
                next()
            }
            else{
                res.redirect('/app')
            }
         })
}