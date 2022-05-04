const {MailHelper} = require('../index');
const { TestApplication } = require('./TestApplication');


describe('MailHelper', () => {

    let app;
    beforeAll(() => {
        app = new TestApplication();
    })

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
                .cc('user2@example.com').sendAsync()
        ).toBeResolved();
    });

});