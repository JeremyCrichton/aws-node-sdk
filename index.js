/*
 * - Create an S3 bucket (createBucket.js)
 * - Upload static files (uploadToBucket.js)
 * - Enable static website hosting (createBucketWebConfig.js)
 * - Add a bucket policy that allows public read access (setBucketPolicy.js)
 * - Run this file with endpoint from static website hosting dialog box without the leading http://
 */

const AWS = require('aws-sdk');

// Create S3 service object
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Create the parameters for calling createBucket
var bucketParams = {
  Bucket: process.argv[2],
};

// call S3 to create the bucket
s3.createBucket(bucketParams, function (err, data) {
  if (err) {
    console.log('Error', err);
  } else {
    console.log('Success', data.Location);
  }
});
