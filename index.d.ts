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
    sendAsync(data: any): Promise<void>;

}

export declare function getMailer(context: any): MailerHelper;
