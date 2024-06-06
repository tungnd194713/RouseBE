const fs = require("fs");
const AWS = require("aws-sdk");

// AWS Configuration
AWS.config.setPromisesDependency();
let AwsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
};
let FileBucket = process.env.S3_BUCKET;
AWS.config.update(AwsConfig);
let s3 = new AWS.S3();
let s3Stream = require("s3-upload-stream")(s3);

function MyCustomStorage(opts) {}

MyCustomStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  try {
    let fileExtension = file.originalname.split(".").pop();
    let fileName = file.originalname.split(".").slice(0, -1).join(".").trim().replace(/[^A-Z0-9]+/ig, "-").toLowerCase()+Date.now()+'.'+fileExtension;

    let upload = s3Stream.upload({
      Bucket: FileBucket,
      Key: `images/${fileName}`,
    });
    upload.maxPartSize(20971520); // 20 MB
    upload.concurrentParts(5);
    file.stream.pipe(upload);
    upload.on("error", function (error) {
      console.log(error)
      cb(error);
    });

    upload.on("part", function (details) {
      console.log(details);
    });

    upload.on("uploaded", function (details) {
      console.log(details);
      cb(null, {
        details: details,
      });
    });
  } catch (e) {
    console.log(e)
  }
};

MyCustomStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  fs.unlink(file.path, cb);
};

module.exports = function (opts) {
  return new MyCustomStorage(opts);
};
