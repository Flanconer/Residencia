'use client';

import { useState } from 'react';
import { CENTRO_PACHUCA, verificarCobertura } from '@/lib/utils/cobertura';
import { NEGOCIO } from '@/lib/config/negocio';

// Verificador de cobertura por código postal: el cliente sabe si le
// entregamos antes de armar su pedido.
export default function ZonaEntrega() {
  const [cp, setCp] = useState('');
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(
    null
  );

  function verificar(e: React.FormEvent) {
    e.preventDefault();

    if (!/^\d{5}$/.test(cp)) {
      setResultado({ ok: false, texto: 'Escribe un código postal de 5 dígitos.' });
      return;
    }

    const cobertura = verificarCobertura(CENTRO_PACHUCA.lat, CENTRO_PACHUCA.lng, cp);
    setResultado({
      ok: cobertura.dentroDeCobertura,
      texto: cobertura.dentroDeCobertura
        ? `Sí entregamos en el ${cp}.`
        : cobertura.motivo,
    });
  }

  return (
    <section className="grid gap-10 py-14 md:grid-cols-2 md:items-center">
      <div>
        <h2 className="font-display text-3xl font-bold text-ave-oscuro">
          Entregamos en {NEGOCIO.zonaEntrega}
        </h2>
        <dl className="mt-6 space-y-4">
          <div>
            <dt className="font-semibold text-ave-oscuro">Días de entrega</dt>
            <dd className="text-ave-oscuro/70">{NEGOCIO.horarios.entregas}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ave-oscuro">Horario de corte</dt>
            <dd className="text-ave-oscuro/70">{NEGOCIO.horarios.descripcionCorte}</dd>
          </div>
          {NEGOCIO.pedidoMinimo > 0 && (
            <div>
              <dt className="font-semibold text-ave-oscuro">Pedido mínimo</dt>
              <dd className="text-ave-oscuro/70">
                ${NEGOCIO.pedidoMinimo} para entrega a domicilio
              </dd>
            </div>
          )}
        </dl>
      </div>

      <form
        onSubmit={verificar}
        className="rounded-3xl bg-ave-oscuro p-6 text-white sm:p-8"
      >
        <label htmlFor="cp-cobertura" className="font-display text-xl font-bold">
          ¿Llegamos a tu casa?
        </label>
        <p className="mt-1 text-sm text-white/60">Escribe tu código postal.</p>

        <div className="mt-5 flex gap-2">
          <input
            id="cp-cobertura"
            value={cp}
            onChange={(e) => {
              setCp(e.target.value.replace(/\D/g, ''));
              setResultado(null);
            }}
            inputMode="numeric"
            maxLength={5}
            placeholder="42000"
            className="w-full min-w-0 rounded-xl bg-white/10 px-4 py-3 text-lg tracking-widest text-white placeholder:text-white/30 outline-none focus:bg-white/15"
          />
          <button className="shrink-0 rounded-xl bg-ave-rojo px-5 font-semibold transition hover:bg-red-700">
            Revisar
          </button>
        </div>

        {resultado && (
          <p
            role="status"
            className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
              resultado.ok ? 'bg-emerald-400/15 text-emerald-200' : 'bg-red-400/15 text-red-200'
            }`}
          >
            {resultado.texto}
          </p>
        )}
      </form>
    </section>
  );
}
