export function downloadICS(event) {
  const startDate = new Date(event.date || Date.now());
  if (isNaN(startDate.getTime())) {
    console.error('Invalid event date for ICS export.');
    return;
  }

  // Default to 1 hour duration
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NexaSphere//Events//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${event.name || 'NexaSphere Event'}`,
    `DESCRIPTION:${(event.description || event.overview || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location || 'GL Bajaj Group of Institutions, Mathura'}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${(event.name || 'event').replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
