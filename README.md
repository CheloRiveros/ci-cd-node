# Proceso de Integración

[Link a aplicación con CI-CD](g22-staging.tk)

## Integración Continua

### Setup
Para lograr un exitoso proceso de integración continua, se necesita sólo un único archivo: .travis.yml. Es este archivo el que leerá TravisCi para realizar el proceso de integración, una vez dado los permisos necesarios en el Repositorio.

Al inicio del archivo, se debe especificar en qué lenguaje se está desarrollando el proyecto. En este caso, backend se está desarrollando usando nodeJs, por lo que así lo especificamos:
```
language: node_js
```
Luego, como el deploy será en AWS, es necesario escribir las credenciales básicas para poder utilizar la consola, además del ECR necesario para poder lograrlo. El ECR es un servicio de AWS, y es el encargado de ir almacenando las imágenes de docker nuevas que se subirán en el paso de despliegue, explicado más adelante.
Así, usamos:
```
env:
  - AWS_USER_ID="197979423491" AWS_ECR_API="197979423491.dkr.ecr.us-east-2.amazonaws.com/chat"
```
 Estas serán las únicas variables de entorno **públicas**.

 Luego, se deben especificar los servicios a utilizar por travis. Así, usamos docker para generar imagenes de la aplicación para posteriormente ser utilizadas por la EC2, y usamos postgresql para realizar los test unitarios.
```
 services:
   - docker
   - postgresql
```
Cómo ultimo paso antes de especificar los comandos a realizar por travis, se especifica sobre cuáles branches se debe realizar todo este proceso:
```
branches:
    only:
      - master
```

### Hora de los Scripts

Bueno, antes de los scripts se debe realizar un último paso, y este es habilitar la base de datos de testing, por lo que hacemos:
```
before_script:
  - psql -c 'create database chat_app_test;' -U postgres
```
Ahora estamos listos para correr nuestros tests! Para esto usamos la sección script, que es donde se correrán todos los comandos necesarios para realizar la integración continua.
```
script:
  - echo "running tests"
  - sed -i -e 's/^M$//' scripts/start.sh
  - sed -i -e 's/^M$//' scripts/stop.sh
  - sed -i -e 's/^M$//' scripts/install.sh #correct files endings
  - cd backend
  - nvm install 12.0
  - npm install --silent
  - npm test
  - cd ..
  - zip -r -q latest * && echo "success" || echo "failure"
  - mkdir -p dpl_cd_upload
  - mv latest.zip dpl_cd_upload/latest.zip 
```
Si bien la sección de script tiene varias lineas, se puede separar en 3 partes:
- Los primeros comandos son para arreglar los scripts utilizados por codedeploy(Fin de linea de Windows).
- Los comandos del medio (hasta cd ..) son para correr los test unitarios en backend.
- Los ultimos comandos comprimen la aplicación en un zip que se subirá a S3 (utilizado por CodeDeploy para descargar el código)

Si alguno de los comandos falla, travis lanzará error y la integración no se llevará a cabo; en otro caso, se utilizan los siguientes comandos para crear una imagen docker de la carpeta de backend, taggearla (ponerle nombre) y pushearla al ECR:
```
after_success:
  - docker --version  # document the version travis is using
  - pip install --user awscli # install aws cli w/o sudo
  - export PATH=$PATH:$HOME/.local/bin # put aws in the path
  - eval $(aws ecr get-login --region us-east-2 --no-include-email)
  - docker build -t $AWS_ECR_API:latest backend
  - docker tag $AWS_ECR_API:latest
  - docker push $AWS_ECR_API:latest
  - docker images
```
Y  la integración está lista! Pero aún falta la segunda parte importante del proceso CI-CD: el proceso de despliegue.

## Despliegue Continuo

Para cumplir éxitosamente el proceso de despliegue, se usarán dos herramientas: travis y CodeDeploy.

### Travis
En el mismo archivo .travis.yml, especificamos los servicios que utilizaremos. En este caso será S3, para guardar el archivo comprimido de la aplicación para ser utilizado por la EC2 posteriormente; y CodeDeploy, que será el encargado de correr scripts para el correcto levantamiento de la aplicación. 

Para S3, usamos la siguiente porción de código:
```
- provider: s3 #To upload the code to s3
  access_key_id: $AWS_ACCESS_KEY_ID
  secret_access_key: $AWS_SECRET_ACCESS_KEY
  local_dir: dpl_cd_upload #from where
  skip_cleanup: true
  bucket: "chat-deploy-travis" 
  region: us-east-2
  upload-dir: latest
```

Aquí se hace uso de otras variables de entorno, las cuales son **secretas**, y por lo tanto se deben especificar en la página de Travis CI, sección variables de entorno. Allí, además, se deben especificar todas las variables de entorno a ser utilizadas por la aplicación. Además, se especifica el bucket S3 a tulizar, en que región se encuentra y el archivo a subir (nuestro archivo comprimido).


Para CodeDeploy, usamos:
```
- provider: codedeploy
  access_key_id: $AWS_ACCESS_KEY_ID
  secret_access_key: $AWS_SECRET_ACCESS_KEY
  bucket: "chat-deploy-travis"
  key: latest/latest.zip
  bundle_type: zip
  application: Chat
  deployment_group: Chat-api
  region: us-east-2
  wait_until_deployed: true
  on:
    branch: master
```
Aquí también se usan las mismas credenciales explicadas arriba, además de la aplicación a utilizar por CodeDeploy (Chat) y su grupo de despliegue (Chat-api). Sin esos dos creados en la consola de AWS, el proceso no va a funcionar, por lo que es **importante** no olvidar crearlos antes. Además, se especifica el bucket S3 en donde se guardó la aplicación, y la región en donde está alojada la aplicación de CodeDeploy. Por último, se especifica que se debe usar CodeDeploy en la branch master.

Por otra parte, CodeDeploy necesita de un archivo appspec.yml, que es donde se especifican los scripts a correr durante la instalación del código en la EC2. Por lo tanto, especificamos en dónde estaran alojados los scripts:
```
files:
  - source: scripts
    destination: /home/ec2-user/ci-cd-node
```
Y le damos permisos a ec2-user para poder correrlos:
```
permissions:
  - object: scripts
    pattern: "**"
    owner: ec2-user
```
Luego, CodeDeploy usa hooks para instalar la aplicación. En estos hooks se separan logicamente los pasos en que una EC2 incurre para levantar la aplicación. En esta ocasión, sólo necesitamos definir 3:
- ApplicationStop: lo usamos para detener el contenedor de docker usado actualmente
```
  ApplicationStop:
    - location: scripts/stop.sh
      timeout: 600
      runas: ec2-user
```
```
#!/bin/bash
docker-compose -f /home/ec2-user/ci-cd-node/docker-compose.prod.yml down
docker stop $(docker ps -a -q)
```
- AfterInstall: lo usamos descargar la última imagen de docker del ECR
```
  AfterInstall:
    - location: scripts/install.sh
      timeout: 600
      runas: ec2-user
```
```
#!/bin/bash
pwd=$( /usr/local/bin/aws ecr get-login-password )
docker container stop $(docker container ls -aq)
docker login -u AWS -p $pwd https://197979423491.dkr.ecr.us-east-2.amazonaws.com
docker pull 197979423491.dkr.ecr.us-east-2.amazonaws.com/chat
```
- ApplicationStart: levantar la nueva imagen de docker.
```
  ApplicationStart:
    - location: scripts/start.sh
      timeout: 600
      runas: ec2-user
```
```
#!/bin/bash
docker-compose -f /home/ec2-user/ci-cd-node/docker-compose.prod.yml up -d
```
Al completarse este proceso, en Travis aparecerá que el deployeo fue exitoso, terminando así el proceso de integración de la aplicación.
