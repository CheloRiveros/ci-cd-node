# Entrega 1 - Grupo 22

## Consideraciones generales

La aplicación fue desarrollada utilizando `Express`, `React` y `PostgreSQL` como _stack_. Se utilizó `docker-compose` para montar un ambiente de desarrollo y producción de forma más flexible, teniendo así el archivo `docker-compose.yml` para montar el ambiente de desarrollo y el archivo `docker-compose.prod.yml` para montar el ambiente de producción. Los 3 principales directorios contienen lo siguiente:

- **frontend**: contiene todo lo relacionado a la aplicación de frontend en `React`
- **backend**: contiene todo lo relacionado a la aplicación de backend en `Express`
- **nginx**: contiene todo lo relacionado al _reverse-proxy_ en `NGINX`

## Dominio

https://g22-iic2173.tk

## Ambiente de desarrollo

Para montar el ambiente de desarrollo basta correr:

```
docker-compose up --build
```

Para tener acceso a la aplicación de frontend en el puerto `3000` y al backend en el puerto `8080`.

## Ambiente de producción

Para montar el ambiente de producción se debe ingresar a la instancia `EC2` mediante `ssh`:

```
ssh -i keypair.pem ubuntu@100.25.12.45
```

Teniendo cuidado de tener el archivo `keypair.pem` en el directorio actual y que `100.25.12.45` sea la IP de la instancia.

Una vez dentro, se requiere crear el archivo `.env.prod` dentro del directorio `~/iic2173-proyecto-semestral-grupo22/backend`, el cual tendrá la información para conectar el modelo en `Sequelize` con la instancia en `RDS`, para utilizar el servicio OAuth de Google mediante `Passport` y para utilizar el mailer mediante `AWS Pinpoint`. Este se debe ver de la siguiente manera:

```
DB_HOST={AMAZON_RDS_HOST}
DB_NAME=chat_production
DB_USERNAME={AMAZON_RDS_USERNAME}
DB_PASSWORD={AMAZON_RDS_PASSWORD}
GOOGLE_CLIENT_ID={GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET={GOOGLE_CLIENT_SECRET}
AWS_ACCESS_KEY_ID={AWS_ACESS_KEY_ID}
AWS_SECRET_ACCESS_KEY={AWS_SECRET_ACESS_KEY}
SESSION_KEY={EXPRESS_SESSION_KEY}
```

Una vez presente este archivo, se requiere crear la base de datos `chat_production` dentro de nuestra instancia de `RDS`. En mi caso, instalé el cliente de postgreSQL en la instancia de EC2, por lo que basta correr el comando:

```
psql --host={AMAZON_RDS_HOST} --dbname postgres \
     --username={AMAZON_RDS_USERNAME} --password \
     --command="CREATE DATABASE chat_production WITH OWNER {AMAZON_RDS_USERNAME}"
```

Tras tener nuestra instancia lista, basta levantar el ambiente corriendo:

```
docker-compose -f docker-compose.prod.yml up --build
```

Desde el directorio `~/iic2173-proyecto-semestral-grupo22`. Tras esto, la aplicación estará corriendo en el puerto `80` mediante el _reverse-proxy_ `NGINX`.

### Seccion mínima (50%) (30p)

| Requisito                                                                                                                                                                                                                               | Estado     | Comentario                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| RF1: (3p) Se debe poder enviar mensajes y se debe registrar su timestamp. Estos mensajes deben aparecer en otro usuario, ya sea en tiempo real o refrescando la página. El no cumplir este requisito completamente limita la nota a 3.9 | Logrado    |                                                                                                                         |
| RF2: (5p) Se deben exponer endpoints HTTP que realicen el procesamiento y cómputo del chat para permitir desacoplar la aplicación. El no cumplir este requisito completamente limita la nota a 3.9                                      | Logrado    |                                                                                                                         |
| RF3: (7p) Establecer un AutoScalingGroup con una AMI de su instancia EC2 para lograr autoescalado direccionado desde un ELB (Elastic Load Balancer).                                                                                    | Logrado    | Se muestra el ID en la consola del navegador al realizar una función asíncrona que se conecta a un endpoint del backend |
| RF4: (2p) El servidor debe tener un nombre de dominio de primer nivel (tech, me, tk, ml, ga, com, cl, etc).                                                                                                                             | Logrado    |                                                                                                                         |
| RF5: (3p) El dominio debe estar asegurado por SSL con Let's Encrypt. No se pide auto renew. Tambien pueden usar el servicio de certificados de AWS para el ELB                                                                          | No logrado |                                                                                                                         |
| RF6: (3p) Utilizar un CDN para exponer los assets de su frontend. (ej. archivos estáticos, el mismo frontend, etc.). Para esto recomendamos fuertemente usar cloudfront en combinacion con S3.                                          | Logrado    |                                                                                                                         |
| RF7: (7p) Realizar una aplicación para el frontend que permita ejecutar llamados a los endpoints HTTP del backend.                                                                                                                      | Logrado    | Aplicación web en React                                                                                                 |

---

## Seccion variable

Deben completar al menos 2 de los 3 requisitos

### Trabajo delegado (25%) (15p)

Solo se realizó un delegación de trabajo, la cual corresponde a utilizar el `SDK` de `AWS` para enviar mails mediante el servicio `AWS Pinpoint` al ser mencionado en un chat. Esto se hizo configuró totalmente en `backend`, específicamente en la ruta `~/iic2173-proyecto-semestral-grupo22/backend/utils/mailer.js`.

Con respecto al servicio, este se habilitó solo para enviar mails y actualmente se encuentra en _sandbox mode_. Es por esto que actualmente no está en funcionamiento (a no ser que se mencione a @Verner Codoceo Berrocal, quien tiene un mail verificado).

### Mensajes en tiempo real (25%) (15p)

La implementación se desarrolló utilizando WebSockets, específicamente la librería de `socket.io` para `backend` y `socket.io-client` para `frontend`. Algunas restricciones importantes para este tipo de conexiones, es que deben _handlearse_ manualmente eventos como un corte de internet o una caída del servidor. También, que los exploradores muy antiguos no son compatibles con este tipo de conexiones.

Con respecto al sistema de menciones, este se desarrolló en ayuda del servicio `AWS Pinpoint` y el `SDK` de `AWS` para `JavaScript`. Tras leer el mensaje y notar que parte con `@`, se verifica que el string que contiene el mensaje corresponde a un nombre de usuario, si es así, se le envía un mail. Una restricción importante para la implementación, es que el servicio utilizado solo permite enviar correos a mails verificados dentro del _sandbox-mode_, por lo que actualmente las notificaciones de menciones no están habilitadas (a excepción del usuario mencionado en el punto anterior)

| Requisito                                                                                                                                                                                                                        | Estado  |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| RF1: (5p) Cuando se escriben mensajes en un chat/sala que el usuario está viendo, se debe reflejar dicha acción sin que éste deba refrescar su aplicación.                                                                       | Logrado |
| RF2: (5p) Independientemente si el usuario está conectado o no, si es nombrado con @ o # se le debe enviar una notificación (al menos crear un servicio que diga que lo hace, servicio que imprime "se está enviando un correo") | Logrado |
| RF3: (5p) Debe documentar los mecanismos utilizados para cada uno de los puntos anteriores indicando sus limitaciones/restricciones.                                                                                             | Logrado |

### Referencias

- https://medium.com/dataseries/how-to-build-a-chat-app-with-react-socket-io-and-express-190d927b7002
