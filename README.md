# @themost/mailer

Most Web Framework Mailer simplifies mail operations inside in a MOST web application.

Install with npm

    npm install @themost/mailer
    
Note: If you want to install the previous version (0.1.x) of most-web-mailer module use:

    npm install most-web-mailer

Use most-web-mailer to send an html static email:

    var mm = require('most-web-mailer'), 
    web = require('most-web');
    //init mail in the current HTTP context
    mm.mailer(context).transporter({
        service:'gmail',
        auth:{
            user:"user@example.com",
            pass:"password"
        }
    }).from('user@example.com')
        .to('friend@example.com')
        .subject('Hello from user')
        .body('<p style="color:#0040D0">Hello World</p>').send({}, function(err) {
            done(err);
        });
    
You can use default mail transporter as it is defined in application configuration section settings#mail. In this case you can omit transporter initialization. Here is the section as may be defined in application configuration:

    ...
    "settings": {
      ...
      "mail": {
          "from": "user@example.com"
          "port":587,
          "host":"smtp.example.com",
          "auth": {
            "user":"user@example.com",
            "pass":"password"
          }
      }
      ...
    }
    
Note: MOST Web Framework Mailer uses [nodemailer](https://github.com/andris9/Nodemailer) as sender engine.

MOST Web Framework Mailer gives you also the opportunity to send dynamic mail templates by using the registered view engines. So, create a folder in app/templates/mails directory

    + app
      + templates
        + mails
          + my-first-template

Create a file named html.ejs (Note: EJS is the default view engine for every MOST Web Framework application):

    <html>
      <head>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.2/css/bootstrap.css" />
      </head>
      <body>
            <div class="page-header">
                <h1>MOST Web Framework Team</h1>
            </div>
            <p>Hello <%=model.name%></p>
        </body>
    </html>

Finally send dynamic mail template:

    import mailer from '@themost/mailer';
    //init mail in the current HTTP context
    mailer.getMailer(context).from('user@example.com')
        .to('friend@example.com')
        .subject('Hello from user')
        .template('my-first-template').send({ name: 'George' }, (err)=> {
            done(err);
        });
    

