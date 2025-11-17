import React from 'react';

function ResenaView({ reseña, cliente, proveedor, baseImageUrl = '', showCliente = false }) {
  // Determinar si mostrar info del cliente o del proveedor
  const persona = showCliente ? cliente : proveedor;
  const personaNombre = persona?.nombre || (showCliente ? 'Cliente' : 'Proveedor');
  const personaFoto = persona?.foto_perfil ? (persona.foto_perfil.startsWith('http') ? persona.foto_perfil : `${baseImageUrl}${persona.foto_perfil}`) : null;
  const personaCalificacion = persona?.calificacion_promedio || null;
  const servicio = proveedor?.servicio || 'Servicio';
  
  const comentario = reseña?.comentario || '';
  const califGeneral = reseña?.calificacion_general ?? null;
  const califPuntualidad = reseña?.calificacion_puntualidad ?? null;
  const califCalidad = reseña?.calificacion_calidad_servicio ?? null;
  const califPrecio = reseña?.calificacion_calidad_precio ?? null;
  const fecha = reseña?.fecha_reseña ? new Date(reseña.fecha_reseña).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }) : '';

  return (
    <div className="resena-view-card" style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#374151' }}>
          {personaFoto ? (
            <img src={personaFoto} alt={personaNombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (personaNombre || 'US').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700 }}>{personaNombre}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>
            {showCliente && personaCalificacion ? (
              <>
                <span style={{ color: '#f59e0b', marginRight: 4 }}>★ {personaCalificacion}</span>
                • 
              </>
            ) : null}
            {showCliente ? `Reseñó ${servicio}` : servicio}
            {fecha ? ` • ${fecha}` : ''}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12, color: '#111827' }}>
        {comentario || <i style={{ color: '#6b7280' }}>Sin comentario</i>}
      </div>

      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
        <div><b>General:</b> {califGeneral ?? '-'} / 5</div>
        <div><b>Puntualidad:</b> {califPuntualidad ?? '-'} / 5</div>
        <div><b>Calidad servicio:</b> {califCalidad ?? '-'} / 5</div>
        <div><b>Calidad-precio:</b> {califPrecio ?? '-'} / 5</div>
      </div>

      {cliente?.email && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
          Reseña por: {cliente.email}
        </div>
      )}
    </div>
  );
}

export default ResenaView;
