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
 * @params {HttpContext|*} context
 * @constructor
 */
function MailerHelper(context) {
    this.context = context;
    this._test = false;
    this.options = { };
}

/**
 * @param {string} template
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
 * @param {string} body
 * @returns {MailerHelper}
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
 * Applies plain text to mail template
 * @param {string} text
 * @returns {MailerHelper}
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
 * Sets mail subject
 * @param {string} subject
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
 * @param {string|Array} reply
 * @returns {MailerHelper}
 */
MailerHelper.prototype.replyTo = function(reply) {
    if (util.isArray(reply)) {
        this.options.reply = reply.join(';');
    }
    else if (typeof reply === 'string') {
        this.options.reply = reply;
    }
    else {
        var er = new Error('Invalid argument. Expected string or array.'); er.code = 'EARG';
        throw(er);
    }
    return this;
};

/**
 * @param {string|Array} p
 * @returns {MailerHelper}
 */
MailerHelper.prototype.attachments = function(p) {
    var self = this;

    var arr = [];
    if (util.isArray(p)) {
        arr = p.slice(0)
    }
    else if (arguments.length>1) {
        arr.push.apply(arr, arguments);
    }
    else if (typeof p === 'string') {
        arr.push(p);
    }
    else {
        var er = new Error('Invalid argument. Expected string or array.'); er.code = 'EARG';
        throw(er);
    }
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
 * Applies mail primary recipients.
 * @param {string|Array} recipient
 * @returns {MailerHelper}
 */
MailerHelper.prototype.to = function(recipient) {
    if (util.isArray(recipient)) {
        this.options.to = recipient.join(';');
    }
    else if (typeof recipient === 'string') {
        this.options.to = recipient;
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
    this._transporter = opts;
    return this;
};

/**
 * Applies mail test operation.
 * @param {boolean} value
 * @returns {MailerHelper}
 */
MailerHelper.prototype.test = function(value) {
    this._test = !!value;
    return this;
};

/**
 * Applies mail secondary recipients.
 * @param {string|Array} cc
 * @returns {MailerHelper}
 */
MailerHelper.prototype.cc = function(cc) {
    if (util.isArray(cc)) {
        this.options.cc = cc.join(';');
    }
    else if (typeof cc === 'string') {
        this.options.cc = cc;
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
        this.options.bcc = bcc.join(';');
    }
    else if (typeof bcc === 'string') {
        this.options.bcc = bcc;
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
        if (!self._test) {
            if (typeof self._transporter === 'undefined' || self._transporter==null) {
                //get default transporter
                transporter = getDefaultTransporter(context);
                if (typeof transporter === 'undefined' || transporter==null) {
                    er = new Error('An error occured while initializing mail transporter.'); er.code = 'ESEND';
                    callback(er);
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

        if (typeof self.options.to === 'undefined' || self.options.to == null) {
            er = new Error('Invalid mail recipients. Recipients list cannot be empty.'); er.code = 'EARG';
            return callback(er);
        }
        if (self.options.to.length==0) {
            er = new Error('Invalid mail recipients. Expected array.'); er.code = 'EARG';
            return callback(new Error('Invalid mail recipients. Recipients list cannot be empty.'));
        }

        //create mail object
        var mail = self.options;
        if (typeof self.options.html === 'string' || typeof self.options.text === 'string') {
            //finally send email
            if (self._test) { return callback(null, mail); }
            transporter.sendMail(mail, function (err, info) {
                if (err) { callback(err); }
                callback(null, info.response)
            });
        }
        //initialize view engine
        else if (typeof self.template === 'string') {
            var engines = context.application.config.engines;
            async.eachSeries(engines,function(item, cb) {
                try {
                    var templatePath = context.application.mapPath(util.format('/templates/mails/%s/html.%s' , self.template, item.extension));
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
    if (typeof application.config.settings === 'undefined')
        return;
    /**
     * @type {{service:string,from:string}|*}
     */
    var opts = application.config.settings['mail'] || application.config.settings['mailSettings'];
    if (typeof opts === 'undefined' || opts == 'null')
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
    if (typeof application.config.settings === 'undefined')
        return;
    /**
     * @type {{service:string,bcc:string}|*}
     */
    var opts = application.config.settings['mail'] || application.config.settings['mailSettings'];
    if (typeof opts === 'undefined' || opts == 'null')
        return;
    if (util.isArray(opts.bcc))
        self.options.bcc = opts.bcc.join(';');
    else if (typeof opts.bcc === 'string')
        self.options.bcc = opts.bcc;
}

if (typeof exports !== 'undefined') {
    module.exports = {
        /**
         *
         * @param {HttpContext|*} context
         * @returns {MailerHelper}
         */
        mailer: function(context) {
            return new MailerHelper(context);
        }
    };
}

