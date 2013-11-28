var async = require('async');
var util = require('util');
var assert = require('assert');

var formsRulesEngine = require('../../lib/common/forms-rule-engine.js');

var TEST_BASIC_FORM_2_PAGE_1_NAME = "TEST_BASIC_FORM_1_PAGE_1_NAME";
var TEST_BASIC_FORM_2_PAGE_1_ID = "000000000000000000000001";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_1_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_1_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_1_TYPE = "text";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID = "000000000000000000000002";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_2_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_2_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_2_TYPE = "textarea";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID = "000000000000000000000003";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_3_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_3_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_3_TYPE = "number";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID = "000000000000000000000004";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_4_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_4_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_4_TYPE = "sectionBreak";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID = "000000000000000000000005";

var TEST_BASIC_FORM_2_PAGE_1_FIELD_5_NAME = "TEST_BASIC_FORM_2_PAGE_1_FIELD_5_NAME";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_5_TYPE = "emailAddress";
var TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID = "000000000000000000000006";

var TEST_BASIC_FORM_2_PAGE_2_NAME = "TEST_BASIC_FORM_2_PAGE_2_NAME";
var TEST_BASIC_FORM_2_PAGE_2_ID = "000000000000000000020001";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_1_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_1_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_1_TYPE = "text";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID = "000000000000000000020002";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_2_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_2_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_2_TYPE = "textarea";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID = "000000000000000000020003";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_3_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_3_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_3_TYPE = "number";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID = "000000000000000000020004";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_4_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_4_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_4_TYPE = "sectionBreak";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID = "000000000000000000020005";

var TEST_BASIC_FORM_2_PAGE_2_FIELD_5_NAME = "TEST_BASIC_FORM_2_PAGE_2_FIELD_5_NAME";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_5_TYPE = "emailAddress";
var TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID = "000000000000000000020006";

var TEST_BASIC_FORM_2_DEFINITION = {
  "updatedBy":"user@example.com",
  "name":"TEST_BASIC_FORM_2_DEFINITION",
  "lastUpdated":"2013-11-08T20:10:33.819Z",
  "lastUpdatedTimestamp": 1384800150848,
  "dateCreated":"2013-11-08T20:10:33.819Z",
  "description":"This form is for testing rules.",
  "_id":"527d4539639f521e0a000004",
  "pageRules":[
    {
      "type": "skip",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID,
        "restriction": "contains",
        "sourceValue": "hide page 2"
      }],
      "targetPage": TEST_BASIC_FORM_2_PAGE_2_ID,
      "_id":"527d4539639f521e0a007421"
    }
  ],
  "fieldRules":[
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide 3"
      }],
      "targetField": TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
      "_id":"527d4539639f521e0a054321"
    },
    {
      "type": "hide",
      "ruleConditionalOperator": "and",
      "ruleConditionalStatements": [{
        "sourceField": TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
        "restriction": "contains",
        "sourceValue": "hide 5"
      }],
      "targetField": TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID,
      "_id":"527d4539639f521e0a001234"
    }
  ],
  "pages":[
    {
      "name":TEST_BASIC_FORM_2_PAGE_1_NAME,
      "description":"This is a test page for the win.",
      "_id":TEST_BASIC_FORM_2_PAGE_1_ID,
      "fields":[
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_NAME,
          "helpText":"This is a text field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":20,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_NAME,
          "helpText":"This is a text area field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":3
            },
            "validation":{
              "min":50,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_NAME,
          "helpText":"This is a number field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":0,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_4_NAME,
          "helpText":"This is a sectionBreak field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_4_TYPE, //"sectionBreak",
          "required":false,
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_NAME,
          "helpText":"This is a Email field",
          "type":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_TYPE, //"emailAddress",
          "required":true,
          "fieldOptions":{
          },
          "_id":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID,
          "repeating":false
        }
      ]
    },
    {
      "name":TEST_BASIC_FORM_2_PAGE_2_NAME,
      "description":"This is a test page for the win.",
      "_id":TEST_BASIC_FORM_2_PAGE_2_ID,
      "fields":[
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_NAME,
          "helpText":"This is a text field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_TYPE,
          "required":true,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":20,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_NAME,
          "helpText":"This is a text area field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":3
            },
            "validation":{
              "min":50,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_NAME,
          "helpText":"This is a number field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_TYPE,
          "required":false,
          "fieldOptions":{
            "definition":{
              "maxRepeat":5,
              "minRepeat":2
            },
            "validation":{
              "min":0,
              "max":100
            }
          },
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_4_NAME,
          "helpText":"This is a sectionBreak field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_4_TYPE, //"sectionBreak",
          "required":false,
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID,
          "repeating":false
        },
        {
          "name":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_NAME,
          "helpText":"This is a Email field",
          "type":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_TYPE, //"emailAddress",
          "required":true,
          "fieldOptions":{
          },
          "_id":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID,
          "repeating":false
        }
      ]
    }
  ],
  "pageRef":{
    TEST_BASIC_FORM_2_PAGE_1_ID:0,
    TEST_BASIC_FORM_2_PAGE_2_ID:1,
  },
  "fieldRef": {
    TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID: {
      "page":0,
      "field":0
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID: {
      "page":0,
      "field":1
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID: {
      "page":0,
      "field":2
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID: {
      "page":0,
      "field":3
    },
    TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID: {
      "page":0,
      "field":4
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID: {
      "page":1,
      "field":0
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID: {
      "page":1,
      "field":1
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID: {
      "page":1,
      "field":2
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID: {
      "page":1,
      "field":3
    },
    TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID: {
      "page":1,
      "field":4
    },
  },
  "appsUsing":123,
  "submissionsToday":1234,
  "submissionsTotal":124125  
};

var TEST_BASIC_FORM_2_SUBMISSION_1 = {
   "appId":"appId123456",
   "appCloudName":"appCloudName123456",
   "appEnvironment":"devLive",
   "deviceId":"device123456",
   "deviceFormTimestamp":1384800150848,
   "comments":[
      {
         "madeBy":"somePerson@example.com",
         "madeOn":1384800150848,
         "value":"This is a comment"
      },
      {
         "madeBy":"somePerson@example.com",
         "madeOn":1384800150848,
         "value":"This is another comment"
      }
   ],
   "formFields":[
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
         "fieldValues":[
            12345
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID,
         "fieldValues":[
            "value for email field"
         ]
      },
            {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID,
         "fieldValues":[
            "value for text field (1)"
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID,
         "fieldValues":[
            12345
         ]
      },
      {
         "fieldId":TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID,
         "fieldValues":[
            "value for email field"
         ]
      }

   ]
};

// module.exports.testBasicForm2ValidateForm = function (finish) {

//   var options = {
//     "submission" : TEST_BASIC_FORM_2_SUBMISSION_1,
//     "definition" : TEST_BASIC_FORM_2_DEFINITION
//   };

//   var engine = formsRulesEngine(options);
//   engine.validateForm(function(err, res) {
//     assert.ok(!err, 'validation should not have returned error - err: ' + util.inspect(err));
//     assert.equal(res.errors.length, 0, 'should be 0 errors returned: ' + util.inspect(res));
//   });

// };


// module.exports.testBasicForm2SpecificFields = function (finish) {

//   var options = {
//     "submission" : TEST_BASIC_FORM_2_SUBMISSION_1,
//     "definition" : TEST_BASIC_FORM_2_DEFINITION
//   };

//   var engine = formsRulesEngine(options);

//   async.each([
//     TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
//     TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID,
//     TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID,
//     TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID
//   ], function (fieldID, cb) {
//     engine.validateField(field.fieldID, function(err,res) {
//       assert.ok(!err, 'validation should not have returned error, for fieldID:' + fieldID + ' - err: ' + util.inspect(err));
//       assert.equal(res.errors.length, 0);
//     });
//   }, function(err) {
//     assert.ok(!err);
//     finish();
//   });
// };

module.exports.testBasicForm2SpecificFieldsVisible = function (finish) {
  var options = {
    "submission" : TEST_BASIC_FORM_2_SUBMISSION_1,
    "definition" : TEST_BASIC_FORM_2_DEFINITION
  };

  var engine = formsRulesEngine(options);

  async.each([
    TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID,
    TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID, TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID,
    TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID, TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID,
    TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID
  ], function (fieldID, cb) {
    engine.isFieldVisible(fieldID, function(err,visible) {
      assert.ok(!err, 'validation should not have returned error, for fieldID:' + fieldID + ' - err: ' + util.inspect(err));
      assert.ok(!err, 'validation should not have returned error - err: ' + util.inspect(err));
      assert.ok(true === visible, 'Field:' + fieldID + ' should be marked as visible');
      return cb();
    });
  }, function(err) {
    assert.ok(!err);
    finish();
  });
};

module.exports.testBasicForm1SpecificFieldsVisibleWithFieldsOnPage2Invisible = function (finish) {
  var TEST_BASIC_FORM_2_SUBMISSION_2 = JSON.parse(JSON.stringify(TEST_BASIC_FORM_2_SUBMISSION_1));
  TEST_BASIC_FORM_2_SUBMISSION_2.formFields[1].fieldValues[0] = "hide page 2";   //  This should trigger rule that causes all fields on page 2 to be hidden
  var options = {
    "submission" : TEST_BASIC_FORM_2_SUBMISSION_2,
    "definition" : TEST_BASIC_FORM_2_DEFINITION
  };

  var engine = formsRulesEngine(options);

  async.each([
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_1_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_2_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_3_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_4_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_1_FIELD_5_ID, expectedVisible: true},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_1_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_2_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_3_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_4_ID, expectedVisible: false},
    { fieldID: TEST_BASIC_FORM_2_PAGE_2_FIELD_5_ID, expectedVisible: false}
  ], function (field, cb) {
    engine.isFieldVisible(field.fieldID, function(err,visible) {
      assert.ok(!err, 'validation should not have returned error, for fieldID:' + field.fieldID + ' - err: ' + util.inspect(err));
      assert.ok(field.expectedVisible === visible, 'Field:' + field.fieldID + ' should ' + (field.expectedVisible?"":" NOT ") + 'be marked as visible');
      return cb();
    });
  }, function (err) {
    assert.ok(!err);
    finish();
  });
}; 



