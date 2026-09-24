export default function PaginaAvisoPrivacidad() {
  return (
    <div className="mx-auto max-w-2xl text-sm text-ave-oscuro">
      <h1 className="mb-6 text-2xl font-semibold">Aviso de privacidad</h1>

      <p className="mb-4">
        AVE Paraíso recaba los siguientes datos personales para poder procesar y
        entregar tus pedidos: nombre, teléfono, dirección de entrega y ubicación
        geográfica (latitud y longitud) que proporcionas al momento de realizar tu
        compra.
      </p>

      <p className="mb-4">
        Estos datos se utilizan únicamente para coordinar la entrega de tu pedido y
        contactarte en caso de ser necesario. No compartimos tu información con
        terceros ajenos al proceso de entrega.
      </p>

      <p className="mb-4">
        Puedes solicitar la eliminación de tus datos en cualquier momento
        contactándonos directamente por WhatsApp o al teléfono de la tienda.
      </p>

      <p className="text-ave-oscuro/60">
        * Este es un aviso de privacidad simplificado. Se recomienda que un abogado
        revise y complemente este texto conforme a la Ley Federal de Protección de
        Datos Personales en Posesión de los Particulares antes de operar
        formalmente.
      </p>
    </div>
  );
}
