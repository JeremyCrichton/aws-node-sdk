/**
 * Creates a Cloudfront distribution connected to a S3 bucket
 * set up for static website hosting
 *
 * Note: This configuration allows public read access on the related
 * S3 bucket
 *
 * Process
 * - Create an S3 bucket (createBucket.js)
 * - Upload static files (uploadToBucket.js)
 * - Enable static website hosting (createBucketWebConfig.js)
 * - Add a bucket policy that allows public read access (setBucketPolicy.js)
 * - Run this file with endpoint from static website hosting dialog box without the leading http://
 */

const AWS = require('aws-sdk');
var uuid = require('uuid');

const cloudfront = new AWS.CloudFront({ apiVersion: '2019-03-26' });

// Create caller reference
// @TODO: update prefix
const callerReference = 'jade-' + uuid.v4();
// const originDomainName = 'jc-test-bucket-rest.s3.amazonaws.com';
const originDomainName =
  'jc-test-bucket-web-jul-16.s3-website-us-east-1.amazonaws.com';
const originId = 'S3-jc-test-bucket-web-jul-16'; // unique ID of origin within the distribution

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

/*
Response

{
  Location: 'https://cloudfront.amazonaws.com/2019-03-26/distribution/E2OPO3ML2H6B19',
  ETag: 'EL7QVI318KF05',
  Distribution: {
    Id: 'E2OPO3ML2H6B19',
    ARN: 'arn:aws:cloudfront::434812305662:distribution/E2OPO3ML2H6B19',
    Status: 'InProgress',
    LastModifiedTime: 2020-07-17T00:08:56.524Z,
    InProgressInvalidationBatches: 0,
    DomainName: 'd32hrv3qzx1pc2.cloudfront.net',
    ActiveTrustedSigners: { Enabled: false, Quantity: 0, Items: [] },
    DistributionConfig: {
      CallerReference: 'jade-4408ee4e-c6ab-4fc0-974e-e3e3ba055bea',
      Aliases: [Object],
      DefaultRootObject: '',
      Origins: [Object],
      OriginGroups: [Object],
      DefaultCacheBehavior: [Object],
      CacheBehaviors: [Object],
      CustomErrorResponses: [Object],
      Comment: 'jade-4408ee4e-c6ab-4fc0-974e-e3e3ba055bea',
      Logging: [Object],
      PriceClass: 'PriceClass_All',
      Enabled: true,
      ViewerCertificate: [Object],
      Restrictions: [Object],
      WebACLId: '',
      HttpVersion: 'http2',
      IsIPV6Enabled: true
    },
    AliasICPRecordals: []
  }
}
*/
