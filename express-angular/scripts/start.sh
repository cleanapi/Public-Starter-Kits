#!/bin/bash

# Disable Strict Host checking for non interactive git clones

mkdir -p -m 0700 /root/.ssh
echo -e "Host *\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

if [ ! -z "$SSH_KEY" ]; then
 echo $SSH_KEY > /root/.ssh/id_rsa.base64
 base64 -d /root/.ssh/id_rsa.base64 > /root/.ssh/id_rsa
 chmod 600 /root/.ssh/id_rsa
fi

# Set custom webroot
if [ ! -z "$WEBROOT" ]; then
 sed -i "s#root /home/app/project;#root ${WEBROOT};#g" /etc/nginx/sites-available/default.conf
else
 WEBROOT=/home/app/project
fi

# Setup git variables
if [ ! -z "$GIT_EMAIL" ]; then
 git config --global user.email "$GIT_EMAIL"
fi
if [ ! -z "$GIT_NAME" ]; then
 git config --global user.name "$GIT_NAME"
 git config --global push.default simple
fi

# Dont pull code down if the .git folder exists
if [ ! -z "$NODE_ENV" ]; then
  if [[ "$NODE_ENV" == "development" ]]; then
    echo "$NODE_ENV"
  else
    if [ ! -d "/home/app/project/.git" ]; then
      # Pull down code from git for our site!
      if [ ! -z "$GIT_REPO" ]; then
        # Remove the test index file
        rm -Rf /home/app/project/index.html
        if [ ! -z "$GIT_BRANCH" ]; then
          git clone -b $GIT_BRANCH $GIT_REPO /home/app/project
        else
          git clone $GIT_REPO /home/app/project
        fi
        chown -Rf nginx.nginx /home/app/project
      fi
    fi
  fi
fi

if [[ "$NODE_ENV" == "production" ]]; then
  git pull
fi

# DB tasks
if [ ! -z "$DB_HOST" ] ; then
  psql -h $DB_HOST -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_DATABASE'" | grep -q 1 || psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_DATABASE"
  cd $WEBROOT && node_modules/.bin/knex migrate:latest && echo "Migrations finished"
fi

## Install Node Packages
if [ -f "$WEBROOT/package.json" ] ; then
  cd $WEBROOT && npm set progress=false && npm install && echo "NPM modules installed"
fi

# Display Version Details or not
if [[ "$HIDE_NGINX_HEADERS" == "0" ]] ; then
 sed -i "s/server_tokens off;/server_tokens on;/g" /etc/nginx/nginx.conf
fi

# Very dirty hack to replace variables in code with ENVIRONMENT values
if [[ "$TEMPLATE_NGINX_HTML" == "1" ]] ; then
  for i in $(env)
  do
    variable=$(echo "$i" | cut -d'=' -f1)
    value=$(echo "$i" | cut -d'=' -f2)
    if [[ "$variable" != '%s' ]] ; then
      replace='\$\$_'${variable}'_\$\$'
      find /home/app/project -type f -exec sed -i -e 's/'${replace}'/'${value}'/g' {} \;
    fi
  done
fi

if [[ "$NODE_ENV" == "development" ]]; then
  cd $WEBROOT && gulp
else
  # Start supervisord and services
  /usr/bin/supervisord -n -c /etc/supervisord.conf
fi
