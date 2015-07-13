var forms = require('../forms.js');
var _ = require('underscore');
var resultHandler = require('./resultHandlers.js');
var constants = require('../common/constants.js').MIDDLEWARE;


function list(req, res, next){
  forms.getThemes(req.connectionOptions, resultHandler(constants.resultTypes.themes, req, next));
}

function create(req, res, next){
  var options = req.connectionOptions;
  var params = {
    userEmail: req.body.updatedBy
  };

  options = _.extend(options, params);
  forms.updateTheme(options, req.body, resultHandler(constants.resultTypes.themes, req, next));
}

function get(req, res, next){
  var params = {
    _id: req.params.id
  };

  forms.getTheme(_.extend(req.connectionOptions, params), resultHandler(constants.resultTypes.themes, req, next));
}

function update(req, res, next){
  var options = req.connectionOptions;
  var params = {
    userEmail: req.body.updatedBy
  };

  options = _.extend(options, params);
  forms.updateTheme(options, req.body, resultHandler(constants.resultTypes.themes, req, next));
}

function remove(req, res, next){
  var params = {
    _id: req.params.id
  };
  forms.deleteTheme(_.extend(req.connectionOptions, params), resultHandler(constants.resultTypes.themes, req, next));
}


function clone(req, res, next){
  var params = {
    _id: req.params.id,
    name: req.body.name,
    userEmail: req.body.updatedBy
  };
  forms.cloneTheme(_.extend(req.connectionOptions, params), resultHandler(constants.resultTypes.themes, req, next));
}

/**
 * Importing A Theme From A Template
 */
function importTheme(req, res, next){
  req.appformsResultPayload = req.appformsResultPayload || {};
  var themeData = (req.appformsResultPayload.data && req.appformsResultPayload.type === constants.resultTypes.themeTemplate) ? req.appformsResultPayload.data : undefined ;

  var importThemeParams = {
    theme: themeData,
    name: req.body.name,
    description: req.body.description,
    userEmail: req.user.email
  };

  forms.cloneTheme(_.extend(req.connectionOptions, importThemeParams), resultHandler(constants.resultTypes.themes, req, next));
}

module.exports = {
  list: list,
  create: create,
  get: get,
  clone: clone,
  update: update,
  remove: remove,
  import: importTheme
};