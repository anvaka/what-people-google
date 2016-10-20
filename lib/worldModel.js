/* globals topojson */

module.exports = function(world) {
  var worldPaths = topojson.feature(world, world.objects.world).features;

  return {
    getName: getName,
    paths: worldPaths
  };

  function getName(d) {
    return d.properties.name;
  }
}
