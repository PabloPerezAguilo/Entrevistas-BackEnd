// Load required packages
var Interview = require('../models/interviewModel');
var LeveledTag = require('../models/leveledTagsModel');
var log4js = require('log4js');
var log = log4js.getLogger("interviewCtrl");
var validator = require('../utils/validator');
var daoInterview = require("../DAO/daoInterview");
var daoQuestion = require("../DAO/daoQuestion");
var config = require('../../app/config/config');
var q = require('q');

function strExists(str){
    return undefined!==str && null!==str && 0<str.length;
}

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

//coge n elementos aleatorios de un array source y los guarda en un array dest
function randomElems (num, source, dest){
    var valor = randomIntInc(0,source.length-1);
    for(var i = 0; i < num; i++) {
        dest.push(source[valor]);
    }
    source.splice(valor, 1);
}

function tagsValidate (req, callback){
	var conjunto =[LeveledTag.leveledTags];
	if(validator.notEmptyArray(req.body.leveledTags)){
        var max;
        var min;
        var tag;
		for(var i = 0; i < req.body.leveledTags.length; i++) {
            tag=req.body.leveledTags[i].tag;
            max=req.body.leveledTags[i].max;
            min=req.body.leveledTags[i].min;
			
			if((typeof min)=="number" && (typeof max)=="number" && max>=min &&
                    validator.valueInRange(min, 1, 10) && validator.valueInRange(max, 1, 10) &&
                    strExists(tag) && validator.strValidator(tag, 50)){
				conjunto[i]=(new LeveledTag({max: max, min: min, tag:tag}));           
			}else{
				var error=new Error();
                error.name="ValidationError";
                if((typeof min)!="number" || (typeof max)!="number"){
                    error.message="The min and max values must be numbers"   
                }
                if(max<min){
                    error.message = "The min value must be lower or equal to the max one";
                }
                if(validator.valueInRange(min, 1, 10) || validator.valueInRange(max, 1, 10)){
                    error.message= "The min and max values must be in the interval [1,10]";
                }
                if(!strExists(tag)){
                    error.message= "The field tag must not be empty";
                }
                if(!validator.strValidator(tag, 50)){
                    error.message="Thge tag is longer than it should"
                }
				
				callback(error);
			}
		}
	}else{
		conjunto=undefined;
	}
	callback(error,conjunto);
};

function buscarAlternativa (leveledTags, data){
    
    var numeroConsulta = 0;
    var preguntas = [];
    var numeroPreguntas = Math.floor(config.numeropreguntas / leveledTags.length);
    var totalPreguntas = 0;
    var continuar = true;
    log.debug("AQUI ");
    
    while(continuar){
        log.debug(" IN while");
        continuar = false;
        
        
        for(var i = 0; i < leveledTags.length; i++) {
            log.debug("MAX " +  leveledTags[i].max + " MIN " +  leveledTags[i].min);
            daoQuestion.getQuestionsByLevelRange(leveledTags[i].tag,
                        leveledTags[i].min ,leveledTags[i].max ,function(err, result, tag){

                numeroConsulta++;

                log.debug("Preguntas para " + tag + " " + result.slice(0,numeroPreguntas));

                //si se devuelve alguna pregunta se añade
                if(result!==null && result.length!=0 && result!==undefined ){
                    totalPreguntas = totalPreguntas + result.length;
                    preguntas.push(result);
                    //objeto.questions = objeto.questions.concat(result.slice(0,numeroPreguntas));
                }

                //si es el collback de la ultima consulta a la base de datos se devuelve la promesa con la entrevista con las preguntas rellenadas
                if (numeroConsulta == interview.leveledTags.length){

                    json={"preguntas": preguntas, "total": totalPreguntas};

                    if(totalPreguntas >= config.numeropreguntas){
                        data="SI se han encontrado suficientes preguntas para la entrevista entre los niveles " + tag;
                    }
                    else{
                        data="NO se han encontrado suficientes preguntas para la entrevista entre los niveles " + tag;
                    }
                }

            });
        }
        
        for(var i = 0; i < leveledTags.length; i++) {
            if(leveledTags[i].min >1 && leveledTags[i].max < 10){
                leveledTags[i].max ++;
                leveledTags[i].min --;
                continuar = true
            }
        }
    }
};

function rellenarPreguntas (objeto){
    var deferred = q.defer();
    var numeroConsulta = 0;
    var preguntas = [];
    //var numeroPreguntas = Math.floor(config.numeropreguntas / objeto.leveledTags.length);
    var totalPreguntas = 0;
    var recuentoPreguntas = [];
    
    for(var i = 0; i < objeto.leveledTags.length; i++) {
        daoQuestion.getQuestionsByLevelRange(objeto.leveledTags[i].tag,
                    objeto.leveledTags[i].min, objeto.leveledTags[i].max, function(err, result, tag){
            
            numeroConsulta++;
            
            //si se devuelve alguna pregunta se añade
            if(result!==null && result.length!=0 && result!==undefined ){
                totalPreguntas = totalPreguntas + result.length;
                preguntas.push(result);
                recuentoPreguntas.push({"tag":tag, "preguntas":result.length});
            }
            
            //si es el collback de la ultima consulta a la base de datos se devuelve la promesa con la entrevista con las preguntas rellenadas
            if (numeroConsulta == interview.leveledTags.length){
                
                json={"preguntas": preguntas, "total": totalPreguntas};
                
                if(totalPreguntas < config.numeropreguntas){
                    err =new Error();
                    err.name="No se han encontrado suficientes preguntas para la entrevista ";
                    for(var j = 0; j < recuentoPreguntas.length; j++){
                        err.message = err.message + " Tag: " + recuentoPreguntas[j].tag + " prguntas " 
                            + recuentoPreguntas[j].preguntas;
                    };
                    err.leveledTags=objeto.leveledTags;
                    
                    deferred.reject(err);
                }
                
                deferred.resolve(json);
                //log.debug("QUESTIONS " + objeto.questions + "LONGITUD " + objeto.questions.length);
                //log.debug("PREGUNTAS " + preguntas + "LONGITUD " + preguntas.length);
                //log.debug("SE HAN ENCONTRADO PREGUNTAS DE " + preguntas.length + " TEMAS ");
            }
        });
    } 
    return deferred.promise;
};

// POST api/interview
//auxiliar function. Validates the fields of the leveledTags and inserts them into the array that will set the field leveledTags of the Interview
exports.postInterview = function(req, res){
	tagsValidate(req, function(err, tags){
        if(err){
            log.debug(err);
			res.status(400).send(err);
        }
        else{
            var fecha = new Date().toISOString().replace(/\..+/, '');
            log.debug("FECHA " + fecha);
            
            interview=new Interview({
                DNI:req.body.DNI,
                name: req.body.name,
                surname: req.body.surname,
                date: req.body.date,//"2020-12-20T22:22",//fecha,
                status: "PENDING",
                leveledTags: tags
            });
        }
    });
    
    
    //busca las preguntas en la BD para los tags de la entrevista
    rellenarPreguntas(interview)
        .then(function(val) {
        
            //var numeroPreguntas = Math.floor(config.numeropreguntas / interview.leveledTags.length);
            //var resultado = [];
            //var contador = 0;
            var preguntasFinal = [];
            var contadorTags = [];
            
            for(var i = 0; i < val.preguntas.length; i++) {
                contadorTags[i]=0;
            }
            
            log.debug(" PREGUNTAS " + val.preguntas + " TAGS " + val.preguntas.length + " TOTALPREGUNTAS " + val.total);
        
            log.debug( " UNO " + val.total + " DOS " +  config.numeropreguntas + " : " + (config.numeropreguntas < val.total) );
        
            if ((config.numeropreguntas <= val.total) ){
                
                log.debug(" ENTRA para coger " + config.numeropreguntas  + " PREGUNTAS " );
                //for(var i = 0; i < numeroPreguntas; i++){
                
                var i = 0;
                while (i < config.numeropreguntas) {
                    //contador ++;
                    for(var j = 0; j < val.preguntas.length; j++){
                        if( (val.preguntas[j].length > 0) && (preguntasFinal.length < config.numeropreguntas) ){
                            i++;
                            contadorTags[j] ++;
                            randomElems (1, val.preguntas[j], preguntasFinal)
                        };
                    };
                };
            };
        
            log.debug(" TOTAL PREGUNTAS " + preguntasFinal + " LONGITUS " + preguntasFinal.length);
            interview.questions=preguntasFinal;   
        
            var recuentoPreguntas = {};
        
            for(var i = 0; i < contadorTags.length; i++) {
                log.debug( contadorTags[i] + " ELEMENTOS DE " + interview.leveledTags[i].tag);
                recuentoPreguntas[interview.leveledTags[i].tag] = contadorTags[i];
            }
            
            /*for(var i = 0; i < val.length; i++) {
                randomElems(numeroPreguntas, val[i], resultado, err);
                log.debug(" ");
                log.debug("RANDOM " + numeroPreguntas + " -DE- " + val[i] + " -TOTAL- " + resultado);
                log.debug(" ");
            }

            log.debug("RESULTADO " + resultado + " LONGITUD " + resultado.length);
            interview.questions=resultado;
            log.debug("ESTO " + interview.questions[1]);*/
        
            daoInterview.postInterview(interview,function(err) {
                if (err){
                    switch(err.name){
                        case "ValidationError":{
                            var validationErrors=[];
                            for(value in err.errors){
                                validationErrors.push(err.errors[value].message);
                            }
                            err=new Error();
                            err.name='ValidationError';
                            err.message=validationErrors;
                            res.status(400);
                            break;
                        }
                        case 'MongoError':{
                            if(-1!==err.err.indexOf("duplicate key error")){
                                err =new Error();
                                err.name="MongoError";
                                err.message="The interview " + interview.DNI + " already exists";
                            }
                            res.status(400);
                            break;
                        }
                        default:{
                            res.status(500);
                            break;
                        }
                    }
                    res.send(err);
                }
                else{
                    res.json({ message: 'New interview created!', data: interview, recuento: recuentoPreguntas}); 
                }
            });
        
            //devolver el numero de preguntas para cada tag
            //res.json({ message: 'New interview created!', data: interview }); 
         
        })
        .fail(function (err) {
            var data = "";
            var max = 2;
            
            log.debug("ENTRA " + err.leveledTags + " " + data);
            buscarAlternativa(err.leveledTags, data);
            log.debug("SALE " + data);
            /*while(min>0 && max<11){
                buscarAlternativa(max,min, errBuscar);
                if(errBuscar){
                    err=errBuscar
                    break;
                }
                max++;
            }*/
            err.data=data
            
            log.debug("ERROR "+ err );
            res.status(405).send(err);
        });
};

// GET api/interview/:DNI
// returns the interview (unique) for the candidate for the searched DNI
exports.getInterview = function(req, res){
    var dni=req.params.DNI;
    var pattern = new RegExp("^([0-9,a-z]{6,30})$", "gi");
    
    if(pattern.test(dni)){
        daoInterview.getInterview(dni, function(err, result){
            if(err){
                log.debug("Error at getting the interview which DNI is " + dni + ": "+err);
                res.status(500).json({success:false,message: err.message});
            }
            else{
                if(null!=result && undefined!=result){
                    res.json(result);
                }
                else{
                    res.status(400).json({success:false, message: "No interview found with the DNI "+dni});
                }
            }
        });
    }
    else{
        res.status(400).json({ message: 'ERROR: Invalid DNI format: '+dni});
    }
};

exports.getInterviews = function(req, res) {
    daoInterview.getInterviews(function(err, interviews){
        if(err){
            log.debug("Error at getting all interviews: "+err);
        }
        else{
            res.json(interviews);
        }
    });
};

// DELETE  api/interview/:DNI
exports.deleteInterview = function(req, res) {
    var id=req.params.DNI;
    
	daoInterview.deleteInterview(id,function(err, result){
        if(err){
			log.debug("Error deleting the interview which DNI is " + dni + ": " + err);
            res.status(400).send(err);
        }
        else{
            var response;
            if(0<result){
                response={success:true , message:"Interview with DNI " + id +" deleted"};
                
            }
            else{
                response={success:false , message:"No interview with DNI " + id +" found"};
                res.status(400);
            }
            res.json(response); 
        }
    });
};

exports.getNames = function(req, res) {
    daoInterview.getNames(function(err, nombres){
        if(err){
            log.debug("Error at getting all names: "+err);
        }
        else{
            res.json(nombres);
        }
    });
};