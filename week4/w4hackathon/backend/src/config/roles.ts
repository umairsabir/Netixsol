const allRoles = {
  user: ['getMovies', 'getProfile', 'manageSubscription'],
  admin: ['getUsers', 'manageUsers', 'getMovies', 'manageMovies', 'managePlans', 'getProfile', 'manageSubscription'],
};

export const roles = Object.keys(allRoles);
export const roleRights = new Map(Object.entries(allRoles));
