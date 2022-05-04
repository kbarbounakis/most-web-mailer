const {MailHelper} = require('../index');
const { TestApplication } = require('./TestApplication');
const path = require('path');

describe('MailHelper', () => {

    let app;
    beforeAll(() => {
        app = new TestApplication(path.resolve(__dirname, 'test-app'));
    });

    it('should create instance', () => {
        const mailer = new MailHelper();
        expect(mailer).toBeTruthy();
    });
    it('should send text', async () => {
        /**
         * @type {MailHelper}
         */
        const mailer = new MailHelper();
        const result = await mailer.subject('New Text Message').text('Hello World!').to('user1@example.com').test(true).sendAsync();
        expect(result).toBeTruthy();
        expect(result.to).toEqual('user1@example.com');
    });

    it('should send html', async () => {
        const context = app.createContext();
        /**
         * @type {MailHelper}
         */
        const mailer = new MailHelper(context);
        await expectAsync(
            mailer.subject('New Mail Message')
                .body(`<h1>Hello World</h1>`)
                .to('user1@example.com')
                .cc('user2@example.com', 'user3@example.com')
                .bcc('admin1@example.com')
                .replyTo('services1@example.com')
                .sendAsync()
        ).toBeResolved();
    });

    it('should send mail template', async () => {
        const context = app.createContext();
        /**
         * @type {MailHelper}
         */
        const mailer = new MailHelper(context);
        await expectAsync(
            mailer.subject('New mail message from template')
                .template('test-message')
                .to('user1@example.com')
                .replyTo('services1@example.com')
                .sendAsync()
        ).toBeResolved();
    });

});