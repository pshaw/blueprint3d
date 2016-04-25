IMAGE_NAME=blueprint3d
CONTAINER_NAME=blueprint3d-container
HOST_PORT_NUMBER=8000
CONTAINER_PORT_NUMBER=8000

build:
	docker build -t $(IMAGE_NAME) $(PWD)

run:
	docker run -it -d --name $(CONTAINER_NAME) -p $(HOST_PORT_NUMBER):$(CONTAINER_PORT_NUMBER) $(IMAGE_NAME)

rm:
	docker rm -f $(CONTAINER_NAME)

rmi:
	make rm
	docker rmi -f $(IMAGE_NAME)

up:
	vagrant up

halt:
	vagrant halt

