const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { isValidObjectId } = require("mongoose");

chai.use(chaiHttp);

let issues = [];

suite("Functional Tests", function () {
  // Create an issue with every field: POST request to /api/issues/{project}
  test("Post request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testapi")
      .type("form")
      .send({
        issue_title: "Test issue title",
        issue_text: "this is where the issue test will appear",
        created_by: "test_created_user",
        assigned_to: "test_assigned_user",
        status_text: "this is the current status",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(
          res.body.issue_title,
          "Test issue title",
          "issue title should be correct"
        );
        assert.equal(
          res.body.issue_text,
          "this is where the issue test will appear",
          "issue text should be correct"
        );
        assert.isTrue(res.body.open, "issue should be open by default");
        assert.isTrue(
          isValidObjectId(res.body._id),
          "ObjectId should be generated and valid"
        );
        assert.isTrue(
          new Date(res.body.created_on) <= new Date(),
          "date should be valid"
        );
        assert.isTrue(
          new Date(res.body.updated_on) <= new Date(),
          "updated on date should be valid"
        );
        assert.equal(
          res.body.assigned_to,
          "test_assigned_user",
          "assigned user is correct"
        );
        assert.equal(
          res.body.status_text,
          "this is the current status",
          "status text is correct"
        );
        issues.push(res.body._id);
        done();
      });
  });
  // Create an issue with only required fields: POST request to /api/issues/{project}
  test("Post request to /api/issues/{project} with optional fields not filled in", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testapi")
      .type("form")
      .send({
        issue_title: "Test issue title 2",
        issue_text: "this is where the issue test will appear 2",
        created_by: "test_created_user 2",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200, "status should be 200");
        assert.equal(
          res.body.issue_title,
          "Test issue title 2",
          "issue title should be correct"
        );
        assert.equal(
          res.body.issue_text,
          "this is where the issue test will appear 2",
          "issue text should be correct"
        );
        assert.equal(res.body.created_by, "test_created_user 2");
        assert.isTrue(res.body.open, "issue should be open by default");
        assert.isTrue(
          isValidObjectId(res.body._id),
          "ObjectId should be generated and valid"
        );
        assert.isTrue(
          new Date(res.body.created_on) <= new Date(),
          "date should be valid"
        );
        assert.isTrue(
          new Date(res.body.updated_on) <= new Date(),
          "updated on date should be valid"
        );
        assert.isEmpty(res.body.assigned_to, "assigned user is correct");
        assert.isEmpty(res.body.status_text, "status text is correct");
        issues.push(res.body._id);
        done();
      });
  });
  // Create an issue with missing required fields: POST request to /api/issues/{project}
  test("POST request to /api/issues/{project} with missing required fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testapi")
      .type("form")
      .send({
        assigned_to: "test_assigned_user",
        status_text: "this is the current status",
      })
      .end(function (err, res) {
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });
  // Update one field on an issue: PUT request to /api/issues/{project}
  test("PUT request to edit one field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testapi")
      .type("form")
      .send({
        _id: issues[1],
        assigned_to: "updated name",
        issue_title: "",
      })
      .end(function (err, res) {
        assert.equal(res.body._id, issues[1]);
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });
  // Update multiple fields on an issue: PUT request to /api/issues/{project}
  test("PUT request to edit multiple line on an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testapi")
      .type("form")
      .send({
        _id: issues[0],
        issue_title: "Test issue title - updated",
        issue_text: "this is where the issue test will appear - updated",
        created_by: "test_created_user - updated",
        assigned_to: "test_assigned_user - updated",
        status_text: "this is the current status - updated",
        open: false,
      })
      .end(function (err, res) {
        assert.equal(res.body._id, issues[0]);
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });
  // Update an issue with missing _id: PUT request to /api/issues/{project}
  test("PUT request with missing _id field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testapi")
      .type("form")
      .send({
        issue_title: "test chagne in issue title",
      })
      .end(function (err, res) {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
  // Update an issue with no fields to update: PUT request to /api/issues/{project}
  test("PUT request with no fields to update", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testapi")
      .type("form")
      .send({
        _id: issues[0],
      })
      .end(function (err, res) {
        assert.equal(res.body._id, issues[0]);
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  });
  // Update an issue with an invalid _id: PUT request to /api/issues/{project}
  test("PUT request with invalid _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/testapi")
      .type("form")
      .send({
        _id: "thisisinvalid",
        issue_title: "test title",
      })
      .end(function (err, res) {
        assert.equal(res.body._id, "thisisinvalid");
        assert.equal(res.body.error, "could not update");
        done();
      });
  });
  // View issues on a project: GET request to /api/issues/{project}
  test("GET request for a project", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/testapi")
      .send()
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 2);
        assert.property(res.body[0], "_id");
        assert.property(res.body[0], "issue_title");
        assert.property(res.body[0], "issue_text");
        assert.property(res.body[0], "created_on");
        assert.property(res.body[0], "updated_on");
        assert.property(res.body[0], "created_by");
        assert.property(res.body[0], "assigned_to");
        assert.property(res.body[0], "open");
        assert.property(res.body[0], "status_text");
        done();
      });
  });
  // View issues on a project with one filter: GET request to /api/issues/{project}
  test("GET request for a project with one filter field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/testapi?open=true")
      .send()
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 1);
        assert.isTrue(res.body[0].open);
        done();
      });
  });
  // View issues on a project with multiple filters: GET request to /api/issues/{project}
  test("GET request for a project with multiple filter fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get(
        "/api/issues/testapi?issue_title=Test%20issue%20title%20-%20updated&created_by=test_created_user%20-%20updated&open=false&assigned_to=test_assigned_user%20-%20updated&invalidproperty=invalid"
      )
      .send()
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body[0].issue_title, "Test issue title - updated");
        assert.equal(
          res.body[0].status_text,
          "this is the current status - updated"
        );
        done();
      });
  });
  // Delete an issue with an invalid _id: DELETE request to /api/issues/{project}
  test("DELETE request with invalid ID", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testapi")
      .type("form")
      .send({ _id: "invalidId" })
      .end(function (err, res) {
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "invalidId");
        done();
      });
  });
  // Delete an issue with missing _id: DELETE request to /api/issues/{project}
  test("DELETE request without _id sent", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testapi")
      .type("form")
      .send({ issue_title: "test_issue_title" })
      .end(function (err, res) {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
  // Delete an issue: DELETE request to /api/issues/{project}
  test("valid DELETE request", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testapi")
      .type("form")
      .send({ _id: issues[0] })
      .end(function (err, res) {
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, issues[0]);
      });
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/testapi")
      .type("form")
      .send({ _id: issues[1] })
      .end(function (err, res) {
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, issues[1]);
        done();
      });
  });
});
