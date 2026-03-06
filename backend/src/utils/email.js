const sgMail = require('@sendgrid/mail');
const { logger } = require('./logger');

// SendGrid設定
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// メールテンプレート
const emailTemplates = {
  'valuation-confirmation': {
    subject: '査定依頼を受け付けました - Quiet Estate Forge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">査定依頼を受け付けました</h2>
        <p>{{name}}様</p>
        <p>この度は、Quiet Estate Forgeの査定サービスをご利用いただき、誠にありがとうございます。</p>
        <p>以下の内容で査定依頼を受け付けました：</p>
        <ul>
          <li>依頼番号: {{requestId}}</li>
          <li>物件種別: {{propertyType}}</li>
          <li>住所: {{address}}</li>
        </ul>
        <p>担当者より2営業日以内にご連絡いたします。</p>
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Quiet Estate Forge<br>
          お問い合わせ: info@quietestateforge.com
        </p>
      </div>
    `
  },
  'valuation-notification': {
    subject: '新しい査定依頼が届きました',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">新しい査定依頼</h2>
        <p>新しい査定依頼が届きました：</p>
        <ul>
          <li>依頼番号: {{requestId}}</li>
          <li>お名前: {{name}}</li>
          <li>メール: {{email}}</li>
          <li>電話: {{phone}}</li>
          <li>物件種別: {{propertyType}}</li>
          <li>住所: {{address}}</li>
        </ul>
        <p>管理画面で詳細を確認してください。</p>
      </div>
    `
  },
  'valuation-result': {
    subject: '査定結果のご報告 - Quiet Estate Forge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">査定結果のご報告</h2>
        <p>{{name}}様</p>
        <p>査定が完了いたしましたので、結果をご報告いたします。</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0;">査定額</h3>
          <p style="font-size: 24px; font-weight: bold; color: #dc2626;">
            ¥{{estimatedPrice}}
          </p>
        </div>
        <p>詳細な査定レポートは、別途お送りいたします。</p>
        <p>ご質問やご相談がございましたら、お気軽にお問い合わせください。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Quiet Estate Forge<br>
          お問い合わせ: info@quietestateforge.com
        </p>
      </div>
    `
  },
  'moveout-confirmation': {
    subject: '退去申請を受け付けました - Quiet Estate Forge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">退去申請を受け付けました</h2>
        <p>{{name}}様</p>
        <p>この度は、Quiet Estate Forgeをご利用いただき、誠にありがとうございます。</p>
        <p>以下の内容で退去申請を受け付けました：</p>
        <ul>
          <li>申請番号: {{requestId}}</li>
          <li>物件ID: {{propertyId}}</li>
          <li>部屋番号: {{roomNumber}}</li>
          <li>退去希望日: {{moveoutDate}}</li>
        </ul>
        <p>担当者より2営業日以内にご連絡いたします。</p>
        <p>今後の流れ：</p>
        <ol>
          <li>担当者よりお電話にて詳細確認</li>
          <li>立会い日程の調整</li>
          <li>立会い実施・原状回復確認</li>
          <li>敷金精算・鍵返却</li>
        </ol>
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Quiet Estate Forge<br>
          お問い合わせ: info@quietestateforge.com
        </p>
      </div>
    `
  },
  'moveout-notification': {
    subject: '新しい退去申請が届きました',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">新しい退去申請</h2>
        <p>新しい退去申請が届きました：</p>
        <ul>
          <li>申請番号: {{requestId}}</li>
          <li>お名前: {{name}}</li>
          <li>メール: {{email}}</li>
          <li>電話: {{phone}}</li>
          <li>物件ID: {{propertyId}}</li>
          <li>部屋番号: {{roomNumber}}</li>
          <li>退去希望日: {{moveoutDate}}</li>
        </ul>
        <p>管理画面で詳細を確認してください。</p>
      </div>
    `
  },
  'moveout-confirmed': {
    subject: '退去申請が確認されました - Quiet Estate Forge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">退去申請が確認されました</h2>
        <p>{{name}}様</p>
        <p>退去申請を確認いたしました。</p>
        <p>退去日: {{moveoutDate}}</p>
        <p>立会いの日程調整について、改めてご連絡いたします。</p>
        <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Quiet Estate Forge<br>
          お問い合わせ: info@quietestateforge.com
        </p>
      </div>
    `
  },
  'moveout-completed': {
    subject: '退去手続きが完了しました - Quiet Estate Forge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">退去手続きが完了しました</h2>
        <p>{{name}}様</p>
        <p>退去手続きが完了いたしました。</p>
        <p>長い間、Quiet Estate Forgeをご利用いただき、誠にありがとうございました。</p>
        <p>またのご利用をお待ちしております。</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Quiet Estate Forge<br>
          お問い合わせ: info@quietestateforge.com
        </p>
      </div>
    `
  },
  'new-property-notification': {
    subject: '新しい物件が追加されました - Quiet Estate Forge',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">新しい物件が追加されました</h2>
        <p>{{name}}様</p>
        <p>保存された検索条件に一致する新しい物件が追加されました。</p>
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">{{propertyTitle}}</h3>
          <p>{{propertyDescription}}</p>
          <p><strong>価格:</strong> {{propertyPrice}}</p>
          <p><strong>住所:</strong> {{propertyAddress}}</p>
        </div>
        <p><a href="{{propertyUrl}}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">詳細を見る</a></p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Quiet Estate Forge<br>
          お問い合わせ: info@quietestateforge.com
        </p>
      </div>
    `
  }
};

// テンプレート変数の置換
const replaceTemplateVariables = (template, data) => {
  let html = template.html;
  let subject = template.subject;

  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, data[key] || '');
    subject = subject.replace(regex, data[key] || '');
  });

  return { html, subject };
};

// メール送信関数
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    let emailContent;

    if (template && emailTemplates[template]) {
      const templateData = replaceTemplateVariables(emailTemplates[template], data);
      emailContent = {
        to,
        subject: templateData.subject,
        html: templateData.html
      };
    } else {
      emailContent = {
        to,
        subject,
        html: html || text,
        text: text || html
      };
    }

    const msg = {
      ...emailContent,
      from: process.env.FROM_EMAIL || 'noreply@quietestateforge.com',
      replyTo: process.env.REPLY_TO_EMAIL || 'info@quietestateforge.com'
    };

    await sgMail.send(msg);
    logger.info('Email sent successfully', { to, subject: emailContent.subject });

    return { success: true };
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

// バルクメール送信
const sendBulkEmail = async (recipients, { subject, template, data, html, text }) => {
  try {
    const promises = recipients.map(recipient => 
      sendEmail({ 
        to: recipient.email, 
        subject, 
        template, 
        data: { ...data, name: recipient.name }, 
        html, 
        text 
      })
    );

    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    logger.info('Bulk email completed', { 
      total: recipients.length, 
      successful, 
      failed 
    });

    return { success: true, successful, failed };
  } catch (error) {
    logger.error('Bulk email sending failed:', error);
    throw error;
  }
};

// 通知メール送信
const sendNotificationEmail = async (user, notification) => {
  try {
    const data = {
      name: user.name,
      propertyTitle: notification.propertyTitle,
      propertyDescription: notification.propertyDescription,
      propertyPrice: notification.propertyPrice,
      propertyAddress: notification.propertyAddress,
      propertyUrl: `${process.env.FRONTEND_URL}/properties/${notification.propertyId}`
    };

    await sendEmail({
      to: user.email,
      template: 'new-property-notification',
      data
    });

    return { success: true };
  } catch (error) {
    logger.error('Notification email failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  sendNotificationEmail
};
