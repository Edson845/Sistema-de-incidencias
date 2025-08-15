const jwt = require ('jsonwebtoken');

function firmarToken(payload, expiresIn= '8h'){
    return jwt.sign(payload,process.env.JWT_SECRET,{expiresIn});
}

module.exports= {firmarToken};