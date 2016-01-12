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

function strExists(str) {
    return undefined !== str && null !== str && 0 < str.length;
}

function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

//coge num elementos aleatorios de un array source y los guarda en un array dest
function randomElems(num, source, dest) {
    var valor = randomIntInc(0, source.length - 1);
    
    for (var i = 0; i < num; i++) {
        dest.push(source[valor]._id);
    }
    
    source.splice(valor, 1);
}

function callbackGetNames(res, err, nombres){
    if (err) {
        log.debug("Error at getting all names: "+err);
    }
    else{
        var listaNombres = [];

        for (var i = 0; i < nombres.length; i++) {
            listaNombres.push({"name":nombres[i]});
        }
        res.json(listaNombres);
    }
}

//auxiliar function. Validates the fields of the leveledTags and inserts them into the array that will set the field leveledTags of the Interview
function tagsValidate(req, callback) {
	var conjunto =[LeveledTag.leveledTags];
	if (validator.notEmptyArray(req.body.leveledTags)) {
        var max;
        var min;
        var tag;
        
		for (var i = 0; i < req.body.leveledTags.length; i++) {
            tag=req.body.leveledTags[i].tag;
            max=req.body.leveledTags[i].max;
            min=req.body.leveledTags[i].min;
			
			if ( (typeof min) == "number" && (typeof max) == "number" && max>=min &&
                    validator.valueInRange(min, 1, 10) && validator.valueInRange(max, 1, 10) &&
                    strExists(tag) && validator.strValidator(tag, 50)) {
				conjunto[i]=(new LeveledTag({max: max, min: min, tag:tag}));           
			}else{
				var error=new Error();
                error.name="ValidationError";
                if ((typeof min)!="number" || (typeof max)!="number") {
                    error.message="The min and max values must be numbers"   
                }
                if (max<min) {
                    error.message = "The min value must be lower or equal to the max one";
                }
                if (validator.valueInRange(min, 1, 10) || validator.valueInRange(max, 1, 10)) {
                    error.message= "The min and max values must be in the interval [1,10]";
                }
                if (!strExists(tag)) {
                    error.message= "The field tag must not be empty";
                }
                if (!validator.strValidator(tag, 50)) {
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

//esto de momento no se usa
function buscarAlternativa(leveledTags) {
    var deferred = q.defer();
    var data = "";
    var numeroConsulta = 0;
    var preguntas = [];
    var numeroPreguntas = Math.floor(config.numeroPreguntas / leveledTags.length);
    var totalPreguntas = 0;
    var continuar = true;
    log.debug("AQUI ");
        
        
        for(var i = 0; i < leveledTags.length; i++) {
            log.debug("MAX " +  leveledTags[i].max + " MIN " +  leveledTags[i].min);
            daoQuestion.getQuestionsByLevelRange(leveledTags[i].tag,
                        leveledTags[i].min ,leveledTags[i].max ,function(err, result, tag){
                
                log.debug("Preguntas para TU " + tag + " " + result.slice(0,numeroPreguntas));
                numeroConsulta++;

                //si se devuelve alguna pregunta se añade
                if(result!==null && result.length!=0 && result!==undefined ){
                    totalPreguntas = totalPreguntas + result.length;
                    preguntas.push(result);
                }

                //si es el collback de la ultima consulta a la base de datos se devuelve la promesa con la entrevista con las preguntas rellenadas
                if (numeroConsulta == interview.leveledTags.length){
                    json={"preguntas": preguntas, "total": totalPreguntas};

                    if(totalPreguntas >= config.numeroPreguntas){
                        data="SI se han encontrado suficientes preguntas para la entrevista entre los niveles " + tag;
                    }
                    else{
                        data="NO se han encontrado suficientes preguntas para la entrevista entre los niveles " + tag;
                    }
                    
                    deferred.resolve(data);
                }
                
            });
        }

    return deferred.promise;
};

//busca todas las preguntas en la BD para los tags de la entrevista
function rellenarPreguntas(objeto) {
    var deferred = q.defer();
    var numeroConsulta = 0;
    var preguntas = [];
    var totalPreguntas = 0;
    var recuentoPreguntas = [];
    var tags = [];
    
    for (var i = 0; i < objeto.leveledTags.length; i++) {
        
        tags.push(objeto.leveledTags[i].tag);
        
        daoQuestion.getQuestionsByLevelRange([objeto.leveledTags[i].tag],
                    objeto.leveledTags[i].min, objeto.leveledTags[i].max, function(err, result, tag){
            
            numeroConsulta++;
            
            //si se devuelve alguna pregunta se añade al total
            if (result !== null && result.length != 0 && result !== undefined ) {
                totalPreguntas = totalPreguntas + result.length;
                preguntas.push(result);
            }
            
            recuentoPreguntas.push({"tag":tag, "count":result.length});
            
            //si es el collback de la ultima consulta a la base de datos se devuelve la promesa con la entrevista con las preguntas rellenas
            
            if (numeroConsulta == interview.leveledTags.length) {        
                json={"preguntas": preguntas, "total": totalPreguntas, "recuento":recuentoPreguntas};
                
                if (totalPreguntas < config.numeroPreguntas) {
                    err =new Error();
                    err.name="No se han encontrado suficientes preguntas para la entrevista ";
                    
                    for (var j = 0; j < recuentoPreguntas.length; j++) {
                        err.message = err.message + " Tag: " + recuentoPreguntas[j].tag + " preguntas: " 
                            + recuentoPreguntas[j].preguntas + ";";
                    };
                    
                    err.leveledTags=objeto.leveledTags;
                    deferred.reject(err);
                }
                
                log.debug("Antes " + preguntas.length);
                log.debug("YOYOYOYU " + tags);
                
                deferred.resolve(json);
                
            }
        });
    }
    
    return deferred.promise;
};

// POST api/interview

exports.postInterview = function(req, res){
	tagsValidate(req, function(err, tags){
        if (err) {
			res.status(400).send(err);
        }
        else{
            interview=new Interview({
                DNI:req.body.DNI,
                name: req.body.name,
                surname: req.body.surname,
                date: req.body.date,//"AAAA-MM-DDTHH:MM"
                status: "Pendiente",
                leveledTags: tags
            });
        }
    });    
   
    rellenarPreguntas(interview)
        .then(function(val) {
            var preguntasFinal = [];
            var contadorTags = [];
            var recuentoPreguntas = [];
            
            for(var i = 0; i < val.preguntas.length; i++) {
                contadorTags[i]=0;
            }
            
            log.debug(" PREGUNTAS " + val.preguntas + " TAGS " + val.preguntas.length + " TOTALPREGUNTAS " + val.total);
        
            log.debug( " UNO " + val.total + " DOS " +  config.numeroPreguntas + " : " + (config.numeroPreguntas < val.total) );
        
            //entra para coger preguntas de cada tema
            if ((config.numeroPreguntas <= val.total)) {
                var i = 0;
                while (i < config.numeroPreguntas) {
                    for (var j = 0; j < val.preguntas.length; j++) {
                        if ((val.preguntas[j].length > 0) && (preguntasFinal.length < config.numeroPreguntas)) {
                            i++;
                            contadorTags[j] ++;
                            randomElems(1, val.preguntas[j], preguntasFinal);
                        };
                    };
                };
            };
        
            //almacena cuantas preguntas de cada tema se han cogido
            for (var i = 0; i < contadorTags.length; i++) {
                recuentoPreguntas.push({tag : interview.leveledTags[i].tag, count : contadorTags[i]});
            }

            interview.nquestions=recuentoPreguntas;
            interview.questions=preguntasFinal; 
        
            daoInterview.postInterview(interview, function(err) {
                if (err){
                    switch(err.name){
                        case "ValidationError":{
                            var validationErrors=[];
                            
                            for (value in err.errors) {
                                validationErrors.push(err.errors[value].message);
                            }
                            
                            err=new Error();
                            err.name='ValidationError';
                            err.message=validationErrors;
                            res.status(400);
                            break;
                        }
                        case 'MongoError':{
                            
                            if (-1!==err.err.indexOf("duplicate key error")) {
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
        })
        .fail(function (err) {
            /*var continuar = true;
            
            log.debug("ENTRA " + err.leveledTags + " " + err);
            while(continuar){
                log.debug(" IN while");
                continuar = false;
                
                buscarAlternativa(err.leveledTags)
                    .then( function(data){
                        log.debug("SALE BIEN " + data);

                        err.data=data

                        log.debug("ERROR "+ err );
                        //res.send(err);
                    })
                    .fail( function(err){
                        log.debug("SALE MAL " + err);
                    });  
                    
                for(var i = 0; i < leveledTags.length; i++) {
                    if(err.leveledTags[i].min >2 && err.leveledTags[i].max < 10){
                        err.leveledTags[i].max ++;
                        err.leveledTags[i].min --;
                        continuar = true
                    }
                }
            }*/
            res.status(500).send(err);
        });
};

// GET api/interview/:DNI
// returns the interview (unique) for the candidate for the searched DNI
exports.getInterview = function(req, res){
    var fullName=req.params.fullName;
    var pattern = new RegExp("^([0-9,a-z]{6,30})$", "gi");
    
    //if(pattern.test(dni)){
        daoInterview.getInterview(fullName, function(err, result){
            if (err) {
                log.debug("Error at getting the interview which name is " + fullName + ": "+err);
                res.status(500).json({success:false,message: err.message});
            }
            else{
                if(null!=result && undefined!=result){
                    res.json(result);
                }
                else{
                    res.status(400).json({success:false, message: "No interview found with the name "+ fullName});
                }
            }
        });
    //}
    //else{
        //res.status(400).json({ message: 'ERROR: Invalid DNI format: '+dni});
    //}
};

exports.getInterviews = function(req, res) {
    var fecha = req.param("fecha");
    var nombre = req.query.nombre;
    
    if (fecha == null || fecha == undefined) {
        daoInterview.getInterviews(function(err, interviews){
            if(err){
                log.debug("Error at getting all interviews: "+err);
            }
            else{
                res.json(interviews);
            }
        });
    }else{
        var mes = parseInt(fecha.slice(5,7));
        var ano = parseInt(fecha.slice(0,4));
        var dia = parseInt(fecha.slice(8,10));
        
        var fechamin = new Date(ano,mes-1,dia).toISOString();
        var fechamax = new Date(ano,mes-1,dia+1).toISOString();
        
        //nombre == null || nombre == undefined || nombre === ""
        if (!strExists(nombre)) {
            daoInterview.getInterviewsByDate(fechamin, fechamax, function(err, interviews){
                if(err){
                    log.debug("Error at getting interviews: "+err);
                }
                else{
                    res.json(interviews);
                }
            });
        }else{
            daoInterview.getInterviewsByDateAndName(fechamin, fechamax, nombre, function(err, interviews){
                if(err){
                    log.debug("Error at getting interviews: "+err);
                }
                else{
                    res.json(interviews);
                }
            });
        }
    }
};

// DELETE  api/interview/:ID
exports.deleteInterview = function(req, res) {
    var id=req.params.interview_id;
    
	daoInterview.deleteInterview(id,function(err, result){
        if(err){
			log.debug("Error deleting the interview which DNI is " + id + ": " + err);
            res.status(400).send(err);
        }
        else{
            var response;
            
            if(0<result){
                response={success:true , message:"Interview with DNI " + id + " deleted"};
            }
            else{
                response={success:false , message:"No interview with DNI " + id + " found"};
                res.status(400);
            }
            
            res.json(response); 
        }
    });
};

exports.getInterviewQuestions = function(req, res) {
    var id = req.params.interview_id;
    var questions = [];
    var numConsulta = 0;
    
	daoInterview.getInterviewById(id,function(err, result){
        if(err){
			log.debug("Error at gettin the questions from the interview " + id + ": " + err);
            res.status(400).send(err);
        }
        else{
            
            for (var i = 0; i < result[0].questions.length; i++) {
                daoQuestion.getQuestion(result[0].questions[i], function (err, data){
                    numConsulta ++;
                    
                    if(err){
                        log.debug("Error at getting the question which ID is " + id + ": " + err);
                        res.status(500).send(err);
                    }
                    else{
                        questions=questions.concat(data);
                    }
                    
                    if ( numConsulta === result[0].questions.length ) {
                        res.json(questions);    
                    }   
                    
                });
            }

        }
    });
};
 
exports.getNames = function(req, res) {
    var fecha = req.param("fecha");
    
    if (fecha == null || fecha == undefined || fecha===""){
        daoInterview.getNames(res, callbackGetNames);
    }else{
        var mes = parseInt(fecha.slice(5,7));
        var ano = parseInt(fecha.slice(0,4));
        var dia = parseInt(fecha.slice(8,10));

        var fechamin = new Date(ano,mes-1,dia).toISOString();
        var fechamax = new Date(ano,mes-1,dia+1).toISOString();
        
        daoInterview.getNamesByDate(res, fechamin, fechamax, callbackGetNames);        
    }
};