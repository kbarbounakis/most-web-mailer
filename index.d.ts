// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2022, THEMOST LP All rights reserved

import { ConfigurationBase } from "@themost/common";

export interface MailHelperApplication {
    getConfiguration(): ConfigurationBase
}

export interface MailHelperTemplateEngine {
    render(templatePath: string, data: any, callback: (err?: Error, res?: any) => void): void;
}

export interface MailHelperContext {
    application: MailHelperApplication;
    engine(extension: string): MailHelperTemplateEngine
}


export declare class MailerHelper {
    context: MailHelperContext | any;
    constructor(context: MailHelperContext | any);
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
