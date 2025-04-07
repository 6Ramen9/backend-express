//function that sends specific error message according to postgres error code
function errorHandler(err, req, res, next) {
    console.error("Erreur: ", err);

    //Unique entry violation
    if (err.code === '23505') {
        return res.status(409).json({
            message: "Cet(te) Etudiant existe déjà.",
            error: "Entrée dupliquée"
        });
        //Missing field with NOT NULL constraint
    } else if (err.code === '23502') {
        return res.status(400).json({
            message: `Le champ ${err.column} ne doit pas être vide.`,
            error: "Champ manquant",
            field: err.column
        });
    }

    //other error
    return res.status(500).json({
        message: "Une erreur est survenue. Veuillez rééssayer.",
        error: "Erreur interne sur le serveur."
    });

}

module.exports = errorHandler;