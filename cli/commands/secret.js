'use strict';

var Q = require('q');

var config = require('../../config');
var logger = config.logger;

var cliHelpers = require('../helpers');

var secretTasks = require('../../lib/secret-tasks');

module.exports = function(program) {
	program.command('secret')
		.arguments('<environment>')
		.arguments('<action>', 'get|put secrets in/from secrets table')
		.option('-c, --context [env]', 'KMS Context in JSON format', null)
		.description('Interact with the secret table')
		.action(function(environment, action) {
			var runtimeOptions = this.opts();
			runtimeOptions.environment = environment;
			runtimeOptions.action = action.toLowerCase();

			if(typeof runtimeOptions.context === 'string')
				runtimeOptions.context = JSON.parse(runtimeOptions.context);

			Q.when(runtimeOptions)
				.then(cliHelpers.setup())
				.then(cliHelpers.lint)
				.then(secretTasks.verify)
				.then(secretTasks.generateSecretKey)
				.then(function(options){
					switch(action){
						case 'get': return secretTasks.getSecret(options);
						case 'put': return secretTasks.putSecret(options);
					}

					throw new Error("`"+action+"` is not a defined action for secrets");
				})
				.catch(function (err) {
					logger.error(err.message);
				});
		});
};
