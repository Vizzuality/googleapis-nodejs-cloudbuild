
const path = require('path');

// Imports the Google Cloud client library
//import { CloudFunctionMetadata, CloudFunction } from 'googleapis-nodejs-functions';
//const { GCB } = require('googleapis-nodejs-functions');
import { GCB, BuildTrigger, BuildTriggerConfig,
    Operation } from '../build/src';

// Your Google Cloud Platform project ID
const projectId = 'cameratraprepo';

// Creates a client
const gcb = new GCB({
  keyFilename: `${path.join(__dirname, '../')}credentials.json`,
  projectId
});

// Get Functions
// const getBuildTriggers = async(): Promise<BuildTrigger[]>  => {
//   try {
//     const bts: BuildTrigger[] = await (gcb.getBuildTriggers() as Promise<[BuildTrigger[], any]>).then(value => value[0]);
//     console.log(bts.map(bt => bt.metadata));
//     return bts;
//   } catch (err) {
//     console.error(err);
//     throw Error(err);
//   }
// };

// getBuildTriggers();

// // Create a new Build Trigger
const createBuildTrigger = async(): Promise<BuildTrigger>  => {
  try {
    const buildTriggerConfig: BuildTriggerConfig = {
      description: 'wi_project_testing_three', // WIproject
      triggerTemplate: { 
        projectId: 'cameratraprepo',
        repoName: 'check-object',
        branchName: 'master'
      },
      substitutions: {
        _FUNCTION_NAME: 'wi_project_testing_three__check_object',
        _TRIGGER_EVENT: 'google.storage.object.finalize',
        _TRIGGER_RESOURCE: 'wi_project_testing_three__main' // WIproject bucket main
      },
      filename: 'cloudbuild-steps.yaml'
    }
    const bt: BuildTrigger = await (gcb.createBuildTrigger(buildTriggerConfig) as Promise<[BuildTrigger, any]>).then(value => value[0]);
    console.log(bt);
    return bt;
  } catch (err) {
    console.error(err);
    throw Error(err);
  }
};

createBuildTrigger();

