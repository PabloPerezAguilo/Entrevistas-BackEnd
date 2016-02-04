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
var math = require('mathjs');
var ldapAuth = require('ldapauth-fork');

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

//elimina de la estructura1 los elementos que ya existan en la estructura2
function buscarElementosRepetidos (estructura1, estructura2){
    var estructuraFinal=[];
    estructuraFinal = estructura1.slice();
    
    for (var i = 0; i < estructura1.length; i++){
        for (var j = 0; j < estructura2.length; j++){  
            for (var k = 0; k < estructura2[j].length; k++){
                if (estructura1[i]._id.toString() == estructura2[j][k]._id.toString()){
                    estructuraFinal.splice(i,1);
                };
            };
        };
    };
    
    return estructuraFinal
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

function callbackGetInterviews(res, err, interviews){
    if(err){
        log.debug("Error at getting all interviews: "+err);
    }
    else{
        interviews.total= math.ceil( interviews.total / config.paginacion);
        res.json(interviews);
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
}


//busca todas las preguntas en la BD para los tags de la entrevista
function rellenarPreguntas(objeto) {
    var deferred = q.defer();
    var numeroConsulta = 0;
    var preguntas = [];
    var totalPreguntas = 0;
    var recuentoPreguntas = [];
    var tags = [];
    var resultSinRepetidos =[];
    
    for (var i = 0; i < objeto.leveledTags.length; i++) {
        
        tags.push(objeto.leveledTags[i].tag);
        
        daoQuestion.getQuestionsByLevelRange(objeto.leveledTags[i].tag,
                    objeto.leveledTags[i].min, objeto.leveledTags[i].max, function(err, result, tag, max, min){
            
            numeroConsulta++;
            
            //elimina preguntas que ya aparezcan
            if (result !== null && result.length !== 0 && result !== undefined ) {
                resultSinRepetidos = buscarElementosRepetidos(result, preguntas);
            }; 
            
            //si se devuelve alguna pregunta se añade al total
            if (resultSinRepetidos !== null && resultSinRepetidos.length != 0 && resultSinRepetidos !== undefined ) {
                totalPreguntas = totalPreguntas + resultSinRepetidos.length;
            }
            
            preguntas.push(resultSinRepetidos);
            
            recuentoPreguntas.push({"tag" : tag, "max" : max, "min" : min , "count" : result.length});
            
            //si es el collback de la ultima consulta a la base de datos se devuelve la promesa con la entrevista con las preguntas rellenas
            if (numeroConsulta == interview.leveledTags.length) {
                json={"preguntas" : preguntas, "total" : totalPreguntas, "recuento" : recuentoPreguntas};
                
                if (totalPreguntas < config.numeroPreguntas) {
                    err = new Error();
                    err.message = "Debe crear más preguntas para la(s) aptitud(es) seleccionada(s) o añadir alguna aptitud a la entrevista.";
                    /*for (var j = 0; j < recuentoPreguntas.length; j++) {
                        err.message = err.message + " Tag: " + recuentoPreguntas[j].tag + " preguntas: " 
                            + recuentoPreguntas[j].preguntas + ";";
                    };*/
                    
                    err.objeto=objeto;
                    deferred.reject(err);
                };
                
                deferred.resolve(json);
            }
        });
    }
    return deferred.promise;
}

function buscarAlternativa(objeto, res) {
    var continuar = false;
    
    rellenarPreguntas(objeto)
        .then(function(val){
            val.message = "Aumentar el rango de la(s) aptitud(es): ";
            for(var i = 0; i < val.preguntas.length; i++){
                if( val.preguntas[i].length == 0){
                    val.recuento.splice(i,1)
                }
            }
            res.status(500).send(val)
            continuar = false;
        })
        .fail(function(err){
            for(var i = 0; i < err.objeto.leveledTags.length; i++) {     
                
                if(err.objeto.leveledTags[i].min >1){
                    err.objeto.leveledTags[i].min --;
                }
                if(err.objeto.leveledTags[i].max <10){
                    err.objeto.leveledTags[i].max ++;
                }
                
                for(var j = 0; j < err.objeto.leveledTags.length; j++){
                    if(err.objeto.leveledTags[j].min > 1 || err.objeto.leveledTags[j].max < 10){
                        continuar = true;
                    }
                }
            }
            if (continuar == true){
                buscarAlternativa(err.objeto, res)
            }else{
                rellenarPreguntas(err.objeto)
                    .then(function(val){
                        val.message="Aumentar el rango de lo(s) aptitud(es): ";
                        for(var i = 0; i < val.preguntas.length; i++){
                                if( val.preguntas[i].length == 0){
                                    val.recuento.splice(i,1)
                                }
                            }
                        res.status(500).send(val)
                    })
                    .fail(function(err){
                        res.status(500).send(err)
                    })
            }
        })
}

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
                feedback: req.body.feedback,
                date: req.body.date,//"AAAA-MM-DDTHH:MM"
                status: "Pendiente",
                leveledTags: tags
            });
        };
    });

    rellenarPreguntas(interview)
        .then(function(val) {
            var preguntasFinal = [];
            var contadorTags = [];
            var recuentoPreguntas = [];
            
            for(var i = 0; i < val.preguntas.length; i++) {
                contadorTags[i]=0;
            }
        
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
                                err.message="La entrevista " + interview.DNI + " ya existe";
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
                    res.json({ message: 'Entrevista creada!', data: interview, recuento: interview.nquestions}); 
                }
            });         
        })
        .fail(function (err) {
        log.debug("Busca alternativa")
            buscarAlternativa(err.objeto, res);
        });  
}

// GET api/interview/:DNI
// returns the interview (unique) for the candidate for the searched DNI
exports.getInterview = function(req, res){
    var id=req.params.interview_id;
    var pattern = new RegExp("^([0-9,a-z]{6,30})$", "gi");
    
    //if(pattern.test(dni)){
        daoInterview.getInterview(id, function(err, result){
            if (err) {
                log.debug("Error at getting the interview which id is " + id + ": "+err);
                res.status(500).json({success:false,message: err.message});
            }
            else{
                if(null!=result && undefined!=result){
                    res.json(result);
                }
                else{
                    res.status(400).json({success:false, message: "No se ha encontrado la entrevista con el id "+ id});
                }
            }
        });
    //}
    //else{
        //res.status(400).json({ message: 'ERROR: Invalid DNI format: '+dni});
    //}
}

exports.getInterviews = function(req, res) {
    var fecha = req.param("fecha");
    var nombre = req.query.nombre;
    var page = req.query.pagina;
    var estado = req.query.estado;
    
    if (!strExists(page)){
        page=1
    }
    
    if (fecha == null || fecha == undefined) {
        if (!strExists(nombre)) {
            daoInterview.getInterviews(estado, res, page, callbackGetInterviews);
        }else{
            daoInterview.getInterviewsByName(estado, res, page, nombre, callbackGetInterviews);
        }
    }else{
        
        var mes = parseInt(fecha.slice(5,7));
        var ano = parseInt(fecha.slice(0,4));
        var dia = parseInt(fecha.slice(8,10));

        var fechamin = new Date(ano, mes-1, dia).toISOString();
        var fechamax = new Date(ano, mes-1, dia+1).toISOString();

        if (!strExists(nombre)) {
            daoInterview.getInterviewsByDate(estado, res, page, fechamin, fechamax, callbackGetInterviews);
        }else{
            daoInterview.getInterviewsByDateAndName(estado, res, page, fechamin, fechamax, nombre, callbackGetInterviews);
        }
    }
}

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
                response = {success:true , message:"Se ha eliminado la entrevista con DNI " + id };
            }
            else{
                response = {success:false , message:"Se ha eliminado la entrevista con DNI " + id };
                res.status(400);
            }
            
            res.json(response); 
        }
    });
}

exports.getInterviewQuestions = function(req, res) {
    var id = req.params.interview_id;
    var questions = [];
    var numConsulta = 0;
    
	daoInterview.getInterviewById(id, function(err, result){
        if(err){
			log.debug("Error at gettin the questions from the interview " + id + ": " + err);
            res.status(400).send(err);
        }
        else{
            if ( result.length > 0 ){
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
            }else {
                response={message:"No hay entrevistas con id " + id};
                res.send(response);
            }
        }
    });
}

exports.saveAnswers = function(req, res) {
    var id = req.params.interview_id;
    var answers = req.body.answers;
    
    daoInterview.saveAnswers(id, answers, function (err, data){
        if(err){
            log.debug("Error saving the answers for the interview " + id + ": " + err);
            res.status(500).send(err);
        }
        else{
            daoInterview.updateState(id, "Realizada" ,function (err, data){
                if(err){

                }
                else{
                    response={success:true , message:"Respuesta guardada"};
                    res.send(response);
                }
            });
                    
        }
    });
}

exports.postFeedback = function(req, res) {
    var id = req.params.interview_id;
    var feedback = req.body.feedback;
    
    if (!strExists(feedback)){
        feedback = "";
    }
    daoInterview.postFeedback(id, feedback, function (err, data){
        if(err){
            log.debug("Error saving the feedback for the interview " + id + ": " + err);
            res.status(500).send(err);
        }
        else{
            daoInterview.updateState(id, "Realizada" ,function (err, data){
                if(err){
                    log.debug("Error al actualizar el estado ");
                    res.status(500).send(err);
                }
                else{
                    response={success:true , message:"Estado guardado"};
                    res.send(response);
                }
            });
        }
    });
}
 
exports.getNames = function(req, res) {
    var fecha = req.param("fecha");
    var estado = req.param("estado");
    
    if (strExists(estado)){
        if (fecha == null || fecha == undefined || fecha===""){
            daoInterview.getNames(estado, res, callbackGetNames);
        }else{
            var mes = parseInt(fecha.slice(5,7));
            var ano = parseInt(fecha.slice(0,4));
            var dia = parseInt(fecha.slice(8,10));

            var fechamin = new Date(ano,mes-1,dia).toISOString();
            var fechamax = new Date(ano,mes-1,dia+1).toISOString();

            daoInterview.getNamesByDate(estado, res, fechamin, fechamax, callbackGetNames);
        }
    }else{
        res.send("No se ha especificado ningún estado");
    }
}

exports.LDAP = function(req, res) {
    var usr = req.body.usr;
    var pass = req.body.pass;
    var options = {
        url: 'ldap://ldap.gfi-info.com:389',
        searchBase: "ou=People,o=gfi-info.com",
        searchFilter: "(uid={{username}})"
    };
    
    
    try{
        var auth = new ldapAuth(options);
        
        auth.authenticate(usr, pass, function(err, user) {
            if (err){
                log.debug("LDAP auth error: %s", err);
                res.send(err);
            }else{
                res.send(user);
            }

            auth.close(function(err) {
                if (err){
                    console.log(err);
                }
            })
        });
    }catch(err){
        log.debug("ERROR " + err);
    }
}