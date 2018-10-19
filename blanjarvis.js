/**
 * Blanjarvis v1.0.0
 * Created By : rio.bastian@metraplasa.co.id
 * Created On : 19/10/2018 11:16 AM
 **/
const express = require('express');
const exec = require('exec');
const app = express();

var request = require('request');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Default Constant Variable
const DEFAULT_S2_GREP = ' | grep "Building\\|BUILD ERROR\\|BUILD SUCCESS"';
const DEFAULT_GREP    = ' | grep "Building\\|ERROR\\|SUCCESS"';
const DEFAULT_PORT    = process.env.PORT || 19893;

app.listen(DEFAULT_PORT, () => {
    console.log('Blanjarvis is up on http ' + DEFAULT_PORT);
});

/**
 * JAR - Compile Jar (iapi)
 */ 
app.post('/blanjarvis/build/iapi', (req, res) => {
    var prm = ExtractParameter(true, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'/home/vmuser/publish/dev/iapi.sh ' + prm[1] + '\'';
    DoShellExecute(req.body, cmd);
	
    // return the result
	var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
	var comd = '/blanjarvis/build/iapi ' + req.body.text;
    res.send(
		'<@' + req.body.user_name + '>, cli: ['+ comd +'], ' +'id: [' + tckt + ']');
});

/**
 * S2 - Compile Static Resources (static)
 */ 
app.post('/blanjarvis/build/pk_static', (req, res) => {
    var prm = ExtractParameter(true, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'/home/vmuser/publish/dev/pk_static.sh ' + DEFAULT_S2_GREP + '\'';
    DoShellExecute(req.body, cmd);
	
    // return the result
	var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
	var comd = '/blanjarvis/build/pk_static ' + req.body.text;
    res.send(
		'<@' + req.body.user_name + '>, cli: ['+ comd +'], ' +'id: [' + tckt + ']');
});

/**
 * DUBBO - Deploy Service
 */ 
app.post('/blanjarvis/build/publish_service', (req, res) => {
    var prm = ExtractParameter(false, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'/home/vmuser/publish/dev/publish_service.sh ' + prm[1] + '\'';
    DoShellExecute(req.body, cmd);
	
    // return the result
	var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
	var comd = '/blanjarvis/build/publish_service ' + req.body.text;
    res.send(
		'<@' + req.body.user_name + '>, cli: ['+ comd +'], ' +'id: [' + tckt + ']');
});

/**
 * DUBBO - Compile Service
 */ 
app.post('/blanjarvis/build/pk_module', (req, res) => {
    var prm = ExtractParameter(true, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'/home/vmuser/publish/dev/pk_module.sh ' + prm[1] + '\'';
    DoShellExecute(req.body, cmd);
	
    // return the result
	var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
	var comd = '/blanjarvis/build/pk_module ' + req.body.text;
    res.send(
		'<@' + req.body.user_name + '>, cli: ['+ comd +'], ' +'id: [' + tckt + ']');
});

/**
 * WEB - Deploy Web
 */ 
app.post('/blanjarvis/build/deploy_web', (req, res) => {
    var prm = ExtractParameter(false, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'/home/vmuser/publish/dev/deploy_web.sh ' + prm[1] + '\'';
    DoShellExecute(req.body, cmd);
	
    // return the result
	var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
	var comd = '/blanjarvis/build/deploy_web ' + req.body.text;
    res.send(
		'<@' + req.body.user_name + '>, cli: ['+ comd +'], ' +'id: [' + tckt + ']');
});

/**
 * WEB - Compile Web
 */ 
app.post('/blanjarvis/build/pk_web', (req, res) => {
	var prm = ExtractParameter(true, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'/home/vmuser/publish/dev/pk_web.sh ' + prm[1] + '\'';
    DoShellExecute(req.body, cmd);
	
    // return the result
	var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
	var comd = '/blanjarvis/build/pk_web ' + req.body.text;
    res.send(
		'<@' + req.body.user_name + '>, cli: ['+ comd +'], ' +'id: [' + tckt + ']');
});

/**
 * Extract Request Parameter
 */
function ExtractParameter(bol, body){
	var data = body.text;
    var ips  = "10.11.17.26";
    var tgt  = "";
	try{
		if(data != ""){
			if(data.indexOf(" ") > 0){
			   ips = data.substring(0, data.indexOf(" ")); 
			   tgt = data.substring(data.indexOf(" ") + 1, data.length);
			} else {
			   ips = data;
			}
		}
	} catch(err){
		console.log(err);
	}
	
	if(bol && tgt != ""){
		tgt = tgt + DEFAULT_GREP;
	}
	
	// Prepare Result
	var result = [];
	result[0]  = ips;
	result[1]  = tgt;
	
	return result;
}

/**
 * Execute Shell Script
 */
function DoShellExecute(body, command){
	// Prepare Ticket, as sync process
    var ticket = body.response_url.substr(body.response_url.lastIndexOf('/') + 1);
	var usernm = body.user_name;
	
	console.log("== EXE " + command);
	
	// Trigger Exec
	exec(command, function (error, stdout, stderr) {
        if(stdout){
			PostDelayedResponse(body.response_url, stdout, ticket, usernm);
		}
        if (error !== null) {
            console.log('Shell Execution Error : ' + error);
        }
    });
}

/**
 * Post Delay Response back to Slack
 */
function PostDelayedResponse(url, data, ticket, username) {
    var post_data = {
        'text' : '<@' + username + '>, id: [' + ticket + '] \n```' + data + '```',
        'attachments': []
    };
    var requestOption = {
		uri: url,
		body: JSON.stringify(post_data),
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		}
	};
	request(requestOption, function (error, response) {
		console.log(error,response.body);
		return;
	});
}