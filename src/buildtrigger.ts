import {ServiceObject, util} from '@google-cloud/common';
import {promisifyAll} from '@google-cloud/promisify';
import * as is from 'is';
import * as request from 'request';

import { GCB, BuildTriggerMetadata } from '.';

/**
 * Create a BuildTrigger object to interact with a Cloud Build.
 *
 * @param {GCB} gcb {@link GCB} instance.
 * @param {string} id The id of the build trigger.
 * @param {object} [options] Configuration object.
 * @param {string} [options.userProject] User project.
 */
export class BuildTrigger extends ServiceObject {
  /**
   * The build triggers's name.
   * @name BuildTrigger#name
   * @type {string}
   */
  id: string;

  metadata: BuildTriggerMetadata;

  /**
   * A reference to the {@link GCB} associated with this {@link BuildTrigger}
   * instance.
   * @name BuildTrigger#gcf
   * @type {GCB}
   */
  gcb: GCB;

  /**
   * A user project to apply to each request from this function.
   * @name BuildTrigger#userProject
   * @type {string}
   */
  userProject: string;

  constructor(gcb, id, metadata, options?) {
    options = options || {};

    const methods = {
      create: true,
      delete: true,
      get: true,
      exits: true,
      patch: true,
      run: true,
    };

    super({
      parent: gcb,
      baseUrl: '',
      id,
      createMethod: gcb.createBuildTrigger.bind(gcb),
      methods,
      requestModule: request,
    });

    this.gcb = gcb;
    this.id = id;
    this.metadata = metadata;
    this.userProject = options.userProject;
  }

  /**
   * Delete the build trigger.
   *
   * @param {object} [options] Configuration options.
   * @param {string} [options.userProject] The ID of the project which will be
   *     billed for the request.
   * @param {BuildTriggerCallback} [callback] Callback function.
   * @returns {Promise<Operation>}
   */
  delete(options, callback?) {
    if (is.fn(options)) {
      callback = options;
      options = {};
    }

    this.request(
        {
          method: 'DELETE',
          uri: '',
          qs: options,
        },
        callback || util.noop);
  }

  /**
   * Get a Build Trigger if it exists.
   *
   * @param {object} [options] Configuration options.
   * @param {string} [options.userProject] The ID of the project which will be
   *     billed for the request.
   * @param {BuildTriggerCallback} [callback] Callback function.
   * @returns {Promise<BuildTrigger>}
   *
   */
  get(options, callback?) {
    if (is.fn(options)) {
      callback = options;
      options = {};
    }

    options = options || {};

    const onCreate = (err, fn, apiResponse) => {
      if (err) {
        if (err.code === 409) {
          this.get(options, callback);
          return;
        }

        callback(err, null, apiResponse);
        return;
      }

      callback(null, fn, apiResponse);
    };
  }

  /**
   * Check if the build trigger exists.
   *
   * @param {object} [options] Configuration options.
   * @param {string} [options.userProject] The ID of the project which will be
   *     billed for the request.
   * @param {BuildTriggerCallback} [callback] Callback function.
   * @returns {Promise<boolean>}
   *
   */
  exists(options, callback?) {
    if (is.fn(options)) {
      callback = options;
      options = {};
    }

    options = options || {};

    this.get(options, err => {
      if (err) {
        if (err.code === 404) {
          callback(null, false);
        } else {
          callback(err);
        }

        return;
      }

      callback(null, true);
    });
  }

  // @TODO
  patch(options, callback?) {
    if (is.fn(options)) {
      callback = options;
      options = {};
    }

    this.request(
        {
          method: 'PATCH',
          uri: '',
          qs: options,
        },
        callback || util.noop);
  }

  /**
   * Run a build trigger
   *
   * @param {object} [options] Configuration options.
   * @param {object} [body] Json body for the post request
   * @param {any} [callback] Callback function.
   * @returns {Promise<any>}
   *
   */
  run(options, body?, callback?) {
    if (!callback && body && is.fn(body)) {
      callback = body;
    } else if (is.fn(options)) {
      callback = options;
      options = {};
    }

    this.request(
        {
          method: 'POST',
          uri: ':run',
          qs: options,
          json: body,
        },
        callback || util.noop);
  }

}

/*! Developer Documentation
 *
 * These methods can be auto-paginated.
 */
// paginator.extend(BuildTrigger, '');

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisifyAll(BuildTrigger, {
  exclude: [],
});
