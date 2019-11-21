/**
 * Blanjarvis v1.0.0
 * Created By : rio.bastian@metraplasa.co.id
 * Created On : 19/10/2018 11:16 AM
 **/
const express = require('express');
const exec = require('exec');
const app = express();

var request = require('sync-request');
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
function getSlackToken(u, p){
    console.log(u, p);
    var auth = 'Basic ' + Buffer.from(u + ':' + p).toString('base64');
    var resn = request('POST', 'https://10.11.12.30/api/v2/tokens/', {
        headers: {
            'Authorization': auth,
            'Content-Type': 'application/json'
        },
        json: {
            scope: "write"
        }
    });
    console.log(JSON.parse(resn.getBody()));
    return JSON.parse(resn.getBody()).token;
}

function sendReplyFromSubmission(payload){
    var task = payload.submission.awx_workflow_template_id;
    var labl = task.substring(task.indexOf("@") + 1, task.length);
    var resn = request('POST', payload.response_url, {
        json: {
            text : '<@' + payload.user.name + '> is calling *' + labl + '*'
        }
    });
}

function showSlackDialog(tid){
    console.log(tid);
    var resn = request('POST', 'https://slack.com/api/dialog.open', {
        headers: {
            'Content-Type' : 'application/json; charset=utf-8',
            'Authorization' : 'Bearer xoxp-3890988748-13675250546-831009859378-dfba34236154b61e88ec833ab2e36928'
        },
        json: {
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
                        label : "Password",
                        name : "awx_workflow_template_id",
                        options : [
                            {
                                value : "220@[PROD - WORKFLOW] Dubbo Member",
                                label : "[PROD - WORKFLOW] Dubbo Member"
                            },
                            {
                                value : "219@[PROD - WORKFLOW] Dubbo Platform",
                                label : "[PROD - WORKFLOW] Dubbo Platform"
                            },
                            {
                                value : "221@[PROD - WORKFLOW] Dubbo Product",
                                label : "[PROD - WORKFLOW] Dubbo Product"
                            },
                            {
                                value : "218@[PROD - WORKFLOW] Dubbo Trade",
                                label : "[PROD - WORKFLOW] Dubbo Trade"
                            },
                            {
                                value : "202@[PROD - WORKFLOW] Nginx Config Deployment",
                                label : "[PROD - WORKFLOW] Nginx Config Deployment"
                            },
                            {
                                value : "213@[PROD - WORKFLOW] Web Admin",
                                label : "[PROD - WORKFLOW] Web Admin"
                            },
                            {
                                value : "211@[PROD - WORKFLOW] Web Mainsite",
                                label : "[PROD - WORKFLOW] Web Mainsite"
                            },
                            {
                                value : "212@[PROD - WORKFLOW] Web Member",
                                label : "[PROD - WORKFLOW] Web Member"
                            },
                            {
                                value : "216@[PROD - WORKFLOW] Web Mobile",
                                label : "[PROD - WORKFLOW] Web Mobile"
                            },
                            {
                                value : "217@[PROD - WORKFLOW] Web Mobile Apps API",
                                label : "[PROD - WORKFLOW] Web Mobile Apps API"
                            },
                            {
                                value : "214@[PROD - WORKFLOW] Web Product",
                                label : "[PROD - WORKFLOW] Web Product"
                            },
                            {
                                value : "223@[PROD - WORKFLOW] Web Seller",
                                label : "[PROD - WORKFLOW] Web Seller"
                            },
                            {
                                value : "224@[PROD - WORKFLOW] Web Seller API",
                                label : "[PROD - WORKFLOW] Web Seller API"
                            },
                            {
                                value : "225@[PROD - WORKFLOW] Web Seller Apps API",
                                label : "[PROD - WORKFLOW] Web Seller Apps API"
                            },
                            {
                                value : "215@[PROD - WORKFLOW] Web Trade",
                                label : "[PROD - WORKFLOW] Web Trade"
                            }
                        ]
                    }
                ]
            }
        }
    });
    console.log(JSON.parse(resn.getBody()));
}
app.post('/blanjarvis/release', (req, res) => {
    showSlackDialog(req.body.trigger_id);
    res.send();
});
app.post('/blanjarvis/release/reply', (req, res) => {
    payload = JSON.parse(req.body.payload);
    console.log(getSlackToken(payload.submission.awx_username,payload.submission.awx_password));
    sendReplyFromSubmission(payload);
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
