const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  // Create an issue with every field: POST request to /api/issues/{project}
  // Create an issue with only required fields: POST request to /api/issues/{project}
  // Create an issue with missing required fields: POST request to /api/issues/{project}
  // View issues on a project: GET request to /api/issues/{project}
  // View issues on a project with one filter: GET request to /api/issues/{project}
  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  // Update one field on an issue: PUT request to /api/issues/{project}
  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  // Update an issue with missing _id: PUT request to /api/issues/{project}
  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  // Delete an issue: DELETE request to /api/issues/{project}
  // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
  // Delete an issue with missing _id: DELETE request to /api/issues/{project}
});
