'use strict';

// These files do not need to be present. However, if they are, environment variables stored in them will be loaded in
// for the duration of the process.
// The .env.session file is generated by running the yadda authenticate command.
// The .env.yadda file is for setting any necessary temporary environment variables for deployments.
const dotenv = require('dotenv');
dotenv.load({ path: '.env.session' });
dotenv.load({ path: '.env.yadda'});

var Q = require('q');
var _ = require('lodash');

var config = require('../../config');
var logger = config.logger;

var cliHelpers = require('../helpers');
var deploymentTasks = require('../../lib/deployment-tasks');
var secretTasks = require('../../lib/secret-tasks');

function list(value) {
	return value.split(',');
}

module.exports = function(program) {
	program.command('deploy')
		.arguments('<environment>')
		.description('Deploy to ECS. Builds new docker image, pushes the image to ECR, creates a new Task Definition and updates the Service to use the new task definition')
		.option('-f, --file <manifest file>', 'Deployment manifest file to use for this deployment')
		.option('--tag <tag>', 'Image tag')
		.option('--update-only <services/jobs>', 'Only updates the provided command seperated list of services and/or jobs.', list)
		.action(function(environment) {
			var runtimeOptions = this.opts();
			runtimeOptions.environment = environment;
			Q.when(runtimeOptions)
				.then(cliHelpers.setup(cliHelpers.promptForMissingOptions))
				.then(cliHelpers.lint)
				.then(secretTasks.setupSecretCenter)
				.then(deploymentTasks.deploy)
				.catch(function (err) {
					logger.error(err.message);
				});
		});
};
