/**
 *  argv[2]: New bucket name
 *  argv[3]: File to upload to new bucket
 */

/*
 * - Create an S3 bucket (createBucket.js)
 * - Upload static files (uploadToBucket.js)
 * - Enable static website hosting (createBucketWebConfig.js)
 * - Add a bucket policy that allows public read access (setBucketPolicy.js)
 * - Run this file with endpoint from static website hosting dialog box without the leading http://
 */

const AWS = require('aws-sdk');

// Create S3 service object
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Get bucket name from params
const bucketName = process.argv[2];

// Get upload filename from params
const file = process.argv[3];

// Configure the file stream and obtain the upload parameters
const fs = require('fs');
const fileStream = fs.createReadStream(file);
fileStream.on('error', function (err) {
  console.log('File Error', err);
});
const path = require('path');
const uploadKeyName = path.basename(file);

// Create a promise on S3 service object
const bucketPromise = s3.createBucket({ Bucket: bucketName }).promise();

console.log('Creating S3 Bucket');
bucketPromise
  .then(data => {
    console.log('S3 Bucket Created');
    console.log(data);
    // Specify details of upload
    const uploadParams = {
      Bucket: bucketName,
      Key: uploadKeyName,
      Body: fileStream,
      ContentType: 'text/html',
    };
    console.log('uploadParams', uploadParams);
    // Create a promise for object upload
    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
      .putObject(uploadParams)
      .promise();
    uploadPromise
      .then(data => {
        console.log(
          'Successfully uploaded data to ' + bucketName + '/' + uploadKeyName
        );
        console.log(data.location);
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });

// OLD CODE
// call S3 to create the bucket
// s3.createBucket(bucketParams, function (err, data) {
//   if (err) {
//     console.log('Error', err);
//   } else {
//     console.log('Success', data.Location);
//   }
// });
