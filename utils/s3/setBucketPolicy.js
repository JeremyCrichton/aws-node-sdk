/**
 * Create a simple bucket policy that allows public read access
 * argv[2]: BUCKET_NAME
 */

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Create S3 service object
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

var readOnlyAnonUserPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'AddPerm',
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: [''],
    },
  ],
};

// create selected bucket resource string for bucket policy
var bucketResource = 'arn:aws:s3:::' + process.argv[2] + '/*';
readOnlyAnonUserPolicy.Statement[0].Resource[0] = bucketResource;

// convert policy JSON into string and assign into params
var bucketPolicyParams = {
  Bucket: process.argv[2],
  Policy: JSON.stringify(readOnlyAnonUserPolicy),
};

// set the new policy on the selected bucket
s3.putBucketPolicy(bucketPolicyParams, function (err, data) {
  if (err) {
    // display error message
    console.log('Error', err);
  } else {
    console.log('Success', data);
  }
});
