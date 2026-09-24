const nodemailer = require('nodemailer');

// Only create a transporter if credentials are configured
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const { EMAIL_USER, EMAIL_PASS } = process.env;
  if (!EMAIL_USER || !EMAIL_PASS) return null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
}

const fromName = () => process.env.EMAIL_FROM_NAME || 'Village Coders';
const fromAddress = () => process.env.EMAIL_USER || 'noreply@villagecoders.com';

function priorityColor(priority) {
  const colors = { Urgent: '#ef4444', High: '#f97316', Medium: '#0891b2', Low: '#22c55e' };
  return colors[priority] || '#0891b2';
}

function emailTemplate({ title, preheader, body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:32px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#0e7490,#0891b2);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Village Coders</h1>
          <p style="margin:4px 0 0;color:#bae6fd;font-size:13px;">Team Task &amp; Workflow Coordination</p>
        </td></tr>
        <tr><td style="background:#1e293b;padding:32px;border-radius:0 0 16px 16px;">
          ${body}
          <hr style="border:none;border-top:1px solid #334155;margin:28px 0;" />
          <p style="color:#64748b;font-size:12px;text-align:center;margin:0;">
            This is an automated notification from Village Coders Task Manager.<br />
            Log in to view your full task board.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendTaskAssignedEmail(task, assignee, assigner) {
  const t = getTransporter();
  if (!t) return;

  const deadlineStr = task.deadline
    ? new Date(task.deadline).toLocaleString('en-GB', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : 'Not specified';

  const pColor = priorityColor(task.priority);

  const body = `
    <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;">Hi <strong style="color:#e2e8f0;">${assignee.name}</strong>,</p>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">
      <strong style="color:#22d3ee;">${assigner.name}</strong> has assigned you a new task on Village Coders.
    </p>
    <div style="background:#0f172a;border:1px solid #334155;border-left:4px solid ${pColor};border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <h2 style="margin:0 0 10px;color:#f1f5f9;font-size:17px;">${task.title}</h2>
      ${task.description ? `<p style="margin:0 0 14px;color:#94a3b8;font-size:14px;line-height:1.6;">${task.description}</p>` : ''}
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        <tr>
          <td style="padding:4px 0;color:#64748b;font-size:13px;width:90px;">Priority</td>
          <td><span style="background:${pColor}22;color:${pColor};border:1px solid ${pColor}44;border-radius:999px;padding:2px 10px;font-size:12px;font-weight:600;">${task.priority}</span></td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#64748b;font-size:13px;">Deadline</td>
          <td style="color:#f1f5f9;font-size:13px;">${deadlineStr}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#64748b;font-size:13px;">Assigned by</td>
          <td style="color:#f1f5f9;font-size:13px;">${assigner.name} &lt;${assigner.email}&gt;</td>
        </tr>
      </table>
    </div>
    <p style="color:#94a3b8;font-size:14px;margin:0;">Log in to the app to accept, begin, or update the status of this task.</p>
  `;

  await t.sendMail({
    from: `"${fromName()}" <${fromAddress()}>`,
    to: `"${assignee.name}" <${assignee.email}>`,
    subject: `New Task Assigned: ${task.title}`,
    html: emailTemplate({ title: `New Task: ${task.title}`, preheader: `${assigner.name} assigned you: ${task.title}`, body }),
  });

  console.log(`Email sent to ${assignee.email} — task assigned`);
}

async function sendTaskStatusEmail(task, assignee, assigner, newStatus) {
  const t = getTransporter();
  if (!t || !assigner || !assigner.email) return;

  const isBlocked = newStatus === 'Cannot Do';
  const statusEmoji = { 'In Progress': 'Task In Progress', 'Completed': 'Task Completed', 'Cannot Do': 'Task Blocked', 'Pending': 'Task Pending' };
  const label = statusEmoji[newStatus] || 'Task Updated';

  const body = `
    <p style="color:#94a3b8;font-size:15px;margin:0 0 20px;">Hi <strong style="color:#e2e8f0;">${assigner.name}</strong>,</p>
    <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;">
      <strong style="color:#22d3ee;">${assignee.name}</strong> updated the status of a task you assigned.
    </p>
    <div style="background:#0f172a;border:1px solid ${isBlocked ? '#ef444444' : '#334155'};border-left:4px solid ${isBlocked ? '#ef4444' : priorityColor(task.priority)};border-radius:10px;padding:20px 24px;margin-bottom:24px;">
      <h2 style="margin:0 0 10px;color:#f1f5f9;font-size:17px;">${task.title}</h2>
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#64748b;font-size:13px;width:90px;">New Status</td>
          <td style="color:#f1f5f9;font-size:13px;font-weight:600;">${newStatus}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#64748b;font-size:13px;">Assigned to</td>
          <td style="color:#f1f5f9;font-size:13px;">${assignee.name}</td>
        </tr>
        ${isBlocked && task.cannotDoReason ? `
        <tr>
          <td style="padding:4px 0;color:#64748b;font-size:13px;vertical-align:top;">Reason</td>
          <td style="color:#fca5a5;font-size:13px;">${task.cannotDoReason}</td>
        </tr>` : ''}
      </table>
    </div>
    ${isBlocked ? `<p style="color:#fca5a5;font-size:14px;margin:0;"><strong>Action required:</strong> This task is blocked. Please log in to reassign or resolve the blocker.</p>` : `<p style="color:#94a3b8;font-size:14px;margin:0;">Log in to the task board to view the full details.</p>`}
  `;

  await t.sendMail({
    from: `"${fromName()}" <${fromAddress()}>`,
    to: `"${assigner.name}" <${assigner.email}>`,
    subject: `${label}: "${task.title}"`,
    html: emailTemplate({ title: `${label}: ${task.title}`, preheader: `${assignee.name} updated "${task.title}" to ${newStatus}`, body }),
  });

  console.log(`Email sent to ${assigner.email} — status: ${newStatus}`);
}

module.exports = { sendTaskAssignedEmail, sendTaskStatusEmail };
