/**
 * Calcula si un lugar está abierto o cerrado basado en su horario estructurado o string.
 * Retorna un objeto { text, color }
 */
export const getOpeningStatus = (place) => {
  const now = new Date();
  const day = now.getDay(); // 0 (Dom) a 6 (Sab)
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 100 + minute;

  // Si tiene horario estructurado (el nuevo sistema)
  if (place.structuredSchedules && place.structuredSchedules.length > 0) {
    const currentMonth = now.getMonth() + 1;
    const schedule = place.structuredSchedules.find(s => {
      const start = parseInt(s.startMonth);
      const end = parseInt(s.endMonth);
      if (start <= end) return currentMonth >= start && currentMonth <= end;
      return currentMonth >= start || currentMonth <= end; // Cruce de año
    }) || place.structuredSchedules[0];

    const dayInfo = schedule.days[day];
    if (!dayInfo || !dayInfo.isOpen) return { text: 'CERRADO', color: '#E74C3C' };

    // Check morning
    if (dayInfo.mOpen && dayInfo.mClose) {
      const open = parseInt(dayInfo.mOpen.replace(':', ''));
      const close = parseInt(dayInfo.mClose.replace(':', ''));
      if (currentTime >= open && currentTime < close) return { text: 'ABIERTO', color: '#2ECC71' };
    }

    // Check afternoon
    if (dayInfo.aOpen && dayInfo.aClose) {
      const open = parseInt(dayInfo.aOpen.replace(':', ''));
      const close = parseInt(dayInfo.aClose.replace(':', ''));
      if (currentTime >= open && currentTime < close) return { text: 'ABIERTO', color: '#2ECC71' };
    }

    return { text: 'CERRADO', color: '#E74C3C' };
  }

  // Fallback para lugares sin horario estructurado (Simulación simple)
  if (day === 1) return { text: 'CERRADO', color: '#E74C3C' }; // Lunes cerrado por defecto
  if (currentTime >= 1000 && currentTime < 2000) return { text: 'ABIERTO', color: '#2ECC71' };
  return { text: 'CERRADO', color: '#E74C3C' };
};
