var async=require('async');

/*
   NEW WAY

Sample Usage 

var engine = formsRulesEngine(form-definition);

engine.validateAll...
engine.validateForms(form-submission, function(err, res) {});

res:
{
    "validation": {
        "fieldId": {
            "fieldId": "",
            "valid": true,
            "errorMessages": [
                "length should be 3 to 5",
                "should not contain dammit",
                "should repeat at least 2 times"
            ]
        },
        "fieldId1": {

        }
    }
}


OR

engine.validateField(fieldId, submissionJSON, function(err,res) {});
// validate only field values on validation (no rules, no repeat checking)
res:
"validation":{
        "fieldId":{
            "fieldId":"",
            "valid":true,
            "errorMessages":[
                "length should be 3 to 5",
                "should not contain dammit"
            ]
        }
    }

OR

engine.checkRules(submissionJSON, unction(err, res) {})
// check all rules actions
res:
{
    "actions": {
        "pages": {
            "targetId": {
                "targetId": "",
                "action": "show|hide"
            }
        },
        "fields": {

        }
    }
}

*/


var FIELD_TYPE_CHECKBOX = "checkboxes";
var FIELD_TYPE_DATETIME = "dateTime";
var FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY = "date";
var FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY = "time";
var FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME = "dateTime";

var formsRulesEngine = function(formDef) {
  /*
    options.form.submission = form submission data
    options.form.definition = form definition data
  */

  var initialised;

  var definition = formDef;
  var submission;

  var fieldMap = {};
  var requiredFieldMap = {};
  var fieldRulePredicateMap = {};
  var fieldRuleSubjectMap = {};
  var pageRulePredicateMap = {};
  var pageRuleSubjectMap = {};
  var submissionFieldsMap = {};
  var validatorsMap = {
    "text":         validatorString,
    "textarea":     validatorString,
    "number":       validatorNumber, 
    "emailAddress": validatorEmail, 
    "dropdown":     validatorDropDown, 
    "radio":        validatorRadio, 
    "checkboxes":   validatorCheckboxes, 
    "location":     validatorLocation, 
    "locationMap":  validatorLocation, 
    "photo":        validatorFile,
    "signature":    validatorFile, 
    "file":         validatorFile, 
    "dateTime":     validatorDateTime, 
    "sectionBreak": validatorSection, 
    "matrix":       validatorMatrix
  };

  
  var isRulePredeciate = function(fieldId) {
   /*
    * fieldId = Id of field to check for reule predeciate references 
    */ 
    return !!rulePredicateMap[fieldId];
  };

  var isFieldRuleSubject = function(fieldId) {
   /*
    * fieldId = Id of field to check for reule subject references 
    */ 
    return !!fieldRuleSubjectMap[fieldId];
  };

  var isPageRuleSubject = function(pageId) {
   /*
    * pageId = Id of page to check for rule subject references 
    */ 
    return !!pageRuleSubjectMap[pageId];
  };

  /* Private functions */
  function buildFieldMap(cb) {
    // Iterate over all fields in form definition & build fieldMap
    async.each(definition.pages, function(page, cbPages) {
      async.each(page.fields, function(field, cbFields) {
        field.pageId = page._id;
        fieldMap[field._id] = field;
        if (field.required) {
          requiredFieldMap[field._id] = {field: field, submitted: false, validated: false};
        }
        return cbFields();
      }, function (err) {
        return cbPages();
      });
    }, cb);
  }

  function buildFieldRuleMaps(cb) {
    // Itterate over all rules in form definition & build ruleSubjectMap 
    // and rulePredicateMap keyed on field id with array of rule ids - e.g.
    //    ruleSubjectMap[fieldId] = ruleSubjectMap[fieldId] || [];
    //    ruleSubjectMap[fieldId].push(ruleId);

    async.each(definition.fieldRules, function(rule, cbRules) {
      async.each(rule.ruleConditionalStatements, function(ruleConditionalStatement, cbRuleConditionalStatements) {
        var fieldId = ruleConditionalStatement.sourceField;
        fieldRulePredicateMap[fieldId] = fieldRulePredicateMap[fieldId] || [];
        fieldRulePredicateMap[fieldId].push(rule);
        return cbRuleConditionalStatements();
      }, function (err) {
        fieldRuleSubjectMap[rule.targetField] = fieldRuleSubjectMap[rule.targetField] || [];
        fieldRuleSubjectMap[rule.targetField].push(rule);
        return cbRules();
      });
    }, cb);  
  }

  function buildPageRuleMap(cb) {
    // Itterate over all rules in form definition & build ruleSubjectMap 
    // and rulePredicateMap keyed on field id with array of rule ids - e.g.
    //    ruleSubjectMap[fieldId] = ruleSubjectMap[fieldId] || [];
    //    ruleSubjectMap[fieldId].push(ruleId);

    async.each(definition.pageRules, function(rule, cbRules) {
      var rulesId = rule._id;
      async.each(rule.ruleConditionalStatements, function(ruleConditionalStatement, cbRulePredicates) {
        var fieldId = ruleConditionalStatement.sourceField;
        pageRulePredicateMap[fieldId] = pageRulePredicateMap[fieldId] || [];
        pageRulePredicateMap[fieldId].push(rule);
        return cbRulePredicates();
      }, function (err) {
        pageRuleSubjectMap[rule.targetPage] = pageRuleSubjectMap[rule.targetPage] || [];
        pageRuleSubjectMap[rule.targetPage].push(rule);
        return cbRules();
      });
    }, cb);
  }

  function buildSubmissionFieldsMap(cb) {
    // iterate over all the fields in the submissions and build a map for easier lookup
    //  "formFields":[
    //    {
    //       "fieldId":"528a5f96fd026bc578000058",
    //       "fieldValues":[
    //          "test1",
    //          "test2"
    //       ]
    //    }
    //  ]
    async.each(submission.formFields, function(formField, cb) {
      if (!formField.fieldId) return cb(new Error("No fieldId in this submission entry: " + util.inspect(formField)));

      submissionFieldsMap[formField.fieldId] = formField.fieldValues;
      return cb();
    }, cb);
  }

  function init(cb) {
    if(initialised) return cb();
    async.parallel([
      buildFieldMap,
      buildFieldRuleMaps,
      buildPageRuleMap
    ], function(err) {
      if (err) return cb(err);
      initialised = true;
      return cb();
    });
  }

  function initSubmission(formSubmission, cb) {
    init(function(err){
      if (err) return cb(err);

      submission = formSubmission;
      buildSubmissionFieldsMap(cb);
    });
  }

  function validateForm(submission, cb) {
    init(function(err){
      if (err) return cb(err);

      initSubmission(submission, function (err) {
        if (err) return cb(err);

        async.waterfall([
          function (cb) {
            return cb(undefined, {validation:{valid: true}});  // any invalid fields will set this to false
          },
          function (res, cb) {
            // for each field, call validateField
            async.each(submission.formFields, function(submittedField, callback) {

              //
              // TODO if fieldVisible then validate
              //

              var fieldID = submittedField.fieldId;
              var fieldDef = fieldMap[fieldID];

              getFieldValidationStatus(submittedField, fieldDef, function(err, fieldRes) {
                if(err) return callback(err);

                if (!fieldRes.valid) {
                  res.validation.valid = false;        // indicate invalid form if any fields invalid
                  res.validation[fieldID] = fieldRes;  // add invalid field info to validate form result
                }

                // if a required field then update that fieldmap
                if (requiredFieldMap[fieldID]) {
                  requiredFieldMap[fieldID].submitted = true;
                  requiredFieldMap[fieldID].validated = fieldRes.valid;
                }

                return callback();
              });
            }, function(err) {
              if( err ) {
                return cb(err);
              }
              return cb(undefined, res);
            });
          },
          function (res, cb) {
            async.each(Object.keys(requiredFieldMap), function (requiredFieldId, cb) {
              var resField = {};
              if (!requiredFieldMap[requiredFieldId].submitted) {
                isFieldVisible(requiredFieldId, true, function (err, visible) {
                  if (err) return cb(err);
                  if (visible) {  // we only care about required fields if they are visible
                    resField.fieldId = requiredFieldId;
                    resField.valid = false;
                    resField.errorMessages = ["Required Field Not Submitted"];
                    res.validation[requiredFieldId] = resField;
                    res.validation.valid = false;                    
                  }
                  return cb();                  
                });
              } else { // was included in submission
                return cb();
              }
            }, function (err) {
              if (err) return cb(err);
              return cb(undefined, res);
            });
          }
        ], function (err, results) {
          if (err) return cb(err);

          return cb(undefined, results);
        });
      });
    });
  }

  function validateField(cb) {
    var res = {};
    res.fieldId = submittedField.fieldId;
    res.valid = false;
    res.errorMessages = [];
    res.errorMessages.push("external validate field Not implemented");  // TODO setup for, and call validateFieldInternal
    return cb(undefined, res);

// the external validateField will return structure:
//
//function (err) {
//       if (err) {
//         res.errorMessages.push(err.message);
//         res.valid = false;
//       } else {
//         res.valid = true;
//       }
//       return cb(undefined, res);
//     });
  }

  function getFieldValidationStatus(submittedField, fieldDef, cb) {  
    validateFieldInternal(submittedField, fieldDef, function(err) {
      // intentionally not checking err here, used further down to get validation errors
      var res = {};
      res.fieldId = submittedField.fieldId;
      res.errorMessages = [];

      if (err) {
        res.errorMessages.push(err.message);
        res.valid = false;
      } else {
        res.valid = true;
      }

      return cb(undefined, res);
    });
  }

  function validateFieldInternal(submittedField, fieldDef, cb) {

    async.series([
      async.apply(checkValueSubmitted, submittedField, fieldDef),
      async.apply(checkRepeat, submittedField, fieldDef),
      async.apply(checkValues, submittedField, fieldDef)
    ], cb);

    return;  // just functions below this

    function checkValueSubmitted(submittedField, fieldDefinition, cb) {
      var valueSubmitted = submittedField && submittedField.fieldValues && (submittedField.fieldValues.length > 0);
      if (!valueSubmitted) {
        return cb(new Error("No value submitted for field " + fieldDefinition.name));
      }
      return cb();
    }

    function checkRepeat(submittedField, fieldDefinition, cb) {
      var numSubmittedValues = submittedField.fieldValues.length;

      if(fieldDefinition.repeating && fieldDefinition.fieldOptions.definition){
        if(fieldDefinition.fieldOptions.definition.minRepeat){
          if(numSubmittedValues < fieldDefinition.fieldOptions.definition.minRepeat){
            return cb(new Error("Expected min of " + fieldDefinition.fieldOptions.definition.minRepeat + " values for field " + fieldDefinition.name + " but got " + numSubmittedValues));
          }
        }

        if (fieldDefinition.fieldOptions.definition.maxRepeat){
          if(numSubmittedValues > fieldDefinition.fieldOptions.definition.maxRepeat){
            return cb(new Error("Expected max of " + fieldDefinition.fieldOptions.definition.maxRepeat + " values for field " + fieldDefinition.name + " but got " + numSubmittedValues));
          }
        }
      } else {
        if(numSubmittedValues > 1) {
          return cb(new Error("Should not have multiple values for non-repeating field"));
        }
      }

      return cb();
    }

    function getValidatorFunction(fieldType, cb) {
      var validator = validatorsMap[fieldType];
      if (!validator) {
        return cb(new Error("Invalid Field Type " + fieldType));
      }

      return cb(undefined, validator);
    }

    function checkValues(submittedField, fieldDefinition, cb) {
      getValidatorFunction(fieldDefinition.type, function (err, validator) {       
        async.eachSeries(submittedField.fieldValues, function(fieldValue, cb){
          validator(fieldValue, fieldDefinition, cb);
        }, function (err) {
          if (err) return cb(err);

          return cb();
        });
      });
    }

  }

  function validatorString (fieldValue, fieldDefinition, cb) {
    if(typeof fieldValue !== "string"){
      return cb(new Error("Expected string but got" + typeof(fieldValue)));
    }

    if(fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.min){
      if(fieldValue.length < fieldDefinition.fieldOptions.validation.min){
        return cb(new Error("Expected minimum string length of " + fieldDefinition.fieldOptions.validation.min + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
      }
    }

    if(fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.max){
      if(fieldValue.length > fieldDefinition.fieldOptions.validation.max){
        return cb(new Error("Expected maximum string length of " + fieldDefinition.fieldOptions.validation.max + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
      }
    }

    return cb();
  }

  function validatorNumber (fieldValue, fieldDefinition, cb) {
    if(typeof fieldValue !== "number"){
      return cb(new Error("Expected number but got " + typeof(fieldValue)));
    }

    if(fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation && fieldDefinition.fieldOptions.validation.min){
      if(fieldValue < fieldDefinition.fieldOptions.validation.min){
        return cb(new Error("Expected minimum Number " + fieldDefinition.fieldOptions.validation.min + " but submission is " + fieldValue + ". Submitted number: " + fieldValue));
      }
    }

    if (fieldDefinition.fieldOptions.validation.max){
      if(fieldValue > fieldDefinition.fieldOptions.validation.max){
        return cb(new Error("Expected maximum Number " + fieldDefinition.fieldOptions.validation.max + " but submission is " + fieldValue + ". Submitted number: " + fieldValue));
      }
    }

    return cb();
  }

  function validatorEmail (fieldValue, fieldDefinition, cb) {
    if(typeof(fieldValue) !== "string"){
      return cb(new Error("Expected string but got" + typeof(fieldValue)));
    }

    if(fieldValue.match(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/g) === null){
      return cb(new Error("Invalid email address format: " + fieldValue));
    } else {
      return cb();
    }
  }

  function validatorDropDown (fieldValue, fieldDefinition, cb) {
    if(typeof(fieldValue) !== "string"){
      return cb(new Error("Expected dropdown submission to be string but got " + typeof(fieldValue)));
    }

    //Check value exists in the field definition
    if(!fieldDefinition.fieldOptions.definition.options){
      return cb(new Error("No dropdown options exist for field " + fieldDefinition.name));
    }

    var matchingOptions = fieldDefinition.fieldOptions.definition.options.filter(function(dropdownOption){
      return dropdownOption.label === fieldValue;
    });

    if(matchingOptions.length !== 1){
      return cb(new Error("Invalid number of dropdown options found: " + matchingOptions.length));
    }

    return cb();
  }

  function validatorRadio (fieldValue, fieldDefinition, cb) {
    if(typeof(fieldValue) !== "string"){
      return cb(new Error("Expected radio submission to be string but got " + typeof(fieldValue)));
    }

    //Check value exists in the field definition
    if(!fieldDefinition.fieldOptions.definition.options){
      return cb(new Error("No radio options exist for field " + fieldDefinition.name));
    }

    var matchingOptions = fieldDefinition.fieldOptions.definition.options.filter(function(radioOption){
      return radioOption.label === fieldValue;
    });

    if(matchingOptions.length !== 1){
      return cb(new Error("Invalid number of radio options found: " + matchingOptions.length));
    }

    return cb();
  }

  function validatorCheckboxes (fieldValue, fieldDefinition, cb) {
    var minVal;
    if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
      minVal = fieldDefinition.fieldOptions.validation.min;
    }
    var maxVal;
    if (fieldDefinition && fieldDefinition.fieldOptions && fieldDefinition.fieldOptions.validation) {
      maxVal = fieldDefinition.fieldOptions.validation.max;
    }

    if (minVal) {
      if(fieldValue.selections === null || fieldValue.selections === undefined || fieldValue.selections.length < minVal){
        var len;
        if(fieldValue.selections) {
          len = fieldValue.selections.length;
        }
        return cb(new Error("Expected a minimum number of selections " + minVal + " but got " + len));
      }
    }

    if(maxVal){
      if(fieldValue.selections){
        if(fieldValue.selections.length > maxVal){
          return cb(new Error("Expected a maximum number of selections " + maxVal + " but got " + fieldValue.selections.length));
        }
      }
    }

    var optionsInCheckbox = [];

    async.eachSeries(fieldDefinition.fieldOptions.definition.checkboxChoices, function(choice, cb){
      for(var choiceName in choice){
        optionsInCheckbox.push(choiceName);
      }
      return cb();
    }, function(err){
      async.eachSeries(fieldValue.selections, function(selection, cb){
        if(typeof(selection) !== "string"){
          return cb(new Error("Expected checkbox submission to be string but got " + typeof(selection)));
        }

        if(optionsInCheckbox.indexOf(selection) === -1){
          return cb(new Error("Checkbox Option " + selection + " does not exist in the field."));
        }

        return cb();
      }, cb);
    });
  }

  function validatorLocation (fieldValue, fieldDefinition, cb) {
    if(fieldDefinition.fieldOptions.locationUnit === "latLong"){
      if(fieldValue.lat && fieldValue.long){
        if(isNaN(parseFloat(fieldValue.lat)) || isNaN(parseFloat(fieldValue.lat))){
          return cb(new Error("Invalid latitude and longitude values"));
        } else {
          return cb();
        }
      } else {
        return cb(new Error("Invalid object for latitude longitude submission"));
      }
    } else {
      if(fieldValue.zone && fieldValue.eastings && fieldValue.northings){
        //Zone must be 3 characters, eastings 6 and northings 9
        return validateNorthingsEastings(fieldValue, cb);
      } else {
        return cb(new Error("Invalid object for northings easting submission. Zone, Eastings and Northings elemets are required"));
      }
    }

    function validateNorthingsEastings(fieldValue, cb){
      if(typeof(fieldValue.zone) !== "string" || fieldValue.zone.length !== 3){
        return cb(new Error("Invalid zone definition for northings and eastings location. " + fieldValue.zone));
      }

      if(typeof(fieldValue.eastings) !== "string" || fieldValue.eastings.length !== 6){
        return cb(new Error("Invalid eastings definition for northings and eastings location. " + fieldValue.eastings));
      }

      if(typeof(fieldValue.northings) !== "string" || fieldValue.northings.length !== 7){
        return cb(new Error("Invalid northings definition for northings and eastings location. " + fieldValue.northings));
      }

      return cb();
    };
  }

  function validatorFile (fieldValue, fieldDefinition, cb) {
    if(typeof(fieldValue) !== "string"){
      return cb(new Error("Expected string but got" + typeof(fieldValue)));
    }

    if(fieldValue.indexOf("filePlaceHolder") > -1){ //TODO abstract out to config
      return cb();
    } else {
      return cb(new Error("Invalid file placeholder text" + fieldValue));
    }
  }

  function validatorDateTime  (fieldValue, fieldDefinition, cb) {
    var testDate = new Date(fieldValue);

    if(testDate.toString() === "Invalid Date"){
      return cb(new Error("Invalid dateTime string " + fieldValue));
    } else {
      return cb();
    }
  }

  function validatorSection (value, fieldDefinition, cb) {
    return cb(new Error("Should not submit section field: " + fieldDefinition.name));
  }

  function validatorMatrix (value, fieldDefinition, cb) {
    return cb(new Error("Invalid Value for field: " + fieldDefinition.name + " - not implemented"));   // TODO - do we support Matrix fields?
  }

  function isFieldRequired(fieldId, cb) {
    /*
     * fieldId = Id of field to check for reule predeciate references 
     */ 
    init(function(err){
      if (err) return cb(err);

      return cb(new Error("Not Implemented - isFieldRequired"));

    });
  }


  function rulesResult(rules, cb) {
    var visible = true;

    // Itterate over each rule that this field is a predicate of
    async.each(rules, function(rule, cbRule) {
      // For each rule, itterate over the predicate fields and evaluate the rule
      var predicateMapQueries = [];
      var predicateMapPassed = [];
      async.each(rule.ruleConditionalStatements, function(ruleConditionalStatement, cbPredicates) {
        var field = fieldMap[ruleConditionalStatement.sourceField];
        var submissionValues = submissionFieldsMap[ruleConditionalStatement.sourceField] || [];
        var condition = ruleConditionalStatement.restriction;
        var testValue = ruleConditionalStatement.sourceValue;

        // Validate rule predictes on the first entry only.
        var passed = isConditionActive(field, submissionValues[0], testValue, condition);
        predicateMapQueries.push({"field": field, 
                                  "submissionValues": submissionValues, 
                                  "condition": condition,
                                  "testValue": testValue,
                                  "passed" : passed
                                });

        if( passed ) {
          predicateMapPassed.push(field);
        }
        return cbPredicates();
      }, function(err) {
        if(err) cbRule(err);

        function rulesPassed (condition, passed, quesies) {
          return ( (condition === "and" ) && (( passed.length == quesies.length ))) ||  // "and" condition - all rules must pass
           ( (condition === "or" )  && (( passed.length > 0 )));                        // "or" condition - only one rule must pass
        }

        if (rulesPassed(rule.ruleConditionalOperator, predicateMapPassed, predicateMapQueries)) {
          visible = (rule.type === "show");
        } else {
          visible = (rule.type !== "show");
        }
        return cbRule();
      });
    }, function(err) {
      if (err) return cb(err);

      return cb(undefined, visible);
    });
  }

  function isPageVisible(pageId, cb) {
    init(function(err){
      if (err) return cb(err);

      if (isPageRuleSubject(pageId)) {  // if the page is the target of a rule
        return rulesResult(pageRuleSubjectMap[pageId], cb);  // execute page rules
      } else {
        return cb(undefined, true);  // if page is not subject of any rule then must be visible
      }
    });
  }

  function isFieldVisible(fieldId, checkContainingPage, cb) {
    /*
     * fieldId = Id of field to check for reule predeciate references 
     * checkContainingPage = if true check page containing field, and return false if the page is hidden
     */
    init(function(err){
      if (err) return cb(err);

      // Fields are visable by default
      var visible = true;

      var field = fieldMap[fieldId];
      if (!fieldId) return cb(new Error("Field does not exist in form"));

      async.waterfall([
        function testPage(cb) {
          if (checkContainingPage) {
            isPageVisible(field.pageId, cb);
          } else {
            return cb(undefined, true);
          }
        },
        function testField(pageVisible, cb) {
          if (!pageVisible) {  // if page containing field is not visible then don't need to check field
            return cb(undefined, false);
          }

          if (isFieldRuleSubject(fieldId) ) { // If the field is the subject of a rule it may have been hidden
            return rulesResult(fieldRuleSubjectMap[fieldId], cb);  // execute field rules
          } else {
            return cb(undefined, true); // if not subject of field rules then can't be hidden 
          }
        }
      ], cb);
    });
  }

  // // check all rules actions
  // res:
  // {
  //     "actions": {
  //         "pages": {
  //             "targetId": {
  //                 "targetId": "",
  //                 "action": "show|hide"
  //             }
  //         },
  //         "fields": {
  //         }
  //     }
  function checkRules(submissionJSON, cb) {
    init(function(err){
      if (err) return cb(err);

      initSubmission(submissionJSON, function (err) {
        if(err) return cb(err);
        var actions = {};

        async.parallel([
          function (cb) {
            actions.fields = {};
            async.eachSeries(Object.keys(fieldRuleSubjectMap), function (fieldId, cb) {
              isFieldVisible(fieldId, false, function (err, fieldVisible) {
                if (err) return cb(err);
                actions.fields[fieldId] = {targetId: fieldId, action: (fieldVisible?"show":"hide")};
                return cb();
              });
            }, cb);
          },
          function (cb) {
            actions.pages = {};
            async.eachSeries(Object.keys(pageRuleSubjectMap), function (pageId, cb) {
              isPageVisible(pageId, function (err, pageVisible) {
                if (err) return cb(err);
                actions.pages[pageId] = {targetId: pageId, action: (pageVisible?"show":"hide")};
                return cb();
              });
            }, cb);
          }
        ], function (err) {
          if(err) return cb(err);

          return cb(undefined, {actions: actions});
        });
      });
    });
  }

  return {
    initSubmission: initSubmission,

    validateForm: validateForm,

    validateFieldInternal: validateFieldInternal,

    isFieldRequired: isFieldRequired,

    isFieldVisible: isFieldVisible,

    isConditionActive: isConditionActive,

    checkRules: checkRules
  };
};

function isConditionActive(field, fieldValue, testValue, condition) {

  var fieldType = field.type;
  var fieldOptions = field.fieldOptions;

  var valid = true;
  // Possible conditions:
  // "is not","is equal to","is greater than","is less than","is at",
  // "is before","is after","is", "contains", "does not contain", 
  // "begins with", "ends with"

  if( "is equal to" === condition) {
    valid = fieldValue === testValue;
  }
  else if( "is greater than" === condition) {
    // TODO - do numeric checking
    valid = fieldValue > testValue;
  }
  else if( "is less than" === condition) {
    // TODO - do numeric checking
    valid = fieldValue < testValue;
  }
  else if( "is at" === condition) {
    valid = false;
    if( fieldType === FIELD_TYPE_DATETIME ) {
      switch (fieldOptions.dateTimeUnit)
      {
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY:
        try{
          valid = (new Date(new Date(fieldValue).toDateString()).getTime() == new Date(new Date(testValue).toDateString()).getTime()); 
        }catch(e){
          valid = false;
        }
        break;
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY:

        break;
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME:
        try{
          valid = (new Date(fieldValue).getTime() == new Date(testValue).getTime()); 
        }catch(e){
          valid = false;
        }
        break;
      default:
        valid = false;  // TODO should raise error here?
        break;
      }
    }
  }
  else if( "is before" === condition) {
    valid = false;
    if( fieldType === FIELD_TYPE_DATETIME ) {
     switch (fieldOptions.dateTimeUnit)
      {
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY:
        try{
          valid = (new Date(new Date(fieldValue).toDateString()).getTime() < new Date(new Date(testValue).toDateString()).getTime()); 
        }catch(e){
          valid = false;
        }
        break;
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY:

        break;
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME:
        try{
          valid = (new Date(fieldValue).getTime() < new Date(testValue).getTime()); 
        }catch(e){
          valid = false;
        }
        break;
      default:
        valid = false;  // TODO should raise error here?
        break;
      }
    }
  }
  else if( "is after" === condition) {
    valid = false;
    if( fieldType === FIELD_TYPE_DATETIME ) {
     switch (fieldOptions.dateTimeUnit)
      {
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATEONLY:
        try{
          valid = (new Date(new Date(fieldValue).toDateString()).getTime() > new Date(new Date(testValue).toDateString()).getTime()); 
        }catch(e){
          valid = false;
        }
        break;
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_TIMEONLY:

        break;
      case FIELD_TYPE_DATETIME_DATETIMEUNIT_DATETIME:
        try{
          valid = (new Date(fieldValue).getTime() > new Date(testValue).getTime());
        }catch(e){
          valid = false;
        } 
        break;
      default:
        valid = false;  // TODO should raise error here?
        break;
      }
    }
  }
  else if( "is" === condition) {
    if (fieldType === FIELD_TYPE_CHECKBOX) {
      valid = fieldValue && fieldValue.selections && fieldValue.selections.indexOf(testValue) !== -1;
    } else {
      valid = fieldValue === testValue;
    }
  }
  else if( "is not" === condition) {
    if (fieldType === FIELD_TYPE_CHECKBOX) {
      valid = fieldValue && fieldValue.selections && fieldValue.selections.indexOf(testValue) === -1;
    } else {
      valid = fieldValue !== testValue;
    }
  }
  else if( "contains" === condition) {
    valid = fieldValue.indexOf(testValue) !== -1;
  }
  else if( "does not contain" === condition) {
      valid = fieldValue.indexOf(testValue) === -1;
  }
  else if( "begins with" === condition) {
    valid = fieldValue.substring(0, testValue.length) === testValue;
  }
  else if( "ends with" === condition) {
    valid = fieldValue.substring(Math.max(0, (fieldValue.length - testValue.length)), fieldValue.length) === testValue;
  }
  else {
    valid = false;
  }

  return valid;
}

  //   "sectionBreak" : function(fieldValue, cb){
  //     var self = this;
  //     return cb(new Error("Should not submit section breaks."));
  //   },
  //   "checkString" : function(fieldValue, cb){
  //     var self = this;

  //     if(typeof(fieldValue) !== "string"){
  //       return cb(new Error("Expected string but got" + typeof(fieldValue)));
  //     }

  //     if(fieldDefinition.fieldOptions.validation.min){
  //       if(fieldValue.length < fieldDefinition.fieldOptions.validation.min){
  //         return cb(new Error("Expected minimum string length of " + fieldDefinition.fieldOptions.validation.min + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
  //       }
  //     }

  //     if (fieldDefinition.fieldOptions.validation.max){
  //       if(fieldValue.length > fieldDefinition.fieldOptions.validation.max){
  //         return cb(new Error("Expected maximum string length of " + fieldDefinition.fieldOptions.validation.max + " but submission is " + fieldValue.length + ". Submitted val: " + fieldValue));
  //       }
  //     }

  //     return cb();
  //   },
  // };



module.exports = formsRulesEngine;