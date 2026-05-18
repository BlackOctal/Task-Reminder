import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface ReminderEmailData {
  to: string
  taskTitle: string
  taskDescription?: string
  reminderTitle: string
  reminderMessage?: string
  dueDate?: string
  taskUrl: string
}

export const sendReminderEmail = async (data: ReminderEmailData) => {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">Task Reminder</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="margin-bottom: 30px;">
                <h2 style="margin: 0 0 10px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                  ${data.reminderTitle}
                </h2>
                ${data.reminderMessage ? `
                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    ${data.reminderMessage}
                  </p>
                ` : ''}
              </div>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px; font-weight: 600;">
                  Task Details
                </h3>
                <div style="margin-bottom: 8px;">
                  <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Title:</span>
                  <span style="color: #1f2937; font-size: 14px; margin-left: 8px;">${data.taskTitle}</span>
                </div>
                ${data.taskDescription ? `
                  <div style="margin-bottom: 8px;">
                    <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Description:</span>
                    <div style="color: #1f2937; font-size: 14px; margin-top: 4px;">${data.taskDescription}</div>
                  </div>
                ` : ''}
                ${data.dueDate ? `
                  <div>
                    <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Due Date:</span>
                    <span style="color: #1f2937; font-size: 14px; margin-left: 8px;">${data.dueDate}</span>
                  </div>
                ` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="${data.taskUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  View Task
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                This is an automated reminder from your AI Assistant TODO App
              </p>
              <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">
                You can manage your tasks at <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #667eea; text-decoration: none;">${process.env.NEXT_PUBLIC_APP_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: data.to,
      subject: `Reminder: ${data.reminderTitle}`,
      html: htmlContent,
    })

    return { success: true, data: response }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

export const sendTaskCreatedEmail = async (data: {
  to: string
  taskTitle: string
  taskDescription?: string
  taskUrl: string
}) => {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Task Created</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">New Task Created</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">
                A new task has been created by your AI assistant.
              </p>
              
              <div style="background-color: #f9fafb; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 16px; font-weight: 600;">
                  ${data.taskTitle}
                </h3>
                ${data.taskDescription ? `
                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    ${data.taskDescription}
                  </p>
                ` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="${data.taskUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                  View Task
                </a>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                AI Assistant TODO App
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: data.to,
      subject: `New Task: ${data.taskTitle}`,
      html: htmlContent,
    })

    return { success: true, data: response }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}
