"use strict";
const { Schema, model, connect, Types } = require("mongoose");
require("dotenv").config();

connect(process.env.MONGO_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

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
  },
  open: {
    type: Boolean,
    default: true,
  },
  status_text: {
    type: String,
    default: "",
  },
  project_id: Types.ObjectId,
});

const Project = model("Project", projectSchema);
const Issue = model("Issue", issueSchema);

function logRequest(req, res, next) {
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

    .post(logRequest, function (req, res) {
      let project = req.params.project;
      let issue = req.body;
    })

    .put(function (req, res) {
      let project = req.params.project;
    })

    .delete(function (req, res) {
      let project = req.params.project;
    });
};
