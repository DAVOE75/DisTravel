/**
 * Calcula si un lugar está abierto o cerrado basado en su horario estructurado o string.
 * Retorna un objeto { text, color, detail }
 */
export const getOpeningStatus = (place) => {
  const now = new Date();
  const day = now.getDay(); // 0 (Dom) a 6 (Sab)
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentTime = hour * 100 + minute;

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.includes(':') ? timeStr : timeStr.slice(0, 2) + ':' + timeStr.slice(2);
  };

  const getMinutesDiff = (time1, time2) => {
    // time format is HHMM as number
    const h1 = Math.floor(time1 / 100);
    const m1 = time1 % 100;
    const h2 = Math.floor(time2 / 100);
    const m2 = time2 % 100;
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const formatDiff = (diffMinutes) => {
    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Si tiene horario estructurado (el nuevo sistema)
  if (place.structuredSchedules && place.structuredSchedules.length > 0) {
    const currentMonth = now.getMonth() + 1;
    const schedule = place.structuredSchedules.find(s => {
      if (s.startDate && s.endDate) {
        const currentYear = now.getFullYear();
        const startParts = s.startDate.split('-');
        const endParts = s.endDate.split('-');
        
        const start = new Date(currentYear, parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0);
        const end = new Date(currentYear, parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59);
        
        if (start <= end) {
          return now >= start && now <= end;
        } else {
          const nextYearEnd = new Date(currentYear + 1, parseInt(endParts[1]) - 1, parseInt(endParts[2]), 23, 59, 59);
          const prevYearStart = new Date(currentYear - 1, parseInt(startParts[1]) - 1, parseInt(startParts[2]), 0, 0, 0);
          return (now >= start && now <= nextYearEnd) || (now >= prevYearStart && now <= end);
        }
      }
      const start = parseInt(s.startMonth);
      const end = parseInt(s.endMonth);
      if (!isNaN(start) && !isNaN(end)) {
        if (start <= end) return currentMonth >= start && currentMonth <= end;
        return currentMonth >= start || currentMonth <= end; // Cruce de año
      }
      return false;
    }) || place.structuredSchedules[0];

    const dayInfo = schedule.days[day];
    if (!dayInfo || !dayInfo.isOpen) return { text: 'CERRADO', color: '#E74C3C', detail: 'Cerrado hoy' };

    const shifts = [];
    if (dayInfo.mOpen && dayInfo.mClose) {
      shifts.push({ 
        open: parseInt(dayInfo.mOpen.replace(':', '')), 
        close: parseInt(dayInfo.mClose.replace(':', '')),
        label: dayInfo.mOpen
      });
    }
    if (dayInfo.aOpen && dayInfo.aClose) {
      shifts.push({ 
        open: parseInt(dayInfo.aOpen.replace(':', '')), 
        close: parseInt(dayInfo.aClose.replace(':', '')),
        label: dayInfo.aOpen
      });
    }

    // Check if currently open
    for (const shift of shifts) {
      if (currentTime >= shift.open && currentTime < shift.close) {
        const diff = getMinutesDiff(currentTime, shift.close);
        return { 
          text: 'ABIERTO', 
          color: '#2ECC71', 
          detail: `Cierra en ${formatDiff(diff)}` 
        };
      }
    }

    // If not open, check when it opens
    for (const shift of shifts) {
      if (currentTime < shift.open) {
        return { 
          text: 'CERRADO', 
          color: '#E74C3C', 
          detail: `Abre a las ${formatTime(shift.label)}` 
        };
      }
    }

    return { text: 'CERRADO', color: '#E74C3C', detail: 'Cerrado por hoy' };
  }

  // Fallback para lugares sin horario estructurado (Simulación simple)
  if (day === 1) return { text: 'CERRADO', color: '#E74C3C', detail: 'Cerrado los lunes' }; 
  
  if (currentTime >= 1000 && currentTime < 2000) {
    const diff = getMinutesDiff(currentTime, 2000);
    return { text: 'ABIERTO', color: '#2ECC71', detail: `Cierra en ${formatDiff(diff)}` };
  }
  
  if (currentTime < 1000) {
    return { text: 'CERRADO', color: '#E74C3C', detail: 'Abre a las 10:00' };
  }

  return { text: 'CERRADO', color: '#E74C3C', detail: 'Cerrado hasta mañana' };
};

