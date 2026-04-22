const bundledArenas = require('../data/valleyArenas');
const { getCustomArenas } = require('./localDevStore');

const ensureArenaId = (arena, index) => ({
  ...arena,
  _id: arena._id || `local-arena-${index + 1}`,
  timeSlots: Array.isArray(arena.timeSlots) ? arena.timeSlots : [],
});

const getArenaCatalog = () => [
  ...bundledArenas.map(ensureArenaId),
  ...getCustomArenas().map(ensureArenaId),
];

const matchesQuery = (arena, query = {}) => {
  if (query.isActive !== undefined && arena.isActive !== query.isActive) {
    return false;
  }

  if (query['location.city'] && arena.location?.city !== query['location.city']) {
    return false;
  }

  if (query.price) {
    if (query.price.$gte !== undefined && arena.price < query.price.$gte) {
      return false;
    }

    if (query.price.$lte !== undefined && arena.price > query.price.$lte) {
      return false;
    }
  }

  if (Array.isArray(query.$or) && query.$or.length > 0) {
    const searchMatches = query.$or.some((condition) => {
      if (condition.name?.$regex) {
        return new RegExp(condition.name.$regex, condition.name.$options || '').test(arena.name);
      }

      if (condition['location.address']?.$regex) {
        return new RegExp(
          condition['location.address'].$regex,
          condition['location.address'].$options || ''
        ).test(arena.location?.address || '');
      }

      return false;
    });

    if (!searchMatches) {
      return false;
    }
  }

  return true;
};

const sortArenas = (arenas) =>
  [...arenas].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }

    if (b.totalRatings !== a.totalRatings) {
      return b.totalRatings - a.totalRatings;
    }

    return a.price - b.price;
  });

exports.findArenas = (query = {}) => sortArenas(getArenaCatalog().filter((arena) => matchesQuery(arena, query)));

exports.findArenaById = (id) => getArenaCatalog().find((arena) => arena._id === id) || null;
