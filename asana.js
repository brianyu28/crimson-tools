// bot's User ID: 252773210766742
// The Harvard Crimson's workspace ID: 219755265194296
// DSR Project ID: 219755265194296

/*
****** NODE MAILER ************************************************************
*/
const nodemailer = require('@nodemailer/pro');

function send_botmail(recipients, subject, contents) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'bot@thecrimson.com',
            pass: 'qKUQBLuVyoBitwyz9iGANHwV'
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Crimson Bot" <bot@thecrimson.com>', // sender address
        to: recipients, // list of receivers
        subject: subject, // Subject line
        html: contents // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
    });
}

/*
*************************************************************************************
*/

// var request = require("request");
var request = require('sync-request');
var ASANA_HEADERS = {"Authorization": "Bearer 0/554b333519fa7c223d534f6aa2fe7b1b"}

today_dsr();

function today_dsr() {
    var res = request('GET', 'https://app.asana.com/api/1.0/projects/219755265194296/tasks?completed_since=now', {
        'headers': ASANA_HEADERS

    });
    var all_stories = JSON.parse(res.getBody('utf8'))["data"];
    stories = [];
    for (var i = 0, len = all_stories.length; i < len; i++) {
        story = all_stories[i];

        // if it's a day marker, continue for the first story, or stop if the next day
        if (story["name"].endsWith(":"))
            if (i == 0)
                continue;
            else
                break;

        stories.push(story);
    }
    add_task_data(stories);
}

function add_task_data(stories) {
    for (var i = 0, len = stories.length; i < len; i++) {
        var story_id = stories[i]["id"];
        var res = request('GET', 'https://app.asana.com/api/1.0/tasks/' + story_id, {
            'headers': ASANA_HEADERS
        });
        var story = JSON.parse(res.getBody('utf8'))["data"];
        if (story["assignee"] != null)
            stories[i]["assignee"] = story["assignee"]["name"];
        else
            stories[i]["assignee"] = null;
    }
    construct_email_from(stories);
}

function construct_email_from(stories) {
    contents = "<!DOCTYPE html><html><head>";
    contents += "<link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">";
    contents += "</head><body><div class=\"container\">";
    contents += "<img style=\"width:50px;position:absolute;top:10px;right:10px;\" src=\"https://s3.amazonaws.com/static.thecrimson.com/images/seal.jpg\" />"

    contents += "<h1 style=\"color:red\">Hi there!</h1><br/>This is an automated Page 0 reminder! Stories for tomorrow are:<br/>";
    contents += "<br/><ul>";

    for (var i = 0, len = stories.length; i < len; i++) {
        contents += "<li><b>" + stories[i]["name"] + "</b> ";
        if (stories[i]["assignee"]) {
            contents += "(" + stories[i]["assignee"] + ")";
        }
        contents += "</li>";
    }
    contents += "</ul><br/>";
    contents += "See you all at <b>Page 0 at 4:00</b>!";
    contents += "<br/><br/>Remember...";
    contents += "<h3 style=\"color:red\">Page 0 is mandatory!</h3>";
    contents += "<br/><br/>";
    contents += "Signed,<br/>Crimson Bot";
    contents += "<br/><br/><br/><small>Problems with this email? <a href=\"mailto:bot@thecrimson.com\">Let me know.</a></small>"

    contents += "</div></body></html>"

    send_botmail(["andy.duehren@thecrimson.com", "daphne.thompson@thecrimson.com", "jalin.cunningham@thecrimson.com"], "Page 0", contents);
}
