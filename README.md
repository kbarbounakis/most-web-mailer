# @themost/mailer

[Most Web Framework](https://github.com/themost-framework/themost) Mailer simplifies mail operations by sending either static or dynamic html emails.

Install with npm

    npm install @themost/mailer
    

Use `@themost/mailer` to send static html emails:

    import {MailHelper} from '@themost/mailer';
    // init mail in the current HTTP context
    new MailHelper(context).transporter({
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
    
You can use default mail transporter as it is defined in application configuration section settings#mail. In this case you can omit transporter initialization. e.g.

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

Finally, send dynamic mail template:

    import {MailHelper} from '@themost/mailer';
    // init mail in the current HTTP context
    new MailHelper(context).from('user@example.com')
        .to('friend@example.com')
        .subject('Hello from user')
        .template('my-first-template').send({ name: 'George' }, (err) => {
            done(err);
        });
    

