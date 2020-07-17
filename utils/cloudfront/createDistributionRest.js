/**
 * - Run this file with endpoint from static website hosting dialog box without the leading http://
 */

const AWS = require('aws-sdk');
var uuid = require('uuid');

const cloudfront = new AWS.CloudFront({ apiVersion: '2019-03-26' });

// Create caller reference
// @TODO: update prefix
const callerReference = 'jade-' + uuid.v4();
const originDomainName = 'jc-test-bucket-and-upload.s3.amazonaws.com';
const originId = 'S3-jc-test-bucket-and-upload'; // unique ID of origin within the distribution

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

cloudfront.createDistribution(distParams, (err, data) => {
  if (err) console.log(err, err.stack);
  // an error occurred
  else console.log(data); // successful response
});
