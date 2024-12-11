function isActiveRoute(route, path) {
  return route === path ? 'active' : '';
}

module.exports = {
  isActiveRoute};