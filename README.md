# API Documentation

#### Backend deployed at [Heroku](https://d-shop-server.herokuapp.com/) <br>

## Getting started

To get the server running locally:

- Clone this repo
- **npm install** to install all required dependencies
- **npm start** to start the local server

### Tech Stack
- MongoDB
- Express
- React
- Node.js

### dependencies

- bcryptjs: hashes & compares password
- cors: RESTRICTS cross-orgin HTTP request
- dotenv: loads environment variables from a .env file
- express: facilitates rapid development of Node based Web applications
- express-jwt: Express middleware to validate JSON Web Tokens
- jsonwebtoken: to create ACCESS tokens for an application
- mongoose: connect MongoDB database
- multer: use to upload files
- nodemon: restart Node.js application after a change has been made

## Endpoints

#### Products Routes

| Method | Endpoint                                     | Description                              |
| ------ | -------------------------------------------- | ---------------------------------------- |
| GET    | `/api/v1/`                                   | Get a all products in the database       |
| GET    | `/api/v1/get/count`                          | Get a product's count                    |
| GET    | `/api/v1/get/featured/:count`                | Get a featured product's count           |
| GET    | `/api/v1/:id`                                | Get all product's information            |
| POST   | `/api/v1/`                                   | Post a new product                       |
| PUT    | `/api/v1`                                    | Edit an existing product                 |
| PUT    | `/api/v1/gallery-images/:id`                 | Upload an image                          |
| DELETE | `/api/v1/:id`                                | Delete an existing prodcut               |

All GET routes does NOT require an `authorization ` header:

ALL POST, PUT, & DELETE routes REQUIRE a `JSONWebToken`:


## Environment Variables

create a .env file that includes the following:

    *  API_URL
    *  CONNECTION_STRING
    *  SECRET

## Contributing

When contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.

Please note we have a [code of conduct](./code_of_conduct.md). Please follow it in all your interactions with the project.

