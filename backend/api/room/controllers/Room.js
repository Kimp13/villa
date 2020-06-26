'use strict';

/**
 * Room.js controller
 *
 * @description: A set of functions called "actions" for managing `Room`.
 */

module.exports = {

  /**
   * Retrieve room records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.room.search(ctx.query);
    } else {
      return strapi.services.room.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a room record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.room.fetch(ctx.params);
  },

  /**
   * Count room records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.room.count(ctx.query);
  },

  /**
   * Create a/an room record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.room.add(ctx.request.body);
  },

  /**
   * Update a/an room record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.room.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an room record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.room.remove(ctx.params);
  }
};
