import React, { useState } from 'react';
import '../../assets/styles/FAQSection.css';


function FAQSection() {
  // Lista de preguntas y respuestas
  const faqData = [
    { 
      id: 1, 
      icon: '↔', // Icono de flechas
      question: '¿Puedo cambiar de plan en cualquier momento?', 
      answer: 'Sí, puedes actualizar o degradar tu plan en cualquier momento desde tu panel de control. Los cambios se aplicarán en el siguiente ciclo de facturación.' 
    },
    { 
      id: 2, 
      icon: '💲', // Icono de dólar
      question: '¿Cómo funciona la facturación?', 
      answer: 'La facturación es mensual y se realiza automáticamente a tu método de pago registrado el día que te suscribiste.' 
    },
    { 
      id: 3, 
      icon: '💰', // Icono de bolsa de dinero
      question: '¿Existen costos ocultos o cargos adicionales?', 
      answer: 'No, todos nuestros planes son transparentes. El precio mensual indicado es el costo total que pagarás, sin cargos ocultos.' 
    },
    { 
      id: 4, 
      icon: '🚫', // Icono de prohibido/cancelación
      question: '¿Puedo cancelar mi plan cuando quiera?', 
      answer: 'Sí, puedes cancelar tu suscripción sin penalizaciones en cualquier momento. La cancelación será efectiva al final de tu ciclo de facturación actual.' 
    },
    { 
      id: 5, 
      icon: '✉', // Icono de envío
      question: '¿Debo enviar mi banner en un tamaño específico?', 
      answer: 'Sí, cada plan tiene especificaciones de tamaño. Revisaremos el arte final y te daremos las medidas exactas antes de la publicación.' 
    },
    { 
      id: 6, 
      icon: '📄', // Icono de documento
      question: '¿Qué datos necesito enviar?', 
      answer: 'Necesitamos el archivo de tu banner (imagen o diseño), la URL a la que debe dirigir y el texto clave de la promoción (si aplica).' 
    },
  ];

  // Estado para controlar qué pregunta está abierta
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (id) => {
    setActiveIndex(activeIndex === id ? null : id);
  };

  return (
    <section className="faq-section">
      <h2 className="faq-title">Preguntas Frecuentes</h2>
      
      <div className="faq-accordion">
        {faqData.map((item) => (
          <div key={item.id} className={`faq-item ${activeIndex === item.id ? 'active' : ''}`}>
            
            {/* Cabecera de la Pregunta */}
            <button 
              className="faq-question-header" 
              onClick={() => toggleFAQ(item.id)}
            >
              <span className="faq-icon">{item.icon}</span>
              <span className="faq-question-text">{item.question}</span>
              <span className="faq-arrow">
                {/* Ícono de la flecha rotatoria */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </button>
            
            {/* Contenido de la Respuesta (Se despliega/pliega) */}
            <div className="faq-answer-content">
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQSection;