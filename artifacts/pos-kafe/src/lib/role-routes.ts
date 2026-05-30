/**
 * Get the default landing page route for a specific user role
 */
export function getDefaultRouteForRole(role?: string): string {
  switch (role) {
    case "owner":
    case "manager":
      return "/dashboard";
    case "cashier":
    case "waiter":
      return "/pos";
    case "chef":
      return "/kitchen";
    case "warehouse":
      return "/stock";
    default:
      return "/dashboard";
  }
}
