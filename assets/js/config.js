/* ==========================================================================
   CONFIGURACIÓN DEL SITIO
   Todo lo que hay que personalizar está aquí. Los valores marcados con TODO
   son provisionales: sustitúyelos antes de publicar la web.
   ========================================================================== */

window.SITE = {
  name: "Jesús Hernández",

  contact: {
    // WhatsApp en formato internacional, sin "+" ni espacios (para enlaces wa.me)
    whatsapp: "34600000000", // TODO
    phoneDisplay: "+34 600 000 000", // TODO
    email: "contacto@tudominio.es", // TODO
  },

  social: {
    instagram: "", // TODO: p.ej. "https://www.instagram.com/usuario"
    tiktok: "", // opcional
    youtube: "", // opcional
  },

  // Ciudad donde ofrece entrenamiento presencial (aparece en textos y en el formulario)
  city: "TU CIUDAD", // TODO

  // Enlace para reservar la llamada de valoración (Calendly, Cal.com...).
  // Si se deja vacío, los botones de "reservar llamada" abren WhatsApp.
  bookingUrl: "", // TODO (opcional)

  // Ruta a la foto de Jesús (vertical, 4:5). Vacío = se muestra un monograma.
  photo: "", // TODO: p.ej. "assets/img/jesus.jpg"

  // Precios de los planes en euros/mes. null = se muestra "Consultar".
  prices: {
    online: null, // TODO
    presencial: null, // TODO
    premium: null, // TODO
  },

  /* ------------------------------------------------------------------------
     ENVÍO DE LEADS (test de nivel y calculadora)
     Elige UNA opción. Si no configuras ninguna, el formulario abre WhatsApp
     con todos los datos ya redactados, así que nunca se pierde un contacto.

     A) Web3Forms (gratis, llega por email): crea una access key en
        https://web3forms.com con el email de Jesús y pégala aquí.
     B) Webhook (Make, Zapier, n8n, Formspree...): pega la URL que recibe un
        POST con JSON. Desde ahí puedes mandarlo a Google Sheets, un CRM,
        email automático de bienvenida, etc.
     ------------------------------------------------------------------------ */
  leads: {
    web3formsKey: "", // TODO (opción A)
    webhookUrl: "", // TODO (opción B)
  },

  // Testimonios REALES de alumnos. La sección permanece oculta mientras esté vacío.
  // Formato: { text: "...", name: "Nombre A.", detail: "Policía Nacional · Promoción 2026" }
  testimonials: [],
};
