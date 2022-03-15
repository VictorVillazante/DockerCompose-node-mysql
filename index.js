const express = require('express')

var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

var mysql = require("mysql");
var conn = mysql.createConnection({
    host: "mysql-server",
    user: "victor",
    password: "0",
    port: 3306,
    database: "twitter"
});
/*var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
    database: "twiter"
});*/

conectarseMySQL();

function conectarseMySQL() {
    conn.connect(
        function(err) {
            if (err) {
                console.log("*********ERROR**********");
                throw err;
            }
            console.log("Connected!");
            valoresIniciales();
        }
    );
}

function valoresIniciales() {
    ejecutarConsultasTablasDatosIniciales("create table USERS(user_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, username VARCHAR(400));");
    ejecutarConsultasTablasDatosIniciales("create table TWEETS(tweet_id INT AUTO_INCREMENT NOT NULL PRIMARY KEY, user_sender_id INT,text VARCHAR(1000),fecha TIMESTAMP, FOREIGN KEY(user_sender_id) REFERENCES USERS(user_id));");
    ejecutarConsultasTablasDatosIniciales("create table FOLLOWS(user_follower_id INT,user_followee_id INT,FOREIGN KEY(user_follower_id) REFERENCES USERS(user_id), FOREIGN KEY(user_followee_id)REFERENCES USERS(user_id));");
    ejecutarConsultasTablasDatosIniciales("INSERT INTO USERS VALUES (null,'Victor'),(null,'Manuel'),(null,'Pablo'),(null,'David');");
    ejecutarConsultasTablasDatosIniciales('INSERT INTO TWEETS VALUES (null,1,"Usuario 1 primer tweet",NOW()),(null,1,"Usuario 1 segundo tweet",NOW()),(null,2,"Usuario 2 primer tweet",NOW()),(null,2,"Usuario 2 segundo tweet",NOW()),(null,3,"Usuario 3 primer tweet",NOW()),(null,3,"Usuario 3 segundo tweet",NOW()),(null,4,"Usuario 4 primer tweet",NOW()),(null,4,"Usuario 4 segundo tweet",NOW());');
    ejecutarConsultasTablasDatosIniciales('INSERT INTO FOLLOWS VALUES (1,2),(1,3),(1,4),(2,3),(2,4);');
}

function ejecutarConsultasTablasDatosIniciales(consulta) {
    console.log(consulta);
    conn.query(consulta,
        function(err, result) {
            if (err) throw err;
            //console.log("Result: " + result);
            //res.json(result);
        }
    );
}

const app = express()
app.set('port', 80)

app.get('/despedida', (req, res) => {
    res.send("Adios")
})
app.post("/tweet", jsonParser, (req, res, next) => {
    console.log("Agregar nuevo tweet");
    const sql = "INSERT INTO TWEETS VALUES (null," + req.body.user_id.toString() + ",'" + req.body.text.toString() + "',NOW())";
    console.log(sql);
    conn.query(sql,
        function(err, result) {
            if (err) throw err;
            res.send("ok");
            //console.log("Result: " + result);
            //res.json(result);
        }
    );
    //Usar otro res.send("cadena") nos da errores y problemas
});
app.get("/timeline/:id", (req, res, next) => {
    console.log("Obtener tweets del usuario " + req.params.id);
    var idCliente = req.params.id;
    const sql = "SELECT TWEETS.text,USERS.username FROM TWEETS JOIN USERS ON TWEETS.user_sender_id=USERS.user_id JOIN FOLLOWS ON FOLLOWS.user_followee_id=USERS.user_id WHERE FOLLOWS.user_follower_id=" + idCliente;
    console.log(sql);
    conn.query(sql,
        function(err, result) {
            if (err) throw err;
            console.log("Result: " + result);
            res.json(result);
        }
    );
});
app.post("/seguir", jsonParser, (req, res, next) => {
    console.log("Registrar nueva persona seguida");
    const sql = "SELECT * FROM FOLLOWS WHERE FOLLOWS.user_follower_id= " + req.body.user_id.toString() + " AND FOLLOWS.user_followee_id=" + req.body.user_id_2.toString();
    var respuesta = "";
    console.log(sql);
    conn.query(sql,
        function(err, result) {
            if (err) throw err;
            console.log("El numero de coincidencias es:" + result);
            if (result.toString() != "") {
                respuesta = "El usuario " + req.body.user_id.toString() + " ya seguia al usuario " + req.body.user_id_2.toString();
            } else {
                const sql = "INSERT INTO FOLLOWS VALUES (" + req.body.user_id.toString() + "," + req.body.user_id_2.toString() + ")";
                console.log(sql);
                respuesta = "Se registra seguidor " + req.body.user_id.toString() + " a " + req.body.user_id_2.toString();
                conn.query(sql,
                    function(err, result) {
                        if (err) throw err;
                        //console.log("Result: " + result);
                        //res.json(result);
                    }
                );
            }
            //console.log("Result: " + result);
            //res.json(result);
            res.send(respuesta);
        }
    );
});


app.listen(app.get('port'), () => {
    console.log('Corriendo en el puerto ' + app.get('port'))
})