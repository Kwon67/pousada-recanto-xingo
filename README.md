<p align="center">
  <img src="public/logo.svg" alt="Recanto do Matuto" width="180" />
</p>

<h1 align="center">Pousada Recanto do Matuto Xingó</h1>

<p align="center">
  <strong>Seu refúgio às margens do Canyon do Xingó — Piranhas, Alagoas</strong>
</p>

<p align="center">
  <a href="https://recantoxingo.com.br">🌐 Visitar Site</a>&nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://instagram.com/recantodomatutoxingo">📸 Instagram</a>&nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="https://wa.me/5582981334027">💬 WhatsApp</a>
</p>

---

## Sobre

Site institucional e sistema de reservas online da **Pousada Recanto do Matuto**, localizada em Piranhas — AL, a poucos minutos do Canyon do São Francisco (Xingó). O projeto oferece uma experiência completa para o hóspede, desde a descoberta dos quartos até a confirmação do pagamento.

## Funcionalidades

- **Catálogo de Quartos** — Standard, Superior e Suítes com galeria de fotos, amenidades e preços por noite
- **Reservas Online** — Seleção de datas, cálculo automático de diárias e checkout com pagamento via **Stripe** (cartão e Pix)
- **Página Sobre** — História da pousada e o que a torna especial
- **Contato** — Formulário integrado, mapa do Google Maps e link direto para WhatsApp
- **Painel Administrativo** — Gestão de quartos, reservas, galeria de mídia, conteúdo do site e configurações
- **E-mails Transacionais** — Confirmação e cancelamento de reservas via Resend
- **SEO Otimizado** — Metadata dinâmica, JSON-LD e OpenGraph por página

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js · React · Tailwind CSS |
| Backend | Next.js API Routes · Server Actions |
| Banco de Dados | Supabase (PostgreSQL) |
| Pagamentos | Stripe Checkout (cartão + Pix) |
| Mídia | Cloudinary |
| E-mail | Resend |
| Deploy | Vercel |

## Estrutura do Site

```
/              → Página inicial (hero, quartos em destaque, sobre, contato)
/quartos       → Catálogo de acomodações com filtros
/quartos/[id]  → Detalhes do quarto + reserva
/reservas      → Fluxo de reserva e checkout
/sobre         → História e equipe
/contato       → Formulário e localização
/admin         → Painel administrativo (protegido)
```

---

<p align="center">
  Desenvolvido por <strong>Kivora Inc.</strong>
</p>
