package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type Status struct {
	UserId    string
	ProblemId string
	Language  string
}

type Submission struct {
	JudgeId        int
	UserId         string
	ProblemId      string
	Language       string
	Version        string
	SubmissionTime string
	CpuTime        int
	Memory         int
}

func getSubmissionFromMap(mapSubmission map[string]interface{}) Submission {
	var submission Submission

	submission.JudgeId = int(mapSubmission["judgeId"].(float64))
	submission.UserId = mapSubmission["userId"].(string)
	submission.ProblemId = mapSubmission["problemId"].(string)
	submission.Language = mapSubmission["language"].(string)
	submission.Version = mapSubmission["version"].(string)
	submission.SubmissionTime = time.Unix(int64(mapSubmission["submissionDate"].(float64))/1000, 0).Format("2006-01-02 15:04:05")
	submission.CpuTime = int(mapSubmission["cpuTime"].(float64))
	submission.Memory = int(mapSubmission["memory"].(float64))

	return submission
}

func insertSubmission(db *sql.DB, submission Submission) {
	insertSubmissionQuery :=
		`INSERT INTO SUBMISSIONS(
			JUDGEID,
			USERID,
			PROBLEMID,
			LANGUAGE,
			VERSION,
			SUBMISSIONTIME,
			CPUTIME,
			MEMORY
		)
		VALUES(
			?, ?, ?, ?, ?, ?, ?, ?
		)
		ON DUPLICATE KEY UPDATE JUDGEID = JUDGEID`

	_, err := db.Exec(
		insertSubmissionQuery,
		submission.JudgeId,
		submission.UserId,
		submission.ProblemId,
		submission.Language,
		submission.Version,
		submission.SubmissionTime,
		submission.CpuTime,
		submission.Memory,
	)

	if err != nil {
		log.Fatal("Error inserting submission data: ", err)
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")

	log.Print(r.Method)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

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

	var status Status
	err = json.NewDecoder(r.Body).Decode(&status)
	if err != nil {
		log.Fatal("Error decoding json: ", err)
	}

	url := "https://judgeapi.u-aizu.ac.jp/solutions/problems/" + status.ProblemId

	response, err := http.Get(url)
	if err != nil {
		log.Fatal("Error http request: ", err)
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatal("Error reading response body: ", err)
	}

	var data []map[string]interface{}
	err = json.Unmarshal(body, &data)
	if err != nil {
		log.Fatal("Error decoding json: ", err)
	}

	for _, submission := range data {
		insertSubmission(db, getSubmissionFromMap(submission))
	}

	rows, err := db.Query(`SELECT * FROM SUBMISSIONS`)
	if err != nil {
		log.Fatal("Error selecting: ", err)
	}
	defer rows.Close()

	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	var submissions []Submission

	for rows.Next() {
		var submission Submission

		rows.Scan(
			&submission.JudgeId,
			&submission.UserId,
			&submission.ProblemId,
			&submission.Language,
			&submission.Version,
			&submission.SubmissionTime,
			&submission.CpuTime,
			&submission.Memory,
		)

		submissions = append(submissions, submission)
	}

	b, _ := json.Marshal(submissions)
	fmt.Fprint(w, string(b))
}

func main() {
	http.HandleFunc("/submissions", handler)
	log.Fatal(http.ListenAndServe(":8000", nil))
}
