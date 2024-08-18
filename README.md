
# Multi Level Comment System
This project provides a multi-level comment system API designed to handle nested comments with features such as creating posts, adding comments with nested replies, and pagination. The system is built with Node.js, Express, and PostgreSQL, and it is Dockerized for easy deployment. 

## Caution
Currently, the application is deployed on a free service. As a result, the free instance may spin down after periods of inactivity. This can cause delays in requests, potentially taking 50 seconds or more to respond.

## Table of Contents

1. **API s**
2. **Running Locally**
3. **Run Tests**
4. **Postman Collection Json**

## API S

#### Register User
- **Endpoint**: `POST https://multi-level-comment-system-jjre.onrender.com/api/auth/register`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }

### Login User
- **Endpoint**: `POST https://multi-level-comment-system-jjre.onrender.com/api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
    ```
    
#### The following APIs require an authorization token. You can obtain the JWT token from the login response.

### Create Post
- **Endpoint**: `POST https://multi-level-comment-system-jjre.onrender.com/api/posts/create-post`
 - **Request Headers**:
- ```http
   Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
    "content": "new post",
    "userId": 2
  }
 ### Create Comment
- **Endpoint**: `POST https://multi-level-comment-system-jjre.onrender.com/api/posts/3/comments`
- **Request Headers**:
- ```http
   Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
   "text": "nice",
   "postId": 3
  }
  
 ### Reply
- **Endpoint**: `POST https://multi-level-comment-system-jjre.onrender.com/api/posts/3/comments/4/reply`
 - **Request Headers**:
- ```http
   Authorization: Bearer <token>
- **Request Body**:
  ```json
  {
   "postId": 3,
   "commentId": 4,
   "text": "second reply"
  }
 ### Get Comment
 - **Request Headers**:
- ```http
   Authorization: Bearer <token>
 - **Endpoint**: `https://multi-level-comment-system-jjre.onrender.com/api/posts/3/comments?sortBy=repliesCount&sortOrder=desc`
 
  
  ### Get Parent Level Comments
 - **Request Headers**:
- ```http
   Authorization: Bearer <token>
 - **Endpoint**: `https://multi-level-comment-system-jjre.onrender.com/api/posts/3/comments/4/expand?page=1&pageSize=10`
  
## Running Locally

1. **Clone Repository**: Begin by cloning the repository to your local machine.
2. **Add ENV** : Add  env files in the root as well as prisma folder. You can find sample in ``sample.env.function`` and ``sample.env``, which indicate where they are required.
3. **Install Dependancies**: Execute the following commands in your terminal:
    ```bash
   npm i
    ```
4. **Start Application**: Execute the following commands in your terminal:
    ```bash
   npm run start
    ```
  
## Run Test
1. Execute the following commands in your terminal:
    ```bash
   npm run test
    ```
## Postman Collection
For detailed API documentation and to test the endpoints, you can use the provided Postman collection. The ``postman-collection.json`` file is located in the root directory of this repository.

This collection includes pre-configured requests for all available API endpoints, making it easier to explore and test the API directly in Postman.
