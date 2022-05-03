/**
 * MOST Web Framework
 * A JavaScript Web Framework
 * http://themost.io
 *
 * Copyright (c) 2014, Kyriakos Barbounakis k.barbounakis@gmail.com, Anthi Oikonomou anthioikonomou@gmail.com
 *
 * Released under the BSD3-Clause license
 * Date: 2015-09-24
 */
var util = require('util');
var path = require('path');
var nodemailer = require('nodemailer');
var async = require('async');
var fs = require('fs');

if (typeof Array.prototype.distinct === 'undefined')
{
    /**
     * @param {Function} callback
     * @param {Object=} [thisObject]
     * @returns {*}
     * @ignore
     */
    var distinct = function(callback, thisObject) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisObj = arguments[1];
        var value;
        var res = [];
        for (var i = 0; i < length; i++) {
            if (i in list) {
                value = list[i];
                var item = callback.call(thisObj, value, i, list);
                if (item)
                    if (res.indexOf(item)<0)
                        res.push(item);
            }
        }
        return res;
    };
    if (Object.defineProperty) {
        try {
            Object.defineProperty(Array.prototype, 'distinct', {
                value: distinct, configurable: true, enumerable: false, writable: true
            });
        } catch(e) {
            //
        }
    }
    if (!Array.prototype.distinct) { Array.prototype.distinct = distinct; }
}
/**
 * @param {...string|string[]} p
 * @ignore
 * @private
 */
// eslint-disable-next-line no-unused-vars
function argumentsArray(p) {
    var arr = [], args = [];
    args.push.apply(args, arguments);
    args.forEach(function(x) {
        //backward compatibility test
        if (util.isArray(x)) {
            arr.push.apply(arr, x);
        }
        else if (typeof x === 'string') {
            arr.push(x);
        }
        else if (typeof x !== 'undefined' && x != null) {
            var er = new Error('Invalid argument. Expected string or array or param array of string.'); er.code = 'EARG';
            throw(er);
        }
    });
    return arr.distinct(function(x) { return x; });
}

/**
 * MailHelper class contains a set of helper methods for sending emails.
 * @class
 * @params {HttpContext|*} context
 * @constructor
 */
function MailerHelper(context) {
    this.context = context;
    this._test = false;
    this.options = { };
}

/**
 * Sets the mail template which are going to be used for this mail message.
 * The name of the template is a folder lies on application's mail templates folder (/app/templates/mails/).
 * <br>
 * MOST Web Mailer uses this naming convention in order to define and use different mail templates.
 * The mail templates folder may have the following structure:
 * <pre>
 *     app
 *        + templates
 *          + mails
 *             + order-reply
 *                  + html.ejs
 *             + registration-reply
 *                  + html.ejs
 *                  + log.jpeg
 * </pre>
 * Each mail template has an html.* file which represents the message body to be rendered using the view engine associated with the extension of its template.
 * The most common view engine for this operation is the EJS view engine which is an embedded view engine of all MOST Web Framework applications.
 * It may also has other files (images, icons etc) which are defined in message body.
 * <pre>
 *     &lt;html&gt;
 *         &lt;head&gt;
 *             &lt;title&gt;Order Reply&lt;/title&gt;
 *         &lt;/head&gt;
 *         &lt;body&gt;
 *             &lt;p&gt;Hello &lt;%=locals.data.customer.description&gt;&lt;/p&gt;
 *             &lt;p&gt;
 *                 Thank you for your order no. &lt;%=locals.data.orderNumber%&gt; dated &lt;%=locals.data.orderDate%&gt;.
 *             &lt;/p&gt;
 *             &lt;p&gt;
 *                 Yours faithfully,
 *                 Sales Department
 *             &lt;/p&gt;
 *         &lt;/body&gt;
 *     &lt;/html&gt;
 * </pre>
 * @param {string} template - A string that represents the name of the template.
 * @returns {MailerHelper}
 */
MailerHelper.prototype.template = function(template) {
    if (typeof template === 'string') {
        delete this.options.text;
        delete this.options.html;
        this.template = template;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Sets the mail body of an HTML message.
 * @param {string} body - A string that represents the HTML body of the message to be sent.
 * @returns {MailerHelper}
 *
 * @example
 *
const {MailHelper} = require("@themost/mailer");
new MailHelper(context).subject("Good morning")
 .body("<p style='color:lightblue'>This is an HTML message</p>")
 .to("user@example.com")
 .send(function(err, res) {
    return done(err);
});
 */
MailerHelper.prototype.body = function(body) {
    if (typeof body === 'string') {
        delete this.options.text;
        delete this.template;
        this.options.html = body;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Sets the mail body of a plain text message.
 * @param {string} text - A string that represents the body of the message to be sent.
 * @returns {MailerHelper}
 *
 * @example
 *
const {MailHelper} = require("@themost/mailer");
 new MailHelper(context).subject("Good morning")
 .text("This is a plain text message.")
 .to("user@example.com")
 .send(function(err, res) {
    return done(err);
});
 */
MailerHelper.prototype.text = function(text) {
    if (typeof text === 'string') {
        delete this.options.html;
        delete this.template;
        this.options.text = text;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Sets the mail subject.
 * @param {string} subject - A string that represents the subject of the message to be sent.
 * @returns {MailerHelper}
 */
MailerHelper.prototype.subject = function(subject) {
    if (typeof subject === 'string') {
        this.options.subject = subject;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Sets the mail sender.
 * @param {string} sender - A string that represents the email address of the sender.
 * @returns {MailerHelper}
 */
MailerHelper.prototype.from = function(sender) {
    if (typeof sender === 'string') {
        this.options.from = sender;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Sets the email address that will be used as reply-to parameter of the mail message
 * @param {string} reply - A string that represents an email address
 * @returns {MailerHelper}
 */
MailerHelper.prototype.replyTo = function(reply) {
    if (typeof reply === 'string') {
        this.options.replyTo = reply;
    }
    else {
        var er = new Error('Invalid argument. Expected string or array.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Sets the file path(s) which are going to be attached to the message.
 * @param {...string} p - A string that represents the full path of the file(s) to be attached.
 * @returns {MailerHelper}
 *
 * @example
const {MailHelper} = require("@themost/mailer");
new MailHelper(context).attachments("/tmp/cv.doc","/tmp/photo.jpeg")
 .subject("New CV")
 .body("I am sending you my new CV. Best Regards.")
 .send(function(err, res) {
    return done(err);
});
 */
// eslint-disable-next-line no-unused-vars
MailerHelper.prototype.attachments = function(p) {
    var self = this;
    var arr = argumentsArray.apply(this, arguments);
    self.options.attachments = [];
    arr.forEach(function(x) {
        if (typeof x !== 'string') {
            var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
            throw(er);
        }
        //add file attachment as string
        self.options.attachments.push({
                filename: path.basename(x),
                content: fs.createReadStream(x)
            });
    });
    return this;
};

/**
 * Sets the message recipient(s).
 * @param {...string} recipient - A string that represents the email address of a message recipient.
 * @returns {MailerHelper}
 *
 * @example
 *
const {MailHelper} = require("@themost/mailer");
new MailHelper(context).subject("Good morning")
 .text("Have a nice day!")
 .to("user@example.com", "other@example.com")
 .send(function(err, res) {
    return done(err);
});
 */
// eslint-disable-next-line no-unused-vars
MailerHelper.prototype.to = function(recipient) {
    var p1 = argumentsArray.apply(this, arguments).join(';');
    if (p1.length>0)
        this.options.to = p1;
    else
        delete this.options.to;
    return this;
};

/**
 * Sets message transporter options.
 * The default message transporter is defined in application config#settings.mail.
 *<br>
 * e.g. {
          "port":587,
          "host":"smtp.example.com",
          "auth": {
            "user":"sender@example.com",
            "pass":"password"
          }
        }
 <br>
 or {
    service: 'Gmail',
    auth: {
        user: 'gmail.user@gmail.com',
        pass: 'userpass'
    }
} etc.
 <br>
 * For further information about message transporters visit {@link https://github.com/andris9/Nodemailer|Nodemailer}
 * @param {{service:string,host:string,port:string,auth:{user:string,pass:string,xoauth2:string},secure:boolean,ignoreTLS:boolean}|*} opts
 * @returns {MailerHelper}
 */
MailerHelper.prototype.transporter = function(opts) {
    this._transporter = opts;
    return this;
};

/**
 * Sets test message parameter.
 * If value is true the mail message will not be sent and MailHelper.send() callback function will return the message body.
 * This operation may be used for developing purposes against a message template.
 * @param {boolean} value - If value is set to true, a test message operation will be started
 * @returns {MailerHelper}
 *
 * @example
 var mm = require("@themost/mailer");
 mm.mailer(context).subject("Good morning")
 .subject("New Order")
 .template("new-order-notification")
 .to("employee1@example.com")
 .test()
 .send({ "id":1200, "product","17-inch LCD Monitor","customer":"Alexis Williams" }, function(err, res) {
    if (err) { return done(err); }
    console.log("Message Body: " + body;
    return done();
});
 */
MailerHelper.prototype.test = function(value) {
    this._test = !!value;
    return this;
};

/**
 * Sets the message secondary recipient(s).
 * @param {...string} cc - A string that represents the email address of a message recipient.
 * @returns {MailerHelper}
 *
 * @example
 var mm = require("@themost/mailer");
 mm.mailer(context).subject("Good morning")
 .subject("New Order")
 .template("new-order-notification")
 .to("employee1@example.com")
 .cc("sales1@example.com", "sales2@example.com")
 .send({ "id":1200, "product","17-inch LCD Monitor","customer":"Alexis Williams" }, function(err, res) {
    return done(err);
});
 */
// eslint-disable-next-line no-unused-vars
MailerHelper.prototype.cc = function(cc) {
    var p1 = argumentsArray.apply(this, arguments).join(';');
    if (p1.length>0)
        this.options.cc = p1;
    else
        delete this.options.cc;
    return this;
};

/**
 * Sets the message BCC recipient(s).
 * @param {...string} bcc - A string that represents the email address of a message BCC recipient.
 * @returns {MailerHelper}
 *
 * @example
 *
 const {MailHelper} = require("@themost/mailer");
 new MailHelper(context).subject("Good morning")
 .text("This is a plain text message.")
 .to("user@example.com")
 .bcc("admin1@example.com","admin2@example.com")
 .send(function(err, res) {
    return done(err);
});
 */
// eslint-disable-next-line no-unused-vars
MailerHelper.prototype.bcc = function(bcc) {
    var p1 = argumentsArray.apply(this, arguments).join(';');
    if (p1.length>0)
        this.options.bcc = p1;
    else
        delete this.options.bcc;
    return this;
};
/**
 * Sends the mail message. If test parameter is true then the callback function returns the mail to be sent.
 * @param {*} data - An object that represents the data to be passed in the mail template.
 * @param {function(Error=,*=)} callback - A callback function where the first argument will contain an error, if an error occured while sending mail.
 * The second argument will contain an object which represents the mail server response or the message body of test message
 * (message parameter test was set to true).
 *
 * @example
 *
 var mm = require("@themost/mailer");
 mm.mailer(context).subject("Good morning")
 .text("This is a plain text message.")
 .to("user2@example.com")
 .cc("friend1@example.com","friend2@example.com")
 .send(function(err, res) {
    return done(err);
});
 */
MailerHelper.prototype.send = function(data, callback) {
    callback = callback || function() {};
    var transporter, error, self = this, context = self.context;
    try {
        if (!self._test) {
            if (typeof self._transporter === 'undefined' || self._transporter==null) {
                //get default transporter
                transporter = getDefaultTransporter(context);
                if (typeof transporter === 'undefined' || transporter==null) {
                    error = new Error('An error occurred while initializing mail transporter.');
                    error.code = 'ERR_MAIL_SEND';
                    return callback(error);
                }
            }
            else {
                transporter = nodemailer.createTransport(self._transporter);
            }
        }
        //try to get default sender
        tryDefaultBCC.call(self);
        //try to get default bcc recipients
        tryDefaultSender.call(self);

        //create mail object
        var mail = self.options;
        if (typeof self.options.html === 'string' || typeof self.options.text === 'string') {
            //finally send email
            if (self._test) { return callback(null, mail); }
            return transporter.sendMail(mail, function (err, info) {
                if (err) {
                    return callback(err);
                }
                return callback(null, info.response);
            });
        }
        //initialize view engine
        else if (typeof self.template === 'string') {
            var engines = context.application.getConfiguration().getSourceAt('engines');
            async.eachSeries(engines,function(item, cb) {
                try {
                    var templatePath = self.getTemplatePath(self.template, item.extension);
                    fs.stat(templatePath, function(err, result) {
                        if (err) {
                            //file does not exist, so exit without error
                            if (err.code === 'ENOENT') { return cb(); }
                            //otherwise throw exception
                            cb(err);
                        }
                        if (!result.isFile()) { return cb(); }
                        try {
                            var engineInstance = context.engine(item.extension);
                            engineInstance.render(templatePath, data, function(err, result) {
                                if (err) { return cb(err); }
                                mail.html = result;
                                if (self._test) { return cb(mail); }
                                transporter.sendMail(mail, function (err, info) {
                                    if (err) { return cb(err); }
                                    cb(info.response)
                                });
                            });
                        }
                        catch(e) {
                            cb(e);
                        }
                    });
                }
                catch(e) {
                    cb(e);
                }
            }, function(err) {
                if (err instanceof Error) {
                    callback(err);
                }
                else if (typeof err !== 'undefined' && err != null) {
                    callback(null, err);
                }
                else {
                    error = new Error('Mail template cannot be found or refers to a template engine which is not implemented by this application.');
                    error.code = 'ERR_MAIL_TEMPLATE';
                    callback(error)
                }
            });
        }
    }
    catch(e) {
        callback(e);
    }
};

MailerHelper.prototype.getTemplatePath = function(template, extension) {
    if (typeof this.context.application.mapPath === 'function') {
        return this.context.application.mapPath(util.format('/templates/mails/%s/html.%s' , template, extension));
    }
    return path.resolve(this.context.application.getConfiguration().getExecutionPath(), util.format('templates/mails/%s/html.%s' , template, extension));
};

/**
 * Get MOST Web application default mail transporter as is is defined in settings#mail section
 * @param {HttpContext} context
 * @ignore
 */
function getDefaultTransporter(context) {
    if (typeof context === 'undefined')
        return;
    /**
     * @type {HttpApplication}
     */
    var application = context.application;
    if (typeof application === 'undefined')
        return;
    if (typeof application.getConfiguration().settings === 'undefined')
        return;
    /**
     * @type {{service:string}|*}
     */
    var options = application.getConfiguration().settings['mail'] || application.getConfiguration().settings['mailSettings'];
    if (typeof options === 'undefined' || options === null)
        return;
    return nodemailer.createTransport(options);
}

function tryDefaultSender() {
    var self = this;
    if (typeof self.options.from === 'string' && self.options.from.length>0) {
        return;
    }
    if (typeof self.context === 'undefined')
        return;
    /**
     * @type {HttpApplication}
     */
    var application = self.context.application;
    if (typeof application === 'undefined')
        return;
    if (typeof application.getConfiguration().settings === 'undefined')
        return;
    /**
     * @type {{service:string,from:string}|*}
     */
    var opts = application.getConfiguration().settings['mail'] || application.getConfiguration().settings['mailSettings'];
    if (typeof opts === 'undefined' || opts === null)
        return;
    if (util.isArray(opts.from))
        self.options.from = opts.from.join(';');
    else if (typeof opts.from === 'string')
        self.options.from = opts.from;
}

function tryDefaultBCC() {
    var self = this;
    if (typeof self.options.bcc === 'string' && self.options.bcc.length>0) {
        return;
    }
    if (typeof self.context === 'undefined')
        return;
    /**
     * @type {HttpApplication}
     */
    var application = self.context.application;
    if (typeof application === 'undefined')
        return;
    if (typeof application.getConfiguration().settings === 'undefined')
        return;
    /**
     * @type {{service:string,bcc:string}|*}
     */
    var opts = application.getConfiguration().settings['mail'] || application.getConfiguration().settings['mailSettings'];
    if (typeof opts === 'undefined' || opts === null)
        return;
    if (util.isArray(opts.bcc))
        self.options.bcc = opts.bcc.join(';');
    else if (typeof opts.bcc === 'string')
        self.options.bcc = opts.bcc;
}
if (typeof exports !== 'undefined') {
    module.exports = {
        MailHelper: MailerHelper,
        /**
         * Creates a new instance of MailHelper class.
         * @deprecated Use mailer.getMailer() instead
         * @param {HttpContext|*} context - An instance of HttpContext class which represents the current HTTP context.
         * @returns {MailerHelper}
         *
         * @example
         *
var mm = require("@themost/mailer");
mm.mailer(context)
    .to("user@example.com")
    .subject("Hello Message")
    .body("Hello User.").send(function(err, res) {
        return done(err);
    });
         */
        mailer: function(context) {
            return new MailerHelper(context);
        },
        /**
         * Creates a new instance of MailHelper class.
         * @param {HttpContext|*} context - An instance of HttpContext class which represents the current HTTP context.
         * @returns {MailerHelper}
         *
         * @example
         *
         var mm = require("@themost/mailer");
         mm.mailer(context)
         .to("user@example.com")
         .subject("Hello Message")
         .body("Hello User.").send(function(err, res) {
        return done(err);
    });
         */
        getMailer: function(context) {
            return new MailerHelper(context);
        }
    };
}

