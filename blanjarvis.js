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

// --- UNDER CONSTRUCTION ---
function call(tid){
    console.log(tid);
    var resn = request({
        method: "POST",
        uri:  "https://slack.com/api/dialog.open",
        headers: {
            'Content-Type' : 'application/json; charset=utf-8',
            'Authorization' : 'Bearer xoxb-3890988748-470104240467-htLUlPJZUsDFFQTqzu7lgeT0'
        },
        json: true,
        body: {
            pretty : 1,
            trigger_id : tid,
            dialog :{
                callback_id : "mp2dt-"+tid,
                title : "MP2 Deploy Tools (BETA)",
                submit_label : "Deploy",
                elements : [
                   {
                        type : "text",
                        label : "Username",
                        name : "awx_username"
                    },
                    {
                        type : "text",
                        label : "Password",
                        name : "awx_password"
                    },
                    {
                        type : "select",
                        label : "Task",
                        name : "awx_workflow_template_id",
                        options : [
                            {
                                value : "220",
                                label : "[PROD - WORKFLOW] Dubbo Member"
                            },
                            {
                                value : "219",
                                label : "[PROD - WORKFLOW] Dubbo Platform"
                            },
                            {
                                value : "221",
                                label : "[PROD - WORKFLOW] Dubbo Product"
                            },
                            {
                                value : "218",
                                label : "[PROD - WORKFLOW] Dubbo Trade"
                            },
                            {
                                value : "202",
                                label : "[PROD - WORKFLOW] Nginx Config Deployment"
                            },
                            {
                                value : "213",
                                label : "[PROD - WORKFLOW] Web Admin"
                            },
                            {
                                value : "211",
                                label : "[PROD - WORKFLOW] Web Mainsite"
                            },
                            {
                                value : "212",
                                label : "[PROD - WORKFLOW] Web Member"
                            },
                            {
                                value : "216",
                                label : "[PROD - WORKFLOW] Web Mobile"
                            },
                            {
                                value : "217",
                                label : "[PROD - WORKFLOW] Web Mobile Apps API"
                            },
                            {
                                value : "214",
                                label : "[PROD - WORKFLOW] Web Product"
                            },
                            {
                                value : "223",
                                label : "[PROD - WORKFLOW] Web Seller"
                            },
                            {
                                value : "224",
                                label : "[PROD - WORKFLOW] Web Seller API"
                            },
                            {
                                value : "225",
                                label : "[PROD - WORKFLOW] Web Seller Apps API"
                            },
                            {
                                value : "215",
                                label : "[PROD - WORKFLOW] Web Trade"
                            }
                        ]
                    }
                ]
            }
        }
    });
}
app.post('/blanjarvis/release', (req, res) => {
    console.log(req.body);
    call(req.body.trigger_id);
    res.send('<@' + req.body.user_name + "> initial deploy.");
});
app.post('/blanjarvis/release/reply', (req, res) => {
    console.log(req.body);
    res.send();
});
// --- UNDER CONSTRUCTION ---

/**
 * GIT Pull - Pull code from git repository
 */ 
app.post('/blanjarvis/git/pull', (req, res) => {
    var prm = ExtractParameter(true, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'git -C "/home/vmuser/mp2git/" pull\'';
    DoShellExecute(req.body, cmd);
    
    // return the result
    var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
    var comd = '/blanjarvis/git/pull ' + req.body.text;
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
});

/**
 * GIT Status - Status code from git repository
 */ 
app.post('/blanjarvis/git/status', (req, res) => {
    var prm = ExtractParameter(true, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'git -C "/home/vmuser/mp2git/" status\'';
    DoShellExecute(req.body, cmd);
    
    // return the result
    var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
    var comd = '/blanjarvis/git/status ' + req.body.text;
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
});

/**
 * GIT Checkout - Checkout code from git repository
 */ 
app.post('/blanjarvis/git/checkout', (req, res) => {
    var prm = ExtractParameter(false, req.body);
    var cmd = 'ssh -p 22 vmuser@' + prm[0] + ' \'git -C "/home/vmuser/mp2git/" checkout '+ prm[1] +'\'';
    DoShellExecute(req.body, cmd);
    
    // return the result
    var tckt = req.body.response_url.substr(req.body.response_url.lastIndexOf('/') + 1);
    var comd = '/blanjarvis/git/checkout ' + req.body.text;
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
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
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
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
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
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
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
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
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
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
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
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
    
    // Prepare Response
    res.setHeader('Content-Type', 'application/json');
    res.send(PostSyncResponse(req.body.user_name, comd, tckt));
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
 * Return Post Sync Response
 * Set response type to 'in_channel' instead of 'ephemeral', 
 * 'ephemeral' only visible for the sender, 
 * 'in_chanel' will be visible for others. 
 */
function PostSyncResponse(uname, comd, tckt){
    var post_data = {
        'text' : '<@' + uname + '>, cli: ['+ comd +'], ' +'id: [' + tckt + ']',
        'attachments': [],
        'response_type': 'in_channel'
    };
    return JSON.stringify(post_data);
}

/**
 * Post Delay Response back to Slack
 */
function PostDelayedResponse(url, data, ticket, username) {
    var post_data = {
        'text' : '<@' + username + '>, id: [' + ticket + '] \n```' + data + '```',
        'attachments': [],
        'response_type': 'in_channel'
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
