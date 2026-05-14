/** Default dashboard path after login, per role. */
export function defaultRouteForRole(role: string): string {
  switch (role) {
    case 'STUDENT':
      return '/student';
    case 'FACULTY':
      return '/faculty';
    case 'LIBRARIAN':
      return '/librarian';
    case 'MANAGER':
      return '/manager';
    case 'AFFAIRS':
      return '/affairs';
    case 'ADMIN':
      return '/admin';
    default:
      return '/';
  }
}
