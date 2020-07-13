'use strict';

/**
 * Anonymoususer.js controller
 *
 * @description: A set of functions called "actions" for managing `Anonymoususer`.
 */

module.exports = {

  /**
   * Retrieve anonymoususer records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.anonymoususer.search(ctx.query);
    } else {
      return strapi.services.anonymoususer.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a anonymoususer record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.anonymoususer.fetch(ctx.params);
  },

  /**
   * Count anonymoususer records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.anonymoususer.count(ctx.query);
  },

  /**
   * Create a/an anonymoususer record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    console.log('They tried to create a user');
    return strapi.services.anonymoususer.add(ctx.request.body);
  },

  /**
   * Update a/an anonymoususer record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.anonymoususer.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an anonymoususer record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.anonymoususer.remove(ctx.params);
  }
};
