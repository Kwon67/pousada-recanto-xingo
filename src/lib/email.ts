import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailConfirmacaoData {
  reservaId: string;
  hospedeNome: string;
  hospedeEmail: string;
  quartoNome: string;
  checkIn: string;
  checkOut: string;
  numHospedes: number;
  noites: number;
  valorTotal: number;
}

export async function enviarEmailConfirmacao(data: EmailConfirmacaoData): Promise<{ success: boolean; error?: string }> {
  try {
    const checkInFormatado = formatarData(data.checkIn);
    const checkOutFormatado = formatarData(data.checkOut);
    const valorFormatado = data.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDF8F0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color:#2D6A4F;padding:32px 40px;text-align:center;">
              <h1 style="color:#FDF8F0;margin:0;font-size:24px;font-weight:700;">
                Pousada Recanto do Matuto Xing&oacute;
              </h1>
              <p style="color:#D4A843;margin:8px 0 0;font-size:14px;">
                Seu ref&uacute;gio &agrave;s margens do Canyon do Xing&oacute;
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#2D6A4F;margin:0 0 8px;font-size:22px;">Reserva Confirmada!</h2>
              <p style="color:#666;margin:0 0 24px;font-size:15px;line-height:1.6;">
                Ol&aacute;, <strong>${data.hospedeNome}</strong>! Sua reserva foi recebida com sucesso. Confira os detalhes abaixo:
              </p>

              <!-- Reservation Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F5F0;border-radius:12px;padding:24px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 0 12px;border-bottom:1px solid #E8E0D4;">
                          <span style="color:#999;font-size:12px;text-transform:uppercase;">C&oacute;digo da Reserva</span><br>
                          <strong style="color:#2D6A4F;font-size:18px;">${data.reservaId}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E8E0D4;">
                          <span style="color:#999;font-size:12px;text-transform:uppercase;">Quarto</span><br>
                          <strong style="color:#1B3A4B;font-size:15px;">${data.quartoNome}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E8E0D4;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <span style="color:#999;font-size:12px;text-transform:uppercase;">Check-in</span><br>
                                <strong style="color:#1B3A4B;font-size:15px;">${checkInFormatado}</strong>
                              </td>
                              <td width="50%">
                                <span style="color:#999;font-size:12px;text-transform:uppercase;">Check-out</span><br>
                                <strong style="color:#1B3A4B;font-size:15px;">${checkOutFormatado}</strong>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E8E0D4;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <span style="color:#999;font-size:12px;text-transform:uppercase;">H&oacute;spedes</span><br>
                                <strong style="color:#1B3A4B;font-size:15px;">${data.numHospedes}</strong>
                              </td>
                              <td width="50%">
                                <span style="color:#999;font-size:12px;text-transform:uppercase;">Noites</span><br>
                                <strong style="color:#1B3A4B;font-size:15px;">${data.noites}</strong>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;">
                          <span style="color:#999;font-size:12px;text-transform:uppercase;">Valor Total</span><br>
                          <strong style="color:#2D6A4F;font-size:22px;">${valorFormatado}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <h3 style="color:#1B3A4B;margin:0 0 16px;font-size:16px;">Pr&oacute;ximos passos</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;line-height:1.6;">
                    <strong style="color:#D4A843;">1.</strong> Entraremos em contato pelo WhatsApp para confirmar os detalhes
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;line-height:1.6;">
                    <strong style="color:#D4A843;">2.</strong> O pagamento ser&aacute; combinado diretamente com a pousada
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;line-height:1.6;">
                    <strong style="color:#D4A843;">3.</strong> Check-in a partir das 14:00 | Check-out at&eacute; as 12:00
                  </td>
                </tr>
              </table>

              <!-- WhatsApp CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/5582981334027?text=${encodeURIComponent(`Olá! Fiz a reserva ${data.reservaId} pelo site e gostaria de confirmar os detalhes.`)}"
                       style="display:inline-block;background-color:#25D366;color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;">
                      Falar no WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1B3A4B;padding:24px 40px;text-align:center;">
              <p style="color:#FDF8F0;margin:0 0 4px;font-size:14px;font-weight:700;">
                Pousada Recanto do Matuto Xing&oacute;
              </p>
              <p style="color:#999;margin:0 0 4px;font-size:12px;">
                Piranhas, Alagoas | (82) 98133-4027
              </p>
              <p style="color:#999;margin:0;font-size:12px;">
                recantodomatutoxingo.com.br
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: 'Pousada Recanto do Matuto <onboarding@resend.dev>',
      to: data.hospedeEmail,
      subject: `Reserva ${data.reservaId} - Pousada Recanto do Matuto Xingó`,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao enviar email';
    console.error('Erro ao enviar email de confirmação:', message);
    return { success: false, error: message };
  }
}

interface EmailStatusData {
  reservaId: string;
  hospedeNome: string;
  hospedeEmail: string;
  quartoNome: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmada' | 'cancelada';
}

export async function enviarEmailStatus(data: EmailStatusData): Promise<{ success: boolean; error?: string }> {
  try {
    const checkInFormatado = formatarData(data.checkIn);
    const checkOutFormatado = formatarData(data.checkOut);

    const isConfirmada = data.status === 'confirmada';
    const corPrincipal = isConfirmada ? '#2D6A4F' : '#DC2626';
    const titulo = isConfirmada ? 'Reserva Confirmada!' : 'Reserva Cancelada';
    const mensagem = isConfirmada
      ? `Sua reserva foi <strong>confirmada</strong> pela pousada. Estamos te esperando!`
      : `Infelizmente sua reserva foi <strong>cancelada</strong>. Se tiver d&uacute;vidas, entre em contato conosco.`;
    const emoji = isConfirmada ? '&#10004;' : '&#10008;';

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FDF8F0;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDF8F0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color:${corPrincipal};padding:32px 40px;text-align:center;">
              <h1 style="color:#FDF8F0;margin:0;font-size:24px;font-weight:700;">
                Pousada Recanto do Matuto Xing&oacute;
              </h1>
              <p style="color:#D4A843;margin:8px 0 0;font-size:14px;">
                Seu ref&uacute;gio &agrave;s margens do Canyon do Xing&oacute;
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              <div style="text-align:center;margin-bottom:24px;">
                <span style="display:inline-block;width:60px;height:60px;line-height:60px;border-radius:50%;background-color:${corPrincipal};color:#FDF8F0;font-size:28px;">${emoji}</span>
              </div>
              <h2 style="color:${corPrincipal};margin:0 0 8px;font-size:22px;text-align:center;">${titulo}</h2>
              <p style="color:#666;margin:0 0 24px;font-size:15px;line-height:1.6;text-align:center;">
                Ol&aacute;, <strong>${data.hospedeNome}</strong>! ${mensagem}
              </p>

              <!-- Reservation Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F5F0;border-radius:12px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:0 0 12px;border-bottom:1px solid #E8E0D4;">
                          <span style="color:#999;font-size:12px;text-transform:uppercase;">C&oacute;digo da Reserva</span><br>
                          <strong style="color:#2D6A4F;font-size:16px;">${data.reservaId}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #E8E0D4;">
                          <span style="color:#999;font-size:12px;text-transform:uppercase;">Quarto</span><br>
                          <strong style="color:#1B3A4B;font-size:15px;">${data.quartoNome}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%">
                                <span style="color:#999;font-size:12px;text-transform:uppercase;">Check-in</span><br>
                                <strong style="color:#1B3A4B;font-size:15px;">${checkInFormatado}</strong>
                              </td>
                              <td width="50%">
                                <span style="color:#999;font-size:12px;text-transform:uppercase;">Check-out</span><br>
                                <strong style="color:#1B3A4B;font-size:15px;">${checkOutFormatado}</strong>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${isConfirmada ? `
              <!-- Next Steps -->
              <h3 style="color:#1B3A4B;margin:0 0 16px;font-size:16px;">Pr&oacute;ximos passos</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;line-height:1.6;">
                    <strong style="color:#D4A843;">1.</strong> O pagamento ser&aacute; combinado diretamente com a pousada
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666;font-size:14px;line-height:1.6;">
                    <strong style="color:#D4A843;">2.</strong> Check-in a partir das 14:00 | Check-out at&eacute; as 12:00
                  </td>
                </tr>
              </table>
              ` : `
              <p style="color:#666;font-size:14px;line-height:1.6;text-align:center;">
                Se desejar fazer uma nova reserva, acesse nosso site ou entre em contato pelo WhatsApp.
              </p>
              `}

              <!-- WhatsApp CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
                <tr>
                  <td align="center">
                    <a href="https://wa.me/5582981334027?text=${encodeURIComponent(`Olá! Sobre a reserva ${data.reservaId}, gostaria de mais informações.`)}"
                       style="display:inline-block;background-color:#25D366;color:#FFFFFF;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;">
                      Falar no WhatsApp
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#1B3A4B;padding:24px 40px;text-align:center;">
              <p style="color:#FDF8F0;margin:0 0 4px;font-size:14px;font-weight:700;">
                Pousada Recanto do Matuto Xing&oacute;
              </p>
              <p style="color:#999;margin:0 0 4px;font-size:12px;">
                Piranhas, Alagoas | (82) 98133-4027
              </p>
              <p style="color:#999;margin:0;font-size:12px;">
                recantodomatutoxingo.com.br
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const assunto = isConfirmada
      ? `Reserva Confirmada - Pousada Recanto do Matuto Xingó`
      : `Reserva Cancelada - Pousada Recanto do Matuto Xingó`;

    await resend.emails.send({
      from: 'Pousada Recanto do Matuto <onboarding@resend.dev>',
      to: data.hospedeEmail,
      subject: assunto,
      html,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao enviar email';
    console.error('Erro ao enviar email de status:', message);
    return { success: false, error: message };
  }
}

function formatarData(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}
