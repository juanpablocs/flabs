#!/usr/bin/env node

var program = require('commander');
var inquirer = require('inquirer');
var request = require('request');
var fs = require('fs-extra');
var path = require('path');
var AdmZip = require('adm-zip');

var repo_branch = "refactor"; //master
var repo_url = "http://github.com/frontend-labs/flux";


// seteamos parametros aceptados
var params = ['module','action','controller'];
var questions_module = [
  {
    type: "input",
    name: "module_name",
    message: "add name module",
    validate:function(value)
    {
    	if(value.length<1)
    	{
    		return "error: el nombre de tu modulo no es valido";
    	}
    	return true;

    }
  },
];
var questions_new_app = [
  {
    type: "input",
    name: "app_name",
    message: "add name application",
    validate:function(value)
    {
    	if(value.length<1)
    	{
    		return "error: el nombre de tu application no es valido";
    	}
    	return true;
    }
  },
  {
    type: "input",
    name: "app_path",
    message: "add path application",
    validate:function(value)
    {
    	if(value.length<1)
    	{
    		return "error: el nombre de tu modulo no es valido";
    	}
    	return true;
    }
  },
  {
    type: "list",
    name: "app_opt",
    message: "select option",
    choices: ["flux", 'angularjs', 'reactjs', 'backbone', 'skeleton', 'none']
  }
];


// version del programa
program.version('0.0.1');

// programa inicializador
program
  .command('init')
  .description('description: comando importante para iniciar')
  .action(function () {
  		inquirer.prompt( questions_new_app, function( answers ) 
    	{
    		var n = answers.app_name;
    		var path = answers.app_path+"/"+n;

    		if(answers.app_opt=='flux')
    		{
    			console.log("generating wait....");
    			fs.mkdirs(path, function(err){
	    			if(err)
	    			{
	    				console.log("ERROR: "+err.code+" - "+err.path);
	    			}
	    			else
	    			{
	    				var flux = repo_url+"/archive/"+repo_branch+".zip";
						downloadZip(flux, answers, path);
	    			}
	    		});
    		}
    		else
    		{
    			console.log('aun no tenemos esta opcion '+ answers.app_opt);
    		}
    		
		});
  });


// programa crear
program
  .command('create <option>')
  .description('description: '+ params.join(','))
  .action(function (option) {
    if(in_array(params, option))
    {
    	inquirer.prompt( questions_module, function( answers ) 
    	{
			console.log( JSON.stringify(answers, null, "  ") );
		});
    }
    else
    {
    	console.log('option not enable')
    }
  });

// programa editar
program
  .command('update <option>')
  .description('description: '+params.join(','))
  .action(function (option) {
    console.log('update %s', option);
  });

// programa eliminar
program
  .command('remove <option>')
  .description('description: '+params.join(','))
  .action(function (option) {
    console.log('remove %s', option);
  });

// extras
program.option('-d, --dest', 'probando 1234');

// programa run
program.parse(process.argv);




function downloadZip(zipUrl, answers, ruta) 
{
	var _this = this;
	var zipFile = generateTemp() + '.zip';

	request.get(zipUrl).pipe(fs.createWriteStream(zipFile)).on('close', function() 
	{
		extractZip.call(_this, zipFile, ruta, function() 
		{
			removeFileOrDirectory(zipFile)
			var ruta_tmp = ruta+'/'+github_get_repo_name()+'-'+repo_branch;

			fs.copy(ruta_tmp, ruta, function(err){
				if(err) console.log(err);
				removeFileOrDirectory(ruta_tmp)
				flabsjson = {version:"0.0.1", application:{name:answers.app_name, path:path.resolve(ruta)},generate: generateTemp()};
				fs.writeJson(ruta+'/flabs.json', flabsjson, function (err) {
				  if(err) console.log(err)
				})
				console.log('todo correcto ve a esta ruta ==> '+ruta);
			});
		})
	})  
  
}

function removeFileOrDirectory(file)
{
	fs.remove(file, function (err) 
	{
		if (err) return console.error(err)
	})
}
function generateTemp () {
  return Date.now().toString() + '-' + Math.random().toString().substring(2)
}

function extractZip (zipFile, outputDir, callback) {
  var zip = new AdmZip(zipFile)
    , entries = zip.getEntries()
    , pending = entries.length
    , _this = this

  function checkDone (err) {
    if (err) _this.emit('error', err)
    pending -= 1
    if (pending === 0) callback()
  }

  entries.forEach(function(entry) 
  {
    if (entry.isDirectory) return checkDone()

    var file = path.resolve(outputDir, entry.entryName)
    fs.outputFile(file, entry.getData(), checkDone)
  })
}

function github_get_repo_name()
{
	return repo_url.replace(/http(?:s|)\:\/\/(?:www\.|)github\.com\/(?:.*?)\/(.*?)/, "$1")
}

function in_array(arr,valor)
{
	var i = arr.length;
	while(i--){
		if(arr[i]==valor) return true
	}
	return false;
}