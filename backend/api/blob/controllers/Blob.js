'use strict';

/**
 * Blob.js controller
 *
 * @description: A set of functions called "actions" for managing `Blob`.
 */

module.exports = {

  /**
   * Retrieve blob records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.blob.search(ctx.query);
    } else {
      return strapi.services.blob.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a blob record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.blob.fetch(ctx.params);
  },

  /**
   * Count blob records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.blob.count(ctx.query);
  },

  /**
   * Create a/an blob record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.blob.add(ctx.request.body);
  },

  /**
   * Update a/an blob record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.blob.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an blob record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.blob.remove(ctx.params);
  }
};
