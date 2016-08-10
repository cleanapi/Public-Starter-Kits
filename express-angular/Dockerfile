FROM node:6.3.1

MAINTAINER Ivan Turkovic <ivan.turkovic@gmail.com>

RUN useradd --user-group --create-home --shell /bin/false app
RUN npm install --global gulp bower

RUN apt-get update
RUN apt-get -qq update
RUN apt-get install -y \
    nginx \
    supervisor \
    postgresql-client

ENV HOME=/home/app

COPY package.json bower.json .bowerrc .env $HOME/project/
RUN chown -R app:app $HOME/*

USER app
WORKDIR /home/app/project
RUN npm set progress=false
RUN npm install
RUN npm set progress=true

USER root
COPY . $HOME/project
RUN chown -R app:app $HOME/*

ADD conf/supervisord.conf /etc/supervisord.conf

RUN rm -rf /var/cache/apt/archives

# Copy our nginx config
RUN rm -Rf /etc/nginx/nginx.conf
ADD conf/nginx.conf /etc/nginx/nginx.conf

# nginx site conf
RUN mkdir -p /etc/nginx/sites-available/ && \
  mkdir -p /etc/nginx/sites-enabled/ && \
  mkdir -p /etc/nginx/ssl/
RUN rm /etc/nginx/sites-available/default
ADD conf/nginx-site.conf /etc/nginx/sites-available/default.conf
ADD conf/nginx-site-ssl.conf /etc/nginx/sites-available/default-ssl.conf
RUN ln -s /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf

# Add Scripts
ADD scripts/start.sh /start.sh
ADD scripts/pull /usr/bin/pull
ADD scripts/push /usr/bin/push
ADD scripts/letsencrypt-setup /usr/bin/letsencrypt-setup
ADD scripts/letsencrypt-renew /usr/bin/letsencrypt-renew
RUN chmod 755 /usr/bin/pull && chmod 755 /usr/bin/push && chmod 755 /usr/bin/letsencrypt-renew && chmod 755 /usr/bin/letsencrypt-setup && chmod 755 /start.sh

RUN mkdir -p /var/log/node/ && \
    mkdir -p /etc/nginx && \
    mkdir -p /run/nginx && \
    mkdir -p /var/log/supervisor

EXPOSE 443 80

CMD ["/start.sh"]
