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
const fs = require('fs');
const path = require('path');

/**
 * INPUTS
 */
const bucketName = process.argv[2];
const file = process.argv[3];
const uploadKeyName = path.basename(file);

/**
 * UPDATE BUCKET POLICY
 */
const updateBucketPolicy = () => {
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
};

/**
 * UPLOAD FILE TO BUCKET
 */
const uploadFileToBucket = () => {
  const fileStream = fs.createReadStream(file);
  fileStream.on('error', function (err) {
    console.log('File Error', err);
  });

  const uploadParams = {
    Bucket: bucketName,
    Key: uploadKeyName,
    Body: fileStream,
    ContentType: 'text/html',
  };

  const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01' })
    .putObject(uploadParams)
    .promise();

  return uploadPromise;
};

const createCloudfrontDistribution = () => {
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
};

const createNewBucket = () => {
  // Create S3 service object
  const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

  const bucketPromise = s3.createBucket({ Bucket: bucketName }).promise();
  return bucketPromise;
};

console.log('Creating S3 Bucket...');
createNewBucket()
  .then(data => {
    console.log('S3 bucket created');

    console.log('Updating bucket policy');
    updateBucketPolicy();

    console.log('Uploading data to bucket...');
    uploadFileToBucket()
      .then(data => {
        console.log(
          `Successfully uploaded data to ${bucketName}/${uploadKeyName}`
        );

        createCloudfrontDistribution();
      })
      .catch(function (err) {
        console.error(err, err.stack);
      });
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
