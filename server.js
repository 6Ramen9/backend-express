require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const errorHandler = require('./errorHandler');

const app = express();
app.use(cors());
app.use(express.json());//parse the received data into json

//Route to get all the students
//sends back an array of object 
app.get('/etudiants', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT numEt AS "numEt", nom, moyenne FROM Etudiant');
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }

});
//handling the possible errors
app.use(errorHandler);

//Route to add a student
//gets an object (eg. etudiant = {numEt, nom, moyenne}) and sends back success message or error message
app.post('/etudiants', async (req, res, next) => {
    try {
        //supposedly the data from the request
        const { numEt, nom, moyenne } = req.body;
        const result = await pool.query(
            "INSERT INTO Etudiant (numEt, nom, moyenne) VALUES ($1, $2, $3) RETURNING *",
            [numEt, nom, moyenne]
        );
        const insertedStudent = result.rows[0];
        res.status(201).json({
            message: "Etudiant(e) inséré(e) avec succès.",
            etudiant: insertedStudent
        });
    } catch (error) {
        next(error);
    }
});

//handling the errors
app.use(errorHandler);

//Route for updating student's data
//gets an object (eg. updatedEtudiant = {numEt, nom, moyenne, oldNumEt}) the oldNumEt is supposed to be the original id before the update
//sends back success message or error messages
app.put('/etudiants/:numEt', async (req, res, next) => {
    try {
        //gets the numEt from the URL
        const oldNumEt = req.params.numEt;
        const { numEt, nom, moyenne } = req.body;

        const result = await pool.query(
            "UPDATE Etudiant SET numEt = $1, nom = $2, moyenne = $3 WHERE numEt = $4 RETURNING *",
            [numEt, nom, moyenne, oldNumEt]
        );

        if (result.rows.length > 0) {
            const updatedStudent = result.rows[0];
            res.status(200).json({
                message: "Etudiant(e) modifié(e) avec succès.",
                etudiant: updatedStudent
            });
        } else {
            res.status(404).json({ message: "Cet(te) Etudiant n'existe pas." });
        }
    } catch (error) {
        next(error);
    }
});

//handle the errors
app.use(errorHandler);

//Route for deleting a student
//gets the ID of the item to delete from the URL and sends back success message or error message
app.delete('/etudiants/:numEt', async (req, res, next) => {
    try {
        const numEt = req.params.numEt;

        const result = await pool.query("DELETE FROM Etudiant WHERE numEt = $1", [numEt]);

        if (result.rowCount > 0) {
            res.status(200).json({ message: "Etudiant(e) supprimé(e) avec succès." });
        } else {
            res.status(404).json({ message: "Cet(te) Etudiant n'existe pas." });
        }
    } catch (error) {
        next(error);
    }
});

//handle the errors
app.use(errorHandler);

//Route to get the minimum grade
//Sends an array of object ([{moyenne_minimum: value}])
app.get('/etudiants/moyenne/min', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT MIN(moyenne) AS "moyenne_min" FROM Etudiant');
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

//Route to get the maximum grade
//Sends an array of object ([{moyenne_maximum: value}])
app.get('/etudiants/moyenne/max', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT MAX(moyenne) AS "moyenne_max" FROM Etudiant');
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

//Route to get the average Grade
//Sends an array of object ([{moyenne_avg: value}])
app.get('/etudiants/moyenne/avg', async (req, res, next) => {
    try {
        // const result = await pool.query('SELECT SUM(moyenne) / COUNT(moyenne) AS "moyenne_avg" FROM Etudiant');
        const result = await pool.query('SELECT AVG(moyenne) AS "moyenne_avg" FROM Etudiant');
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

app.use(errorHandler);

//test route
// app.get('/etudiants/:numEt', async (req, res) => {
//     try {
//         const numEt = req.params.numEt;

//         const result = await pool.query(
//             "SELECT * FROM Etudiant WHERE numEt = $1",
//             [numEt]
//         );
//         const seachedStudent = result.rows[0];
//         res.json({
//             item: seachedStudent
//         });
//     } catch (error) {
//         console.error(error);

//     }
// });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});