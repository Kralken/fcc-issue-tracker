"use strict";
const { Schema, model, connect, Types } = require("mongoose");
require("dotenv").config();

connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

Schema.Types.String.checkRequired((v) => typeof v === "string");

const projectSchema = new Schema({
  project: {
    type: String,
    required: true,
    unique: true,
  },
});

const issueSchema = new Schema({
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_on: {
    type: Date,
    required: true,
  },
  updated_on: Date,
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: {
    type: String,
    default: "",
    required: true,
  },
  open: {
    type: Boolean,
    default: true,
    required: true,
  },
  status_text: {
    type: String,
    default: "",
    required: true,
  },
  project_id: Types.ObjectId,
});

const Project = model("Project", projectSchema);
const Issue = model("Issue", issueSchema);

function logRequest(req, res, next) {
  console.log("Method: " + req.method);
  console.log("Params: " + JSON.stringify(req.params));
  console.log("Query: " + JSON.stringify(req.query));
  console.log("Body: " + JSON.stringify(req.body));
  next();
}

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;
    })

    .post(async function (req, res) {
      let project = req.params.project;
      let issue = req.body;

      if (!issue.issue_title || !issue.issue_text || !issue.created_by) {
        res.status(200).json({ error: "required field(s) missing" });
        return;
      }

      let projectDoc = await Project.findOneAndUpdate(
        { project: project },
        { project: project },
        { upsert: true, returnDocument: "after" }
      );

      let issueDoc = new Issue({
        project_id: projectDoc._id,
        issue_title: issue.issue_title,
        issue_text: issue.issue_text,
        created_by: issue.created_by,
        created_on: new Date(),
        updated_on: new Date(),
        assigned_to: issue.assigned_to || "",
        open: true,
        status_text: issue.status_text,
      });
      await issueDoc.save();

      res.status(200).json({
        issue_title: issueDoc.issue_title,
        issue_text: issueDoc.issue_text,
        created_by: issueDoc.created_by,
        created_on: issueDoc.created_on,
        updated_on: issueDoc.updated_on,
        assigned_to: issueDoc.assigned_to,
        open: issueDoc.open,
        status_text: issueDoc.status_text,
        _id: issueDoc._id,
      });
    })

    .put(async function (req, res) {
      let issue = req.body;
      let allowedFields = [
        "issue_title",
        "issue_text",
        "created_by",
        "created_on",
        "updated_on",
        "assigned_to",
        "open",
        "status_text",
      ];

      if (!issue._id) {
        res.json({ error: "missing _id" });
        return;
      }

      let areThereValidFieldsToUpdate = false;
      for (const element of Object.keys(issue)) {
        if (allowedFields.includes(element)) {
          areThereValidFieldsToUpdate = true;
          break;
        }
      }

      if (!areThereValidFieldsToUpdate) {
        res.json({ _id: issue._id, error: "no update field(s) sent" });
        return;
      }

      let issueDoc;
      try {
        issueDoc = await Issue.findOne({ _id: issue._id });
      } catch (e) {
        res.json({ error: "could not update", _id: issue._id });
        return;
      }

      for (const [key, value] of Object.entries(issue)) {
        if (allowedFields.includes(key)) {
          if (value) {
            issueDoc[key] = value;
          }
        }
      }
      issueDoc.updated_on = new Date();

      await issueDoc.save();
      res.status(200).json({ _id: issue._id, result: "successfully updated" });
    })

    .delete(logRequest, async function (req, res) {
      if (!req.body._id) {
        res.json({ error: "missing _id" });
        return;
      }

      let _id = req.body._id;

      let issueDoc;
      try {
        issueDoc = await Issue.findOneAndDelete({ _id: _id });
      } catch (e) {
        res.json({ error: "could not delete", _id: _id });
        return;
      }
      if (!issueDoc) {
        res.json({ error: "could not delete", _id: _id });
        return;
      }
      res.status(200).json({ result: "successfully deleted", _id: _id });
    });
};
