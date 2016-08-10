#!/bin/bash

# usage: ./deploy.sh staging f0478bd7c2f584b41a49405c91a439ce9d944657

if [ ! -z "$1" ] ; then
  BRANCH=$1
else
  BRANCH=master
fi

if [ ! -z "$2" ]; then
  SHA1=$2
else
  SHA1=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
fi

if [ ! -z "$AWS_REGION" ]; then
  AWS_REGION=$AWS_REGION
else
  AWS_REGION="us-west-2"
fi

if [ ! -z "$AWS_ACCOUNT_ID" ]; then
  AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID
else
  AWS_ACCOUNT_ID=885535109371
fi

if [ ! -z "$PROJECT_NAME" ]; then
  NAME=$PROJECT_NAME
else
  NAME=express-angular
fi

if [ ! -z "$S3_BUCKET" ]; then
  EB_BUCKET=$S3_BUCKET
else
  EB_BUCKET=solutions
fi

if [ ! -z "$DOCKERRUN_FILE" ]; then
  DOCKERRUN_FILE=$DOCKERRUN_FILE
else
  DOCKERRUN_FILE=Dockerrun.aws.json
fi

VERSION=$BRANCH-$SHA1
DOCKERRUN_TMP=$DOCKERRUN_FILE.tmp

# aws configure set default.region $AWS_REGION
#
# Authenticate against our Docker registry
eval $(aws ecr get-login)

# Build and push the image
docker build -t $NAME:$VERSION .
docker tag $NAME:$VERSION $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:$VERSION
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$NAME:$VERSION

cp $DOCKERRUN_FILE $DOCKERRUN_TMP

# Replace the <AWS_ACCOUNT_ID> with the real ID
sed -i='' "s/<AWS_ACCOUNT_ID>/$AWS_ACCOUNT_ID/" $DOCKERRUN_TMP
# Replace the <NAME> with the real name
sed -i='' "s/<NAME>/$NAME/" $DOCKERRUN_TMP
# Replace the <TAG> with the real version number
sed -i='' "s/<TAG>/$VERSION/" $DOCKERRUN_TMP
# Replace the <AWS_REGION> with the AWS region
sed -i='' "s/<AWS_REGION>/$AWS_REGION/" $DOCKERRUN_TMP
# Replace the <GIT_REPO> with the git repository
sed -i='' "s/<GIT_REPO>/$GIT_REPO/" $DOCKERRUN_TMP

aws s3 cp $DOCKERRUN_TMP s3://$EB_BUCKET/$DOCKERRUN_TMP

# Create a new application version with the zipped up Dockerrun file
aws elasticbeanstalk create-application-version --application-name $NAME-application \
    --version-label $VERSION --source-bundle S3Bucket=$EB_BUCKET,S3Key=$DOCKERRUN_TMP

# Update the environment to use the new application version
aws elasticbeanstalk update-environment --environment-name $NAME \
      --version-label $VERSION

rm $DOCKERRUN_TMP
