import * as arrify from 'arrify';
import {Service, GoogleAuthOptions} from '@google-cloud/common';
import {paginator} from '@google-cloud/paginator';
import {promisifyAll} from '@google-cloud/promisify';
import * as extend from 'extend';
import * as request from 'request';

import { BuildTrigger } from './buildtrigger';

// @developer -> https://cloud.google.com/cloud-build/docs/api/reference/rest/v1/RepoSource
export interface RepoSource {
  projectId: string;
  repoName: string;
  dir?: string;
  branchName?: string;
  tagName?: string;
  commitSha?: string;
}

export interface BuildTriggerMetadata {
  description?: string;
  triggerTemplate?: RepoSource;
  createTime: string;
  disabled?: boolean;
  substitutions?: any;
  ignoredFiles?: string[];
  includedFiles?: string[];
  build?: any; // @TODO BUILD class
  filename?: string;
}

export interface BuildTriggerConfig {
  description?: string;
  triggerTemplate?: RepoSource;
  disabled?: boolean;
  substitutions?: any;
  ignoredFiles?: string[];
  includedFiles?: string[];
  build?: any; // @TODO BUILD class
  filename?: string;
}

export interface BuildTriggerQuery {
  autoPaginate?: true;
  maxApiCalls?: number;
  maxResults?: number;
  pageToken?: string;
  userProject?: string;
}

export interface Status {
  code: number;
  message: string;
  details?: any;
}

export interface Operation {
  name: string;
  metadata: any;
  done: boolean;
  error?: Status;
  response?: any;
}

export interface ListOperationsResponse {
  operations: Operation[];
  nextPageToken: string;
}

export interface ApiResponse {

}

export interface Credentials {
  client_email?: string;
  private_key?: string;
}

export interface ConfigurationObject extends GoogleAuthOptions {
  autoRetry?: boolean;
  credentials?: Credentials;
  email?: string;
  keyFilename?: string;
  maxRetries?: number;
  projectId?: string;
  promise?: typeof Promise;
}

export interface BuildTriggerCallback {
  (
    err: Error|null,
    fn?: BuildTrigger|null|undefined|Operation,
    apiResponse?: request.Response
  ): void;
}

export interface BuildTriggersCallback {
  (
    err: Error|null,
    fns?: BuildTrigger[]|null|undefined,
    nextQuery?: string|null|undefined,
    apiResponse?: request.Response
  ): void;
}

/*! 
* @param {ConfigurationObject} [options] Configuration options.
*/
class GCB extends Service {
  /**
   * {@link BuildTrigger} class.
   *
   * @name GCB.BuildTrigger
   * @see BuildTrigger
   * @type {Constructor}
   */
  static BuildTrigger: typeof BuildTrigger = BuildTrigger;

  constructor(options: ConfigurationObject = {}) {
    const config = {
      baseUrl: 'https://cloudbuild.googleapis.com/v1',
      projectIdRequired: false,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
      ],
      packageJson: require('../../package.json'),
      requestModule: request,
    };

    super(config, options);

  }

  /**
   * Get a reference to a Cloud Build Trigger function.
   *
   * @param {string} id Build Trigger id
   * @returns {BuildTrigger}
   */
  public buildTrigger(id: string, metadata?: BuildTriggerMetadata): BuildTrigger {
    if (!id) {
      throw new Error('A build trigger id is needed to use Cloud Build.');
    }
    return new BuildTrigger(this, id, metadata);
  }

  // @developer @archelogos
  // not tested yet
  /**
   * Create a Build Trigger.
   *
   * @param {BuildTriggerConfig} [metadata] 
   * @param {BuildTriggerCallback} [callback]
   * @returns {Promise<BuildTrigger>}
   * @throws {Error} 
   *
   */
  public createBuildTrigger(callback: BuildTriggerCallback): void | Promise<[BuildTrigger, any]>;
  public createBuildTrigger(
      metadata: BuildTriggerConfig,
      callback?: BuildTriggerCallback): void | Promise<[BuildTrigger, any]>;
  public createBuildTrigger(
  metadataOrCallback: BuildTriggerCallback|BuildTriggerConfig,
  callback?: BuildTriggerCallback): void | Promise<[BuildTrigger, any]> {

    let metadata: BuildTriggerConfig;
    if (!callback) {
      callback = metadataOrCallback as BuildTriggerCallback;
      metadata = {};
    } else {
      metadata = metadataOrCallback as BuildTriggerConfig;
    }

    const body: BuildTriggerConfig = extend({}, metadata);

    // @developer @archelogos
    // @TODO business logic here -> runtimes check

    this.request(
        {
          method: 'POST',
          uri: `/projects/${this.projectId}/triggers`,
          qs: '',
          json: body,
        },
        (err, resp) => {
          if (err) {
            callback!(err, null, resp);
            return;
          }

          const buildTrigger: BuildTrigger = this.buildTrigger(resp.id, (resp as BuildTriggerMetadata));

          // @developer @archelogos
          // That's the non-null assertion operator (https://stackoverflow.com/questions/42273853/in-typescript-what-is-the-exclamation-mark-bang-operator-when-dereferenci)
          callback!(null, buildTrigger);
        });
  }

  /**
   * Get Build Trigger objects
   *
   * @param {BuildTriggerQuery} [query] Query object for listing build triggers.
   * @param {BuildTriggersCallback} [callback] Callback function.
   * @returns {Promise<BuildTrigger[]>}
   */
  public getBuildTriggers(query: BuildTriggerQuery = {}, callback?: BuildTriggersCallback): void | Promise<[BuildTrigger[], any]> {

    this.request(
        {
          method: 'GET',
          uri: `/projects/${this.projectId}/triggers`,
          qs: ''
        },
        (err, resp) => {
          if (err) {
            callback!(err, null, null, resp);
            return;
          }

          const buildTriggers = arrify(resp.triggers).map(bt => {
            const buildTriggerInstance = this.buildTrigger(bt.id, (bt as BuildTriggerMetadata));
            return buildTriggerInstance;
          });

          let nextQuery;
          if (resp.nextPageToken) {
            nextQuery = extend({}, query, {pageToken: resp.nextPageToken});
          }

          callback!(null, buildTriggers, nextQuery, resp);
        });
  }

  public operation(name: string, callback?: any): void | Promise<[Operation, any]> {

    // @TODO validate name /operations/some/unique/name
    this.request(
      {
        method: 'GET',
        uri: `/${name}`,
        qs: ''
      },
      (err, resp) => {
        if (err) {
          callback!(err, null, resp);
          return;
        }

        const operation: Operation = resp;
  
        // @developer @archelogos
        // That's the non-null assertion operator (https://stackoverflow.com/questions/42273853/in-typescript-what-is-the-exclamation-mark-bang-operator-when-dereferenci)
        callback!(null, operation, resp);
      });

  }

}

/*! Developer Documentation
 *
 * These methods can be auto-paginated.
 */
paginator.extend(GCB, 'getBuildTriggers');

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisifyAll(GCB, {
  exclude: ['buildTrigger'],
});

export {GCB, BuildTrigger};
