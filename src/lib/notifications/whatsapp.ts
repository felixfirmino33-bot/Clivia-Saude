import { WhatsAppNotificationPayload } from '../../types';

export function formatPriceAOA(amount?: number): string {
  if (amount === undefined || amount === null) return 'Sob Consulta';
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    maximumFractionDigits: 0
  }).format(amount).replace('AOA', 'Kz');
}

export function buildPatientWhatsAppMessage(payload: WhatsAppNotificationPayload, appointmentId: string): string {
  return `*CLÍVIA SAÚDE — CONFIRMAÇÃO DE MARCAÇÃO* 🩺✨

Olá, *${payload.patientName}*! A sua marcação foi realizada com sucesso através da plataforma Clívia Saúde.

📌 *Detalhes da Consulta:*
• *Clínica:* ${payload.clinicName}
• *Serviço / Exame:* ${payload.serviceName}
${payload.doctorName ? `• *Médico:* ${payload.doctorName}\n` : ''}• *Data:* ${payload.appointmentDate}
• *Horário:* ${payload.appointmentTime}
• *Endereço:* ${payload.clinicAddress}
• *Valor:* ${formatPriceAOA(payload.priceAOA)}

🔖 *Código de Confirmação:* \`${appointmentId.slice(-6).toUpperCase()}\`

⚠️ *Importante:* Chegue 10 minutos antes com documento de identificação (B.I.). Em caso de imprevisto, responda a esta mensagem para remarcar.

_Clívia Saúde — Encontre a saúde que precisa em Angola_ 🇦🇴`;
}

export function buildClinicWhatsAppMessage(payload: WhatsAppNotificationPayload, appointmentId: string): string {
  return `*CLÍVIA SAÚDE — NOVA MARCAÇÃO RECEBIDA* 🔔

Uma nova marcação foi confirmada na sua clínica:

👤 *Paciente:* ${payload.patientName}
📞 *Contacto:* ${payload.toPhone}
🩺 *Serviço:* ${payload.serviceName}
${payload.doctorName ? `👨‍⚕️ *Médico:* ${payload.doctorName}\n` : ''}📅 *Data & Hora:* ${payload.appointmentDate} às ${payload.appointmentTime}
💰 *Preço Registado:* ${formatPriceAOA(payload.priceAOA)}
🆔 *ID Marcação:* #${appointmentId.slice(-6).toUpperCase()}

Por favor, garanta a reserva da sala/médico na vossa receção.`;
}

export function generateWhatsAppDirectLink(phoneNumber: string, message: string): string {
  // Normalize phone number for Angola (+244)
  let cleanNumber = phoneNumber.replace(/\D/g, '');
  if (!cleanNumber.startsWith('244') && (cleanNumber.startsWith('9') || cleanNumber.length === 9)) {
    cleanNumber = '244' + cleanNumber;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export async function sendWhatsAppNotification(payload: WhatsAppNotificationPayload, appointmentId: string): Promise<boolean> {
  const apiUrl = import.meta.env.WHATSAPP_API_URL || '';
  const apiToken = import.meta.env.WHATSAPP_API_TOKEN || '';

  if (!apiUrl) {
    // If external n8n/WhatsApp gateway is not configured, we provide direct WhatsApp Web / App action
    return true;
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiToken ? { 'Authorization': `Bearer ${apiToken}` } : {})
      },
      body: JSON.stringify({
        phone: payload.toPhone,
        message: buildPatientWhatsAppMessage(payload, appointmentId),
        appointmentId,
        metadata: payload
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}
