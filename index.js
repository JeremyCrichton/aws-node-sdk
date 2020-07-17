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
var uuid = require('uuid');

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

console.log('Creating S3 Bucket...');
bucketPromise
  .then(data => {
    console.log('S3 bucket created');
    console.log('Uploading data to bucket...');
    // Specify details of upload
    const uploadParams = {
      Bucket: bucketName,
      Key: uploadKeyName,
      Body: fileStream,
      ContentType: 'text/html',
    };

    /*** UPDATE BUCKET POLICY ***/
    console.log('Updating bucket policy');
    s3Policy = new AWS.S3({ apiVersion: '2006-03-01' });

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
    var bucketResource = 'arn:aws:s3:::' + bucketName + '/*';
    readOnlyAnonUserPolicy.Statement[0].Resource[0] = bucketResource;

    // convert policy JSON into string and assign into params
    var bucketPolicyParams = {
      Bucket: bucketName,
      Policy: JSON.stringify(readOnlyAnonUserPolicy),
    };

    // set the new policy on the selected bucket
    s3Policy.putBucketPolicy(bucketPolicyParams, function (err, data) {
      if (err) {
        // display error message
        console.log('Error', err);
      } else {
        // console.log('Success', data);
        console.log('Successfully updated bucket policy');
      }
    });
    /*** END UPDATE BUCKET POLICY ***/

    // Create a promise for object upload
    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
      .putObject(uploadParams)
      .promise();
    uploadPromise
      .then(data => {
        console.log(
          'Successfully uploaded data to ' + bucketName + '/' + uploadKeyName
        );

        /*** CREATE CLOUDFRONT DISTRIBUTION  ***/

        const cloudfront = new AWS.CloudFront({ apiVersion: '2019-03-26' });
        const callerReference = 'jade-' + uuid.v4();
        const originDomainName = `${bucketName}.s3.amazonaws.com`;
        const originId = `S3-${bucketName}`; // unique ID of origin within the distribution

        const distParams = {
          DistributionConfig: {
            CallerReference: callerReference,
            Comment: callerReference,
            DefaultCacheBehavior: {
              ForwardedValues: {
                Cookies: {
                  Forward: 'none',
                  WhitelistedNames: {
                    Quantity: 0,
                  },
                },
                QueryString: false,
                Headers: {
                  Quantity: 0,
                },
                QueryStringCacheKeys: {
                  Quantity: 0,
                },
              },
              MinTTL: 0,
              TargetOriginId: originId,
              TrustedSigners: {
                Enabled: false,
                Quantity: 0,
              },
              ViewerProtocolPolicy: 'allow-all',
              AllowedMethods: {
                Items: ['GET', 'HEAD'],
                Quantity: 2,
                CachedMethods: {
                  Items: ['GET', 'HEAD'],
                  Quantity: 2,
                },
              },
              Compress: false,
              DefaultTTL: 86400,
              LambdaFunctionAssociations: {
                Quantity: 0,
              },
              MaxTTL: 31536000,
              SmoothStreaming: false,
            },
            Enabled: true,
            Origins: {
              Items: [
                {
                  DomainName: originDomainName,
                  Id: originId,
                  CustomOriginConfig: {
                    HTTPPort: 80,
                    HTTPSPort: 443,
                    OriginProtocolPolicy: 'match-viewer',
                  },
                },
              ],
              Quantity: 1,
            },
          },
        };

        console.log('Creating Cloudfront distribution...');
        cloudfront.createDistribution(distParams, (err, data) => {
          if (err) console.log(err, err.stack);
          // an error occurred
          else console.log('Successfully created Cloudfront distribution');
          // else console.log(data); // successful response
        });
        /*** END CREATE CLOUDFRONT DISTRIBUTION  ***/
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
