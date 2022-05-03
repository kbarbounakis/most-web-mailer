const {MailHelper} = require('../index');
describe('MailHelper', () => {
    it('should create instance', () => {
        const mailer = new MailHelper();
        expect(mailer).toBeTruthy();
    });
});