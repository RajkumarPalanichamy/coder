/** Problem submissions use `user`; test submissions use `student`. */
export function formatStudentName(submission) {
  const person = submission?.student || submission?.user;
  if (!person || typeof person !== 'object') return 'N/A';

  const first = person.firstName?.trim?.() || '';
  const last = person.lastName?.trim?.() || '';
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;
  if (person.username) return String(person.username);
  if (person.email) return String(person.email);
  return 'N/A';
}
