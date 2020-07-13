'use strict';

/**
 * Conversation.js controller
 *
 * @description: A set of functions called "actions" for managing `Conversation`.
 */

module.exports = {

  /**
   * Retrieve conversation records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.conversation.search(ctx.query);
    } else {
      return strapi.services.conversation.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a conversation record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.conversation.fetch(ctx.params);
  },

  /**
   * Count conversation records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.conversation.count(ctx.query);
  },

  /**
   * Create a/an conversation record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.conversation.add(ctx.request.body);
  },

  /**
   * Update a/an conversation record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.conversation.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an conversation record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.conversation.remove(ctx.params);
  }
};
