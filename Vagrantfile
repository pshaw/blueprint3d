# -*- mode: ruby -*-
# vi: set ft=ruby :

hostname   = "blueprint3d"
boxname    = "blueprint3d"
box_url    = "https://cloud-images.ubuntu.com/vagrant/trusty/current/trusty-server-cloudimg-amd64-vagrant-disk1.box"

Vagrant.configure(2) do |config|

  config.vm.define "#{boxname}" do |master|
  master.vm.box      = "#{boxname}"
  master.vm.hostname = "#{hostname}"
  master.vm.box_url  = "#{box_url}"

  config.vm.network "forwarded_port", guest: 8000, host: 8000
  config.vm.network "forwarded_port", guest: 22, host: 8100

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "private_network", ip: "192.168.100.20"

  config.vm.provider "virtualbox" do |vb|
    vb.name = master.vm.hostname.to_s
    vb.cpus   = 2
    vb.memory = 1024
  end
  
  config.vm.provision "shell", 
  name: "shell-config",
  inline: <<-SHELL
    WHOAMI=vagrant \
    && APP_HOME=/$WHOAMI \
    && cd $APP_HOME \
    && apt-get update -yq \
    && apt-get install -y curl supervisor \
    && curl -sL https://deb.nodesource.com/setup | sudo bash - \
    && apt-get update -yq \
    && apt-get install -yq git git-core nodejs \
    && npm install -g npm@latest-2 \
    && npm install -g browserify  \
    && npm install --no-bin-links \
    && npm update \
    && npm run-script build \
    && mkdir -p /var/log/supervisor \
    && sudo chmod g+w /var/log/supervisor \
    && sudo chown -R ${WHOAMI}:${WHOAMI} /var/log/supervisor \
    && sudo chown -R ${WHOAMI}:${WHOAMI} /home/${WHOAMI} \
    && mkdir -p /${WHOAMI}/logs/ \
    && cp /${WHOAMI}/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
  SHELL
 end

 config.vm.provision "shell", 
  name: "supervisord", 
  run: "always", 
  inline: "/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf &"
end
