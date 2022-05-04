const { ConfigurationBase } = require("@themost/common");

const testConfiguration = {
    "host": "127.0.0.1",
    "port": 1025,
    "secure": false,
    "ignoreTLS": true,
    "from": "Test Mail Services <mailer@example.com>",
} 

class TestContext {
    constructor(app) {
        this.application = app;
    }
}

class TestApplication {

    constructor(cwd) {
        this.configuration = new ConfigurationBase(cwd);
        this.configuration.setSourceAt('settings/mail', testConfiguration);
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