// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved

export declare class MailerHelper {
    context: any;
    constructor(context: any);
    body(body: string): this;
    text(text: string): this;
    subject(subject: string): this;
    from(sender: string): this;
    replyTo(reply: string): this;
    attachments(...attachment:string[]): this;
    to(recipient: string): this;
    transporter(opts: any): this;
    test(value?: boolean): this;
    cc(...cc: string[]): this;
    bcc(...bcc: string[]): this;
    template(template: string): this;
    send(data: any, callback: (err?: Error, res?: any) => void): void;
    sendAsync(data: any): Promise<any>;

}

export declare function getMailer(context: any): MailerHelper;
