var log4js = require('log4js');
var log = log4js.getLogger("validator");

exports.strValidator=function(str, maxlength){
    var result=false;
    try{
        result=maxlength>=str.length;
    }
    catch(error){
        result=false;
    }
    return result;
}

exports.notEmptyArray= function(array){
    return null!==array && undefined!==array && 0<array.length;
}

exports.valueInRange= function(value, min, max){
    return value>=min && value<=max;
}