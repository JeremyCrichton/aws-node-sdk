/**
 * argv[2]: BUCKET_NAME
 */

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Create S3 service object
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

var bucketParams = { Bucket: process.argv[2] };

// call S3 to retrieve the website configuration for selected bucket
s3.getBucketWebsite(bucketParams, function (err, data) {
  if (err) {
    console.log('Error', err);
  } else if (data) {
    console.log('Success', data);
  }
});
