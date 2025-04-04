require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

//Route to get all the students
app.get('/etudiants', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Etudiant");
        res.json(result.rows);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }

});

//Route to add a student
app.post('/etudiants', async (req, res) => {
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
        console.error("Erreur lors de l'insertion : ", error);
        res.status(500).json({
            message: "Erreur lors de l'insertion",
            error: error.message
        });
    }
});

//Route for updating student's data
app.put('/etudiants/:numEt', async (req, res) => {
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
            res.json({
                message: "Etudiant(e) modifié(e) avec succès.",
                etudiant: updatedStudent
            });
        } else {
            res.status(404).json({ message: "Cet(te) Etudiant n'existe pas." });
        }
    } catch (error) {
        console.error("Erreur lors de la modification : ", error);
        res.status(500).json({
            message: "Erreur lors de la modification",
            error: error.message
        });
    }
});

//Route for deleting a student
app.delete('/etudiants/:numEt', async (req, res) => {
    try {
        const numEt = req.params.numEt;

        const result = await pool.query("DELETE * FROM Etudiant WHERE numEt = $1", [numEt]);

        if (result.rowCount > 0) {
            res.json({ message: "Etudiant(e) supprimé(e) avec succès." });
        } else {
            res.status(404).json({ message: "Cet(te) Etudiant n'existe pas." });
        }
    } catch (error) {
        console.error("Erreur lors de la suppression : ", error);
        res.status(500).json({
            message: "Erreur lors de la suppression",
            error: error.message
        });
    }
});

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