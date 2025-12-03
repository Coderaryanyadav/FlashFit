export function formatDate(date: Date | any): string {
    if (!date) return "N/A";

    // Handle Firestore Timestamp
    const d = date?.toDate ? date.toDate() : new Date(date);

    // Check if valid date
    if (isNaN(d.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(d);
}
