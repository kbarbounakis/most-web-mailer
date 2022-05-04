const { ConfigurationBase } = require("@themost/common");
const { resolve } = require('path');
const ejs = require('ejs');
const testConfiguration = {
    "host": "127.0.0.1",
    "port": 1025,
    "secure": false,
    "ignoreTLS": true,
    "from": "Test Mail Services <mailer@example.com>",
    "bcc": "support1@example.com"
} 

class TestContext {
    constructor(app) {
        this.application = app;
    }
    // eslint-disable-next-line no-unused-vars
    engine(extension) {
        const engines = this.application.getConfiguration().getSourceAt('engines');
        const engine = engines.find((item) => {
            return item.extension === extension;
        });
        if (engine.extension === 'ejs') {
            return {
                render(template, data, callback) {
                    return ejs.renderFile(template, data || {}, callback);
                }
            }
        }
    }
}

class TestApplication {

    constructor(cwd) {
        this.executionPath = cwd;
        this.configuration = new ConfigurationBase(resolve(cwd, 'config'));
        this.configuration.setSourceAt('settings/mail', testConfiguration);
        this.configuration.setSourceAt('engines', [
            {
                extension: 'ejs',
                type: 'ejs'
            }
        ]);
    }
    
    // eslint-disable-next-line no-unused-vars
    useStrategy(serviceCtor) {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line no-unused-vars
    useService(serviceCtor) {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line no-unused-vars
    hasService(serviceCtor) {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line no-unused-vars
    getService(serviceCtor) {
        throw new Error('Method not implemented.');
    }
    getConfiguration() {
        return this.configuration;
    }

    createContext() {
        return new TestContext(this);
    }

}

module.exports = {
    TestApplication
}