var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var CONSTANTS = require('../constants');
var _ = require('underscore');

//Validator To Ensure Data Is Updated Correctly
function emptyValidator(value) {
  if (this.currentStatus && this.currentStatus.status === "ok") {
    return !!value;
  }
  return true;
}

/**
 * Converting DS Cache Entries To Field Format
 * @param fieldType
 * @param cacheEntries
 * @returns {Array}
 * @private
 */
function convertDSCacheToFieldOptions(fieldType, cacheEntries) {
  //Radio and Dropdown only allow the first option to be selected
  //Checkboxes can have multiple options selected.

  var alreadySelected = false;
  return _.map(cacheEntries, function(cacheEntry, index) {
    var valToReturn = {
      key: cacheEntry.key || index,
      label: cacheEntry.value,
      checked: cacheEntry.selected && (!alreadySelected || fieldType === CONSTANTS.FORM_CONSTANTS.FIELD_TYPE_CHECKBOXES)
    };
    if (valToReturn.checked) {
      alreadySelected = true;
    }
    return valToReturn;
  });
}

module.exports = {
  dataSourceCacheOption: function() {
    //Only the value is required, key and selected are optional
    return new Schema({
      key: {type: String, required: false},
      value: {type: String, required: true},
      selected: {type: Boolean, required: false}
    }, CONSTANTS.SCHEMA_OPTIONS_NO_ID);
  },
  dataSourceCacheEntry: function() {
    var self = this;

    return new Schema({
      lastRefreshed: {type: Date, validate: emptyValidator},
      updateTimestamp: {type: Date, required: true},
      //If a data source update gets an error, then this index will be incremented to increase the time between update cycles.
      backOffIndex: {type: Number, default: 0},
      currentStatus: {
        status: {type: String, enum: ["ok", "error"], required: true, default: "ok"},
        error: {
          code: {type: String, required: false},
          userDetail: {type: String, required: false},
          systemDetail: {type: String, required: false}
        }
      },
      dataHash: {type: String, validate: emptyValidator},
      data: {
        type: [self.dataSourceCacheOption()],
        validate: function(value) {
          if (this.currentStatus && this.currentStatus.status === "ok") {
            return value.length > 0;
          }

          return true;
        }
      }
    }, CONSTANTS.SCHEMA_OPTIONS_NO_ID);
  },
  dataSourceAuditLogEntry: function() {
    var AuditLogEntrySchema = new Schema({
      lastRefreshed: {type: Date, validate: emptyValidator},
      updateTimestamp: {type: Date, required: true},
      currentStatus: {
        status: {type: String, enum: ["ok", "error"], required: true, default: "ok"},
        error: {
          code: {type: String, required: false},
          userDetail: {type: String, required: false},
          systemDetail: {type: String, required: false}
        }
      },
      dataSource: { type: Schema.Types.ObjectId, ref: CONSTANTS.MODELNAMES.DATA_SOURCE },
      dataHash: {type: String, validate: emptyValidator},
      serviceGuid: {type: String, required: true},
      endpoint: {type: String, required: true},
      data: {
        type: [],
        validate: function(value) {
          if (this.currentStatus && this.currentStatus.status === "ok") {
            return value.length > 0;
          }

          return true;
        }
      }
    }, CONSTANTS.SCHEMA_OPTIONS);

    return AuditLogEntrySchema;
  },
  convertDSCacheToFieldOptions: convertDSCacheToFieldOptions
};
