FROM ubuntu:14.04

ADD . /blueprint3d/

RUN apt-get update -yq \
 && apt-get install -y curl supervisor \
 && curl -sL https://deb.nodesource.com/setup | sudo bash - \
 && apt-get update -yq \
 && apt-get install -yq nodejs \
 && cd /blueprint3d \
 && npm install -g npm@latest-2  \
 && npm install -g browserify  \
 && npm install --no-bin-links \
 && npm update \
 && npm run-script build \
 && rm -rf /usr/lib/node_modules \
 && apt-get purge -y --auto-remove curl npm nodejs \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/ \
 && mv /blueprint3d/example / \
 && rm -rf /blueprint3d

EXPOSE 8000
WORKDIR example
CMD python -m SimpleHTTPServer 8000
