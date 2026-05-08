import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    let emailContent = '';
    let subject = '';

    if (type === 'booking') {
      subject = `New Booking Inquiry: ${data.organization}`;
      emailContent = `
        <h1>New Booking Inquiry</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Organization:</strong> ${data.organization}</p>
        <p><strong>Sport:</strong> ${data.sport}</p>
        <p><strong>Details:</strong> ${data.details}</p>
      `;
    } else if (type === 'bighead') {
      subject = `New Big Head Order Request: ${data.customerInfo.name}`;
      emailContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
          <h1 style="color: #E02826; border-bottom: 4px solid #E02826; padding-bottom: 10px;">New Big Head Order Request</h1>
          
          <h3 style="text-transform: uppercase; letter-spacing: 1px; color: #666;">Customer Information</h3>
          <p><strong>Name:</strong> ${data.customerInfo.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${data.customerInfo.email}">${data.customerInfo.email}</a></p>
          <p><strong>Phone:</strong> ${data.customerInfo.phone}</p>
          <p><strong>Address:</strong> ${data.customerInfo.address}, ${data.customerInfo.city}, ${data.customerInfo.state} ${data.customerInfo.zip}</p>
          
          <h3 style="text-transform: uppercase; letter-spacing: 1px; color: #666; margin-top: 30px;">Order Details</h3>
          <ul style="list-style: none; padding: 0;">
            ${data.items.map((item: any) => `
              <li style="background: #f4f4f4; padding: 15px; margin-bottom: 10px; border-left: 4px solid #E02826;">
                <p style="margin: 0;"><strong>${item.style}</strong> x ${item.quantity}</p>
                ${item.customName ? `<p style="margin: 5px 0 0 0; color: #E02826; font-weight: bold; text-transform: uppercase;">Name on Head: ${item.customName}</p>` : ''}
                <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #666;">
                  <strong>File:</strong> <a href="${item.fileUrl}" style="color: #E02826; text-decoration: underline;">${item.fileName}</a>
                </p>
              </li>
            `).join('')}
          </ul>
          
          <h2 style="color: #E02826; margin-top: 30px;">TOTAL INVOICE AMOUNT: $${data.totalAmount.toFixed(2)}</h2>
          <p style="font-style: italic; color: #999; font-size: 0.8em; margin-top: 20px;">Note: This order was submitted without payment. Please send an invoice to the customer.</p>
        </div>
      `;
    }

    const { data: resData, error } = await resend.emails.send({
      from: 'iHatePictureDay <info@ihatepictureday.com>', 
      to: ['maxx@ihatepictureday.com'], 
      subject: subject,
      html: emailContent,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(resData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
