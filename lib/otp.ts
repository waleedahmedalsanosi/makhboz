// التحقق عبر واتساب — يعمل فقط عند ضبط متغيري البيئة:
// WHATSAPP_API_URL  (مثال Meta Cloud API: https://graph.facebook.com/v20.0/{phone_number_id}/messages)
// WHATSAPP_API_TOKEN
export function otpEnabled() {
  return !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN)
}

export function normalizePhone(raw: string) {
  let p = raw.replace(/\D/g, '')
  if (p.startsWith('00')) p = p.slice(2)
  if (p.startsWith('05')) p = '966' + p.slice(1)
  if (p.startsWith('5') && p.length === 9) p = '966' + p
  return p
}

export async function sendWhatsAppMessage(phone: string, text: string) {
  const res = await fetch(process.env.WHATSAPP_API_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: text },
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`whatsapp send failed: ${res.status}`)
}
