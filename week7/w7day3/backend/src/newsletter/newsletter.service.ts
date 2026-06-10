import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BrevoClient, BrevoError } from '@getbrevo/brevo';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private brevo: BrevoClient;
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.brevo = new BrevoClient({
      apiKey: this.configService.get<string>('BREVO_API_KEY') ?? '',
    });

    this.transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: 'ad5332001@smtp-brevo.com',
        pass: this.configService.get<string>('BREVO_SMTP_KEY'),
      },
    });
  }

  async subscribe(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const listId = Number(
      this.configService.get<string>('BREVO_LIST_ID') ?? 1,
    );
    const senderEmail =
      this.configService.get<string>('BREVO_SENDER_EMAIL') ??
      'noreply@circlechain.com';
    const senderName =
      this.configService.get<string>('BREVO_SENDER_NAME') ?? 'Circlechain';

    // 1. Add contact to Brevo list
    try {
      await this.brevo.contacts.createContact({
        email,
        listIds: [listId],
        updateEnabled: false, // Set to false to catch duplicates easily
      });
      this.logger.log(`Contact added to Brevo: ${email}`);
    } catch (err) {
      if (err instanceof BrevoError) {
        const isDuplicate =
          err.statusCode === 400 &&
          String(err.message).includes('duplicate_parameter');
        
        if (isDuplicate) {
          // THROW ERROR: This will show up as a red message in your UI
          throw new BadRequestException('This email is already subscribed to our newsletter!');
        }

        this.logger.error(`Brevo API error: ${err.message}`);
        throw new BadRequestException('Failed to subscribe. Please try again.');
      }
      throw err;
    }

    // 2. Send welcome email via SMTP (only if new subscription)
    try {
      await this.transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: email,
        subject: '🎉 Welcome to Circlechain!',
        html: this.buildWelcomeHtml(email),
      });
      this.logger.log(`Welcome email sent via SMTP to: ${email}`);
    } catch (err) {
      this.logger.error('SMTP Error:', err);
      // Non-fatal: contact is saved, just didn't get the email
    }

    return {
      success: true,
      message: 'Successfully subscribed to Circlechain updates!',
    };
  }

  private buildWelcomeHtml(email: string): string {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return `
<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#010010;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#010010;padding:40px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" 
      style="background:linear-gradient(135deg,#010010,#050025);border:1px solid rgba(115,253,170,0.3);border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
      <tr>
        <td style="background:linear-gradient(135deg,rgba(115,253,170,0.15),rgba(187,255,255,0.05));padding:40px;text-align:center;border-bottom:1px solid rgba(115,253,170,0.2);">
          <h1 style="color:#fff;font-size:32px;font-weight:700;margin:0 0 8px;">🔗 Circlechain</h1>
          <p style="color:#73FDAA;font-size:14px;margin:0;">Web3 Platform</p>
        </td>
      </tr>
      <tr>
        <td style="padding:48px 40px;text-align:center;">
          <h2 style="color:#fff;font-size:28px;font-weight:700;margin:0 0 16px;">Welcome aboard! 🎉</h2>
          <p style="color:rgba(255,255,255,0.75);font-size:16px;line-height:1.7;margin:0 0 24px;">
            You're now subscribed to Circlechain updates.<br/>
            Get the latest Web3 news, market trends, and platform features — delivered to your inbox.
          </p>
          <div style="background:rgba(115,253,170,0.08);border:1px solid rgba(115,253,170,0.3);border-radius:12px;padding:20px;margin:0 0 32px;text-align:left;">
            <p style="color:#73FDAA;font-size:14px;font-weight:600;margin:0 0 12px;">✅ What you'll receive:</p>
            <ul style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
              <li>Weekly market trend reports</li>
              <li>New feature announcements</li>
              <li>Exclusive trading tips</li>
              <li>Web3 ecosystem news</li>
            </ul>
          </div>
          <a href="${frontendUrl}" 
            style="display:inline-block;background:#73FDAA;color:#010010;text-decoration:none;font-weight:700;font-size:16px;padding:14px 40px;border-radius:20px;">
            Start Trading →
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.08);">
          <p style="color:rgba(255,255,255,0.3);font-size:12px;margin:0 0 8px;">Subscribed with: ${email}</p>
          <p style="color:rgba(255,255,255,0.2);font-size:11px;margin:0;">© 2022 Circlechain. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;
  }
}
