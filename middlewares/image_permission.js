module.exports = (img, req, res) => {

    if(req.method === 'GET' && req.path.indexOf('edit') < 0){
        return true;
    }

    if(typeof img.creator == 'undefined') return false;

    if(img.creator._id.toString() == res.locals.user._id){
        return true;
    }

    return false
}