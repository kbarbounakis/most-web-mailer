/**
 * @license
 * MOST Web Framework 2.0 Codename Blueshift
 * Copyright (c) 2017, THEMOST LP All rights reserved
 *
 * Use of this source code is governed by an BSD-3-Clause license that can be
 * found in the LICENSE file at https://themost.io/license
 */

export declare interface MailerHelper {
    context: any;
    body(body: string): MailerHelper;
    text(text: string): MailerHelper;
    subject(subject: string): MailerHelper;
    from(sender: string): MailerHelper;
    replyTo(reply: string): MailerHelper;
    attachments(...attachment:string[]): MailerHelper;
    to(recipient: string): MailerHelper;
    transporter(opts: any): MailerHelper;
    test(value?: boolean): MailerHelper;
    cc(...cc: string[]): MailerHelper;
    bcc(...bcc: string[]): MailerHelper;
    template(template: string): MailerHelper;
    send(data: any, callback: (err?: Error, res?: any) => void);

}

export declare function getMailer(context: any): MailerHelper;