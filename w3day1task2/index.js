const express = require("express");
const app = express();

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

app.use(express.json());

// 🔹 Swagger Config
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Users API",
            version: "1.0.0",
            description: "Simple CRUD API with Swagger",
        },
    },
    apis: ["./index.js"],
};

const specs = swaggerJsdoc(options);
const swaggerOptions = {
    customCssUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.min.js",
    ],
};

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, swaggerOptions),
);
// 🔹 Data
let users = [
    { id: 1, name: "Ali" },
    { id: 2, name: "Ahmed" }
];

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of users
 */
app.get("/users", (req, res) => {
    res.json(users);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get single user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
app.get("/users/:id", (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Umair
 *     responses:
 *       200:
 *         description: User created
 */
app.post("/users", (req, res) => {
    const maxId = users.length > 0
        ? Math.max(...users.map(u => u.id))
        : 0;

    const newUser = {
        id: maxId + 1,
        name: req.body.name
    };

    users.push(newUser);
    res.send(newUser);
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Name
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
app.put("/users/:id", (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.name = req.body.name;
    res.json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 */
app.delete("/users/:id", (req, res) => {
    users = users.filter(u => u.id != req.params.id);
    res.json({ message: "User deleted" });
});

// app.get("/",(req,res)=>{
//     res.json({status:"ok"})
// })

app.listen(3000, () => {
    console.log("Server running on port 3000");
});