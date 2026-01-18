export const EmailTemplates = {
  newsletter: {
    name: "Monthly Newsletter",
    subject: "Print Lab Studios: Monthly Refresh",
    html: `
<div style="font-family: Arial, sans-serif; bg-color: #000; color: #fff; padding: 20px;">
  <h1 style="color: #D4AF37;">PRINT LAB STUDIOS</h1>
  <p>Here's what's happening this month at the studio...</p>
  <hr style="border-color: #333;" />
  <h2>Artist Spotlight</h2>
  <p>[Insert Artist Name] dropped a fire mix this week!</p>
  <br />
  <a href="https://printlabstudios.com" style="background-color: #D4AF37; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold;">BOOK A SESSION</a>
</div>`
  },
  promo: {
    name: "Session Discount",
    subject: "Exclusive Offer: 20% Off Your Next Session",
    html: `
<div style="font-family: 'Arial', sans-serif; background-color: #111; color: #eee; padding: 40px; text-align: center; border: 1px solid #333;">
  <h1 style="color: #D4AF37; font-size: 36px; margin-bottom: 10px;">LIMITED TIME OFFER</h1>
  <p style="font-size: 18px; color: #ccc;">Unlock your creativity for less.</p>
  <div style="margin: 30px 0; border: 2px dashed #D4AF37; padding: 20px; display: inline-block;">
    <span style="display: block; font-size: 14px; color: #888;">USE CODE:</span>
    <span style="display: block; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #fff;">PRINT20</span>
  </div>
  <p>Valid for bookings made within the next 48 hours for Studio A.</p>
  <br />
  <a href="https://printlabstudios.com/book" style="background-color: #D4AF37; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; border-radius: 5px;">CLAIM NOW</a>
</div>`
  },
  maintenance: {
    name: "Studio Update",
    subject: "Important: Studio Maintenance Update",
    html: `
<div style="font-family: sans-serif; color: #333;">
  <h3>Studio Update</h3>
  <p>We are upgrading our equipment in Studio B on <strong>[Date]</strong>.</p>
  <p>Sessions will resume as normal the day after. Thank you for your patience as we elevate the experience.</p>
</div>`
  }
};
