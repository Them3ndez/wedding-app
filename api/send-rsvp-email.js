import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, attending } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  const isAttending = attending !== 'no'

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your RSVP — Wendy &amp; Guillermo</title>
</head>
<body style="margin:0;padding:0;background:#f2ede6;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2ede6;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffdf9;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(28,28,30,0.08);">

          <!-- Header band -->
          <tr>
            <td style="background:#2D6A4F;padding:40px 48px;text-align:center;">
              <p style="margin:0 0 6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                February 7, 2027
              </p>
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:400;color:#ffffff;letter-spacing:0.04em;">
                Wendy &amp; Guillermo
              </h1>
              <p style="margin:10px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.6);">
                Quinta el Pedregal &nbsp;·&nbsp; Mascota, Jalisco, México
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 40px;">

              <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#3a3530;">
                Dear ${name},
              </p>

              ${isAttending ? `
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#3a3530;">
                We are so thrilled to let you know that your RSVP has been received — and we cannot wait to celebrate with you.
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#3a3530;">
                Please mark your calendar and start planning your trip to the beautiful mountains of Jalisco. It is going to be a magical evening surrounded by the people we love most.
              </p>

              <!-- Confirmation box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="background:#f2ede6;border-left:3px solid #2D6A4F;border-radius:0 8px 8px 0;padding:20px 24px;">
                    <p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#2D6A4F;">
                      Your RSVP is Confirmed
                    </p>
                    <p style="margin:0 0 4px;font-size:15px;color:#3a3530;"><strong>Date:</strong> Saturday, February 7, 2027</p>
                    <p style="margin:0 0 4px;font-size:15px;color:#3a3530;"><strong>Venue:</strong> Quinta el Pedregal</p>
                    <p style="margin:0;font-size:15px;color:#3a3530;"><strong>Location:</strong> Mascota, Jalisco, México</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#3a3530;">
                If you have any questions in the meantime, do not hesitate to reach out — simply reply to this email and it will land directly with us.
              </p>
              <p style="margin:0;font-size:16px;line-height:1.7;color:#3a3530;">
                With so much love and gratitude,
              </p>
              ` : `
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#3a3530;">
                Thank you so much for letting us know. We completely understand, and we will miss you dearly on our special day.
              </p>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#3a3530;">
                Please know that you are in our hearts, and we hope to celebrate with you in some way soon.
              </p>
              <p style="margin:0;font-size:16px;line-height:1.7;color:#3a3530;">
                With all our love,
              </p>
              `}

              <p style="margin:8px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-style:italic;color:#2D6A4F;">
                Wendy &amp; Guillermo
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 48px 36px;border-top:1px solid #ede9e2;text-align:center;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:11px;letter-spacing:0.08em;color:#9c9690;text-transform:uppercase;">
                Quinta el Pedregal &nbsp;·&nbsp; Mascota, Jalisco, México &nbsp;·&nbsp; February 7, 2027
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

  try {
    await resend.emails.send({
      from: 'rsvp@wendyandguillermo.com',
      to: email,
      replyTo: 'wendyandguillermo2027@gmail.com',
      subject: isAttending
        ? 'We cannot wait to see you — Wendy & Guillermo'
        : 'Thank you for letting us know — Wendy & Guillermo',
      html,
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    return res.status(500).json({ error: err.message })
  }
}
