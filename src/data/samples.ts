import type { Dataset, Row } from '../types';

const groups: Record<string, { good: string[]; bad: string[]; neutral: string[] }> = {
  Entrega: {
    good: ['El pedido llegó rapidísimo y perfectamente embalado.', 'La entrega fue puntual y el paquete llegó impecable.', 'Me sorprendió la rapidez del envío, excelente logística.', 'Recibí el producto antes de lo previsto, fantástico.', 'El repartidor fue muy amable y entregó todo correctamente.'],
    bad: ['El envío llegó tarde y la caja estaba rota.', 'Hace una semana que espero el paquete, servicio pésimo.', 'La empresa perdió el pedido y nadie me explica nada.', 'El reparto fue un desastre: dejaron el paquete en otra dirección.', 'No llegó a tiempo, mucha demora y mala organización.'],
    neutral: ['Necesito consultar el estado del envío de mi pedido.', '¿En qué horario realizan la entrega a domicilio?', 'El seguimiento indica que está en distribución.']
  },
  Pago: {
    good: ['El pago con tarjeta fue sencillo y muy seguro.', 'La transferencia se acreditó de inmediato, excelente experiencia.', 'Pude pagar en cuotas sin ningún inconveniente.', 'La factura se generó correctamente y el cobro fue rápido.', 'El sistema de pago funciona perfectamente, gracias.'],
    bad: ['Me cobraron dos veces por el mismo pedido, horrible.', 'La tarjeta fue rechazada aunque tenía saldo suficiente.', 'No me reintegran el dinero, pésima atención de facturación.', 'El checkout falla constantemente y no puedo completar el pago.', 'Hay un cargo incorrecto en mi cuenta, estoy muy molesto.'],
    neutral: ['¿Puedo abonar mediante transferencia bancaria?', 'Quiero solicitar la factura de la última compra.', '¿Cuántas cuotas permite la plataforma?']
  },
  Producto: {
    good: ['El producto es excelente, muy buena calidad de materiales.', 'Funciona perfecto y cumple con todas mis expectativas.', 'La calidad superó lo esperado, estoy encantado.', 'Es resistente, cómodo y con un diseño hermoso.', 'Gran compra: el artículo es fantástico y útil.'],
    bad: ['El producto vino defectuoso y dejó de funcionar.', 'La calidad es muy mala, se rompió al primer uso.', 'La descripción era engañosa, no cumple lo prometido.', 'Recibí un artículo diferente, terrible experiencia.', 'El material es frágil y el acabado es pésimo.'],
    neutral: ['Quiero conocer las dimensiones exactas del producto.', '¿Tienen este artículo disponible en color azul?', 'Necesito el manual de instalación del equipo.']
  },
  Atención: {
    good: ['El equipo de soporte respondió rápido y resolvió mi problema.', 'La atención fue excelente, personal muy amable.', 'Me ayudaron enseguida, estoy muy satisfecho.', 'La agente explicó todo con claridad y paciencia.', 'Servicio de atención magnífico, muchas gracias.'],
    bad: ['Nadie responde mis mensajes, el soporte es terrible.', 'La persona que me atendió fue muy descortés.', 'No resolvieron mi reclamo, pésima atención.', 'Me hicieron esperar dos horas, servicio horrible.', 'El soporte no escucha ni ofrece soluciones útiles.'],
    neutral: ['¿Dónde puedo hablar con una persona de soporte?', 'Necesito abrir un ticket de atención al cliente.', 'Quisiera conocer los horarios de soporte.']
  }
};

const rows: Row[] = [];
Object.entries(groups).forEach(([category, samples]) => {
  (['good', 'bad', 'neutral'] as const).forEach((key) => {
    samples[key].forEach((text, i) => {
      rows.push({ id: String(rows.length + 1), comentario: text, area: category, sentimiento: key === 'good' ? 'Positivo' : key === 'bad' ? 'Negativo' : 'Neutro', canal: i % 2 ? 'Web' : 'App', puntuacion: key === 'good' ? '5' : key === 'bad' ? '1' : '3' });
    });
  });
});

const tickets: Row[] = [
  ['No puedo iniciar sesión en mi cuenta, aparece error de contraseña.','Acceso'],
  ['Mi usuario está bloqueado y necesito recuperar la cuenta.','Acceso'],
  ['El sistema no acepta el código de verificación.','Acceso'],
  ['Olvidé mis credenciales y necesito un restablecimiento.','Acceso'],
  ['No puedo entrar al portal con mi correo.','Acceso'],
  ['La sesión se cierra y no puedo volver a ingresar.','Acceso'],
  ['Solicito cambio de dirección de envío de mi compra.','Envíos'],
  ['El paquete sigue sin llegar a mi domicilio.','Envíos'],
  ['Quiero conocer el número de seguimiento del pedido.','Envíos'],
  ['Necesito programar una nueva entrega.','Envíos'],
  ['El servicio de correo figura como demorado.','Envíos'],
  ['La empresa transportista extravió la caja.','Envíos'],
  ['Necesito que me envíen la factura con IVA.','Facturación'],
  ['La factura contiene un CUIT incorrecto.','Facturación'],
  ['Pido una nota de crédito por la compra.','Facturación'],
  ['No recibí el comprobante de pago.','Facturación'],
  ['Solicito corregir los datos fiscales.','Facturación'],
  ['Quiero descargar la factura electrónica.','Facturación'],
  ['La aplicación se congela al abrir el panel.','Técnico'],
  ['El sitio web devuelve error 500 al guardar.','Técnico'],
  ['La API no responde a las consultas.','Técnico'],
  ['La pantalla aparece en blanco tras la actualización.','Técnico'],
  ['No puedo subir archivos por un error del sistema.','Técnico'],
  ['La página tarda demasiado en cargar.','Técnico']
].map(([texto, categoria], i) => ({ id: String(i + 1), texto, categoria, prioridad: i % 4 === 0 ? 'Alta' : 'Normal' }));

export const examples: Dataset[] = [
  { name: 'Reseñas de e-commerce · 52 casos', rows, columns: Object.keys(rows[0]), source: 'demo' },
  { name: 'Tickets de soporte · 24 casos', rows: tickets, columns: Object.keys(tickets[0]), source: 'demo' }
];
