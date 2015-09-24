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
var util = require('util'),
    path = require('path'),
    nodemailer = require('nodemailer'),
    async = require('async'),
    fs = require('fs');

/**
 * @class MailerHelper
 * @params {HttpContext} context
 * @constructor
 */
function MailerHelper(context) {
    this.context = context;
    this.options = { test: false, to:[] };
}

/**
 * @param {string} template
 */
MailerHelper.prototype.template = function(template) {
    if (typeof template === 'string') {
        delete this.options.text;
        delete this.options.body;
        this.options.template = template;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * @param {string} body
 */
MailerHelper.prototype.body = function(body) {
    if (typeof body === 'string') {
        delete this.options.text;
        delete this.options.template;
        this.options.body = body;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Applies plain text to mail template
 * @param {string} text
 */
MailerHelper.prototype.text = function(text) {
    if (typeof text === 'string') {
        delete this.options.body;
        delete this.options.template;
        this.options.text = text;
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Sets mail subject
 * @param {string} subject
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
 * @param {string} sender
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
 * Applies mail primary recipients.
 * @param {string|Array} recipient
 * @returns {MailerHelper}
 */
MailerHelper.prototype.to = function(recipient) {
    if (util.isArray(recipient)) {
        this.options.to = recipient;
    }
    else if (typeof recipient === 'string') {
        this.options.to = [];
        this.options.to.push(recipient);
    }
    else {
        var er = new Error('Invalid argument. Expected string or array of strings.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * Applies mail secondary recipients.
 * @param {{service:string,host:string,port:string,auth:{user:string,pass:string,xoauth2:string},secure:boolean,ignoreTLS:boolean}|*} opts
 * @returns {MailerHelper}
 */
MailerHelper.prototype.transporter = function(opts) {
    this.options.transporter = opts;
    return this;
};

/**
 * Applies mail test operation.
 * @param {boolean} value
 * @returns {MailerHelper}
 */
MailerHelper.prototype.test = function(value) {
    this.options.test = !!value;
    return this;
};

/**
 * Applies mail secondary recipients.
 * @param {string|Array} cc
 * @returns {MailerHelper}
 */
MailerHelper.prototype.cc = function(cc) {
    if (util.isArray(cc)) {
        this.options.cc = cc;
    }
    else if (typeof cc === 'string') {
        this.options.cc = [];
        this.options.cc.push(cc);
    }
    else {
        var er = new Error('Invalid argument. Expected string or array of strings.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};
/**
 * Applies mail other recipients.
 * @param {string|Array} bcc
 * @returns {MailerHelper}
 */
MailerHelper.prototype.bcc = function(bcc) {
    if (util.isArray(bcc)) {
        this.options.bcc = bcc;
    }
    else if (typeof bcc === 'string') {
        this.options.bcc = [];
        this.options.bcc.push(cc);
    }
    else {
        var er = new Error('Invalid argument. Expected string.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};
/**
 * Sends the mail.
 * @param {*} data
 * @param {function(Error=,*=)} callback
 */
MailerHelper.prototype.send = function(data, callback) {
    callback = callback || function() {};
    var transporter, er, self = this, context = self.context;
    try {
        if (!self.options.test) {
            if (typeof this.options.transporter === 'undefined' || this.options.transporter==null) {
                //get default transporter
                transporter = getDefaultTransporter(context);
                if (typeof transporter === 'undefined' || transporter==null) {
                    er = new Error('An error occured while initializing mail transporter.'); er.code = 'ESEND';
                    callback(er);
                }
            }
            else {
                transporter = nodemailer.createTransport(self.options.transporter);
            }
        }
        //get default sender (from application settings)
        var from = getDefaultSender(context),
            //get default bcc recipients (from application settings)
            bcc = getDefaultBCC(context);
        //if default bcc recipients are defined
        if (typeof self.options.bcc === 'undefined' && typeof bcc !== 'undefined') {
            //check if it's an array
            if (util.isArray('bcc')) {
                //and push items in mail bcc property
                self.options.bcc = bcc.slice(0);
            }
            //else if bcc is a string
            else if (typeof bcc === 'string') {
                //split and push default bcc recipients
                self.options.bcc = bcc.split(';');
            }
        }
        //create mail object
        var mail = {
            from: self.options.from || from,
            to: self.options.to.join(';')
        };

        if (!util.isArray(mail.to)) {
            er = new Error('Invalid mail recipients. Expected array.'); er.code = 'EARG';
            return callback(er);
        }
        if (mail.to.length==0) {
            er = new Error('Invalid mail recipients. Expected array.'); er.code = 'EARG';
            return callback(new Error('Invalid mail recipients. Recipients list cannot be empty.'));
        }
        //copy properties (subject, cc, bcc)
        if (self.options.subject) { mail.subject = self.options.subject; }
        if (self.options.cc) { mail.cc = self.options.cc.join(';'); }
        if (self.options.bcc) { mail.bcc = self.options.bcc.join(';'); }
        //initialize view engine
        if (typeof self.options.body === 'string') {
            mail.html = self.options.body;
            //finally send email
            if (self.options.test) { return callback(null, mail); }
            transporter.sendMail(mail, function (err, info) {
                if (err) { callback(err); }
                callback(null, info.response)
            });
        }
        else if (typeof self.options.text === 'string') {
            mail.text = self.options.text;
            if (self.options.test) { return callback(null, mail); }
            //finally send email
            transporter.sendMail(mail, function (err, info) {
                if (err) { callback(err); }
                callback(null, info.response)
            });

        }
        else if (typeof self.options.template === 'string') {
            var engines = context.application.config.engines;
            async.eachSeries(engines,function(item, cb) {
                try {
                    var templatePath = context.application.mapPath(util.format('/templates/mails/%s/html.%s' , self.options.template, item.extension));
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
                                if (self.options.test) { return cb(mail); }
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
                    er = new Error('Mail template cannot be found or refers to a template engine which is not implemented by this application.');er.code = 'ETMPL';
                    callback(er)
                }
            });
        }
    }
    catch(e) {
        callback(e);
    }
};
/**
 * Get MOST Web application default mail transporter as is is defined in settings#mail section
 * @param {HttpContext} context
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
    if (typeof application.config.settings === 'undefined')
        return;
    /**
     * @type {{service:string}|*}
     */
    var options = application.config.settings['mail'] || application.config.settings['mailSettings'];
    if (typeof options === 'undefined' || options == 'null')
        return;
    return nodemailer.createTransport(options);
}

function getDefaultSender(context) {
    if (typeof context === 'undefined')
        return;
    /**
     * @type {HttpApplication}
     */
    var application = context.application;
    if (typeof application === 'undefined')
        return;
    if (typeof application.config.settings === 'undefined')
        return;
    /**
     * @type {{service:string}|*}
     */
    var options = application.config.settings['mail'] || application.config.settings['mailSettings'];
    if (typeof options === 'undefined' || options == 'null')
        return;
    return options.from;
}

function getDefaultBCC(context) {
    if (typeof context === 'undefined')
        return;
    /**
     * @type {HttpApplication}
     */
    var application = context.application;
    if (typeof application === 'undefined')
        return;
    if (typeof application.config.settings === 'undefined')
        return;
    /**
     * @type {{service:string}|*}
     */
    var options = application.config.settings['mail'] || application.config.settings['mailSettings'];
    if (typeof options === 'undefined' || options == 'null')
        return;
    return options.bcc;
}

if (typeof exports !== 'undefined') {
    module.exports = {
        /**
         *
         * @param {HttpContext} context
         * @returns {MailerHelper}
         */
        mailer: function(context) {
            return new MailerHelper(context);
        }
    };
}

