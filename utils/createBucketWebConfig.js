/**
 * Allows a bucket to serve as a static web host
 * argv[2]: BUCKET_NAME
 * argv[3]: INDEX_PAGE
 * argv[4]: ERROR_PAGE
 */

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');

// Create S3 service object
s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Create JSON for putBucketWebsite parameters
var staticHostParams = {
  Bucket: '',
  WebsiteConfiguration: {
    ErrorDocument: {
      Key: '',
    },
    IndexDocument: {
      Suffix: '',
    },
  },
};

// Insert specified bucket name and index and error documents into params JSON
// from command line arguments
staticHostParams.Bucket = process.argv[2];
staticHostParams.WebsiteConfiguration.IndexDocument.Suffix = process.argv[3];
staticHostParams.WebsiteConfiguration.ErrorDocument.Key = process.argv[4];

// set the new website configuration on the selected bucket
s3.putBucketWebsite(staticHostParams, function (err, data) {
  if (err) {
    // display error message
    console.log('Error', err);
  } else {
    // update the displayed website configuration for the selected bucket
    console.log('Success', data);
  }
});
