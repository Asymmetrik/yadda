'use strict';

//Naming of file is intentional

var Q = require('q');

var config = require('../../config');
var logger = config.logger;

var cliHelpers = require('../helpers');

var secretTasks = require('../../lib/secret-tasks');

module.exports = function(program) {
	program.command('create-secret-center')
		.arguments('<environment>')
		.description('Create secret table for a deployment center')
		.action(function(environment) {
			var runtimeOptions = this.opts();
			runtimeOptions.environment = environment;

			Q.when(runtimeOptions)
				.then(cliHelpers.setup())
				.then(cliHelpers.lint)
				.then(secretTasks.verify)
				.then(secretTasks.setupSecretCenter)
				.then(secretTasks.createSecretCenter)
				.then(secretTasks.createSecretCenterPolicy)
				.catch(function (err) {
					logger.error(err.message);
				});
		});
};
