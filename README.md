# GraphQL & REST API Showcase Portal

A modern, dual-program workspace pre-configured to run locally (with Node.js) and deploy seamlessly to Vercel as serverless functions. 

It includes two premium, glassmorphic visual dashboards:
1. **GraphQL Product Finder (Port 4000):** Consumes 1 query method to retrieve detailed mock products by ID, displaying the payload variables and GraphQL schema details.
2. **REST Task Board (Port 5000):** Consumes 5 HTTP methods (GET all, GET details, POST, PUT, DELETE) to run an interactive task list, complete with a live request/response HTTP inspector log.

---

## 🛠️ Step 1: Local Installation & Setup

Before running the programs, ensure you have [Node.js](https://nodejs.org/) installed, then run the commands below in your terminal.

1. Navigate to the project root directory:
   ```bash
   cd c:\laragon\www\REST_GRAPHQL
   ```
2. Install dependencies for both programs at once:
   ```bash
   npm run install:all
   ```

---

## 🚀 Step 2: Running the Programs Locally

Start both servers in your terminal to begin testing locally.

### Start the GraphQL Program (Port 4000)
```bash
npm run start:graphql
```
* Access the GraphQL dashboard: [http://localhost:4000](http://localhost:4000)
* GraphQL Endpoint: `http://localhost:4000/graphql`

### Start the REST Program (Port 5000)
Open a new terminal window and run:
```bash
npm run start:rest
```
* Access the REST dashboard: [http://localhost:5000](http://localhost:5000)
* REST Endpoint: `http://localhost:5000/api/tasks`

*Note: To view a central landing page linking both local dashboards, open the [index.html](./index.html) file directly in your browser.*

---

## 🧪 Step 3: Testing the APIs with Postman

### 1. GraphQL API (POST)
* **Method:** `POST`
* **URL:** `http://localhost:4000/graphql`
* **Body Configuration:**
  1. Go to the **Body** tab.
  2. Select **raw** and set the type dropdown to **JSON**.
  3. Paste this exact JSON query (GraphQL over HTTP requires this formatting):
     ```json
     {
       "query": "query FindProduct($id: ID!) { findProduct(id: $id) { id name category price stock description } }",
       "variables": {
         "id": "P101"
       }
     }
     ```
  4. Click **Send** to see the product details response. Try changing `"id"` to `P102` or `P103`.

---

### 2. REST API (5 Methods)

#### Method 1: List All Tasks (GET)
* **HTTP Method:** `GET`
* **URL:** `http://localhost:5000/api/tasks`
* **Action:** Click **Send** to retrieve the JSON list of all tasks.

#### Method 2: Get Single Task by ID (GET)
* **HTTP Method:** `GET`
* **URL:** `http://localhost:5000/api/tasks/T1`
* **Action:** Click **Send** to fetch details of task `T1`.

#### Method 3: Create a Task (POST)
* **HTTP Method:** `POST`
* **URL:** `http://localhost:5000/api/tasks`
* **Body:** Click **Body** -> Select **raw** -> Select **JSON**. Paste:
  ```json
  {
    "title": "Complete homework assignment",
    "description": "Demonstrate the REST endpoints in Postman.",
    "priority": "High"
  }
  ```
* **Action:** Click **Send**. The server will return the created task with status `201 Created` and a new ID (e.g. `T5`).

#### Method 4: Update a Task (PUT)
* **HTTP Method:** `PUT`
* **URL:** `http://localhost:5000/api/tasks/T2`
* **Body:** Click **Body** -> Select **raw** -> Select **JSON**. Paste:
  ```json
  {
    "title": "Draft Web Dashboard Stylesheet (Updated)",
    "completed": true,
    "priority": "Medium"
  }
  ```
* **Action:** Click **Send** to modify details or complete task `T2`.

#### Method 5: Delete a Task (DELETE)
* **HTTP Method:** `DELETE`
* **URL:** `http://localhost:5000/api/tasks/T4`
* **Action:** Click **Send** to remove task `T4` from the in-memory array database.

---

## ☁️ Step 4: Deploying to Vercel

Both folders contain a pre-configured `vercel.json` file. You can deploy them as separate projects on Vercel:

### Deploy GraphQL Program:
```bash
cd graphql-program
npx vercel
```

### Deploy REST Program:
```bash
cd rest-program
npx vercel
```
*Follow the browser prompts to link and deploy. Vercel will automatically compile the `api/index.js` files as Serverless Functions and host your frontends.*
