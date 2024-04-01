package main

import (
    "database/sql"
    "fmt"
    "log"
    "os"

    _ "github.com/go-sql-driver/mysql"
)

func dropTable(db *sql.DB) {
    dropTableQuery := `DROP TABLE IF EXISTS SUBMISSIONS;`

    _, err := db.Exec(dropTableQuery)
    if err != nil {
        log.Fatal("Error dropping table: ", err)
    }
}

func createTable(db *sql.DB) {
    createSubmissionTableQuery :=
        `CREATE TABLE IF NOT EXISTS SUBMISSIONS (
            JUDGEID        BIGINT      NOT NULL PRIMARY KEY,
            USERID         VARCHAR(32) NOT NULL,
            PROBLEMID      VARCHAR(32) NOT NULL,
            LANGUAGE       VARCHAR(32) NOT NULL,
            VERSION        VARCHAR(32) NOT NULL,
            SUBMISSIONTIME DATETIME    NOT NULL,
            CPUTIME        INT         NOT NULL,
            MEMORY         INT         NOT NULL
        )`

    _, err := db.Exec(createSubmissionTableQuery)
    if err != nil {
        log.Fatal("Error creating table: ", err)
    }
}

func main() {
    host := os.Getenv("MYSQL_HOST")
    port := os.Getenv("MYSQL_PORT")
    user := os.Getenv("MYSQL_USER")
    password := os.Getenv("MYSQL_PASSWORD")
    dbname := os.Getenv("MYSQL_DATABASE_NAME")

    dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", user, password, host, port, dbname)

    db, err := sql.Open("mysql", dsn)
    if err != nil {
        log.Fatal("Error opening database: ", err)
    }
    defer db.Close()

    _, err = db.Exec(fmt.Sprintf("USE %s", dbname))
    if err != nil {
        log.Fatal("Error using database: ", err)
    }

    dropTable(db)
    createTable(db)
}
