import React, { useState } from "react";
import "../../assets/styles/servicios.css";
import { useProviderServices } from "../../hooks/useProviderServices";

const formatDate = (isoDate) => {
  if (!isoDate) return "Fecha pendiente";
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

function Servicios({ idProveedor }) {
  const {
    activeServices,
    finishedServices,
    isLoading,
    error,
    finalizarServicio,
  } = useProviderServices(idProveedor);

  const [tab, setTab] = useState("activos");

  const handleFinalizar = async (idServicio) => {
    try {
      const data = await finalizarServicio(idServicio);
      alert(data?.message || "Servicio finalizado con éxito");
    } catch (err) {
      console.error("Error al finalizar servicio:", err);
      alert("No se pudo finalizar el servicio. Intenta de nuevo.");
    }
  };

  
  if (!idProveedor) {
    return (
      <div className="contenedor-servicios-activos">
        <p>No se encontró un proveedor asociado a tu cuenta.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="contenedor-servicios-activos">
        <p>Cargando servicios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contenedor-servicios-activos">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="contenedor-servicios-activos">
      <h2>Servicios Activos y Finalizados</h2>

      <div className="tabs-servicios">
        <button
          type="button"
          className={tab === "activos" ? "tab-boton tab-activa-activos" : "tab-boton"}
          onClick={() => setTab("activos")}
        >
          Servicios activos
        </button>

        <button
          type="button"
          className={tab === "finalizados" ? "tab-boton tab-activa-finalizados" : "tab-boton"}
          onClick={() => setTab("finalizados")}
        >
          Servicios finalizados
        </button>
      </div>

      {tab === "activos" && (
        <>
          {activeServices.length === 0 ? (
            <p>No tienes servicios activos en este momento.</p>
          ) : (
            activeServices.map((srv) => (
              <div key={srv.id} className="card-servicio">

                {/* Imagen */}
                <img
                  src={srv.clientPhoto}
                  className="foto-perfil"
                  alt={`Foto de ${srv.clientName}`}
                />

                {/* Datos cliente */}
                <div className="datos">
                  <h3>{srv.clientName}</h3>
                  <p>Contacto: {srv.contactPhone}</p>
                </div>

                {/* Fecha */}
                <div className="fecha">
                  <h4>Fecha del servicio</h4>
                  <p>{formatDate(srv.date)}</p>
                </div>

                {/* Estado */}
                <div className="estatus">
                  <span className="pill">{srv.statusLabel}</span>

                    
                </div>

              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default Servicios;
