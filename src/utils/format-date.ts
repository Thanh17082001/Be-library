export function formatDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/');
  const formattedDate = new Date(Number(year), Number(month) - 1, Number(day));

  return formattedDate; // Outputs: Fri Aug 17 2001
}
