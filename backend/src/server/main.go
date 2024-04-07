package main

import (
    "bytes"
    "database/sql"
    "encoding/json"
    "fmt"
    "io"
    "log"
    "net/http"
    "os"
    "strconv"
    "text/template"
    "time"

    _ "github.com/go-sql-driver/mysql"
)

type Status struct {
    UserId    string
    ProblemId string
    Language  string
    PageSize  int
    PageId    int
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

    jstLocation, err := time.LoadLocation("Asia/Tokyo")
    if err != nil {
        log.Print("Error UTC to JTC: ", err)
    }

    submission.JudgeId = int(mapSubmission["judgeId"].(float64))
    submission.UserId = mapSubmission["userId"].(string)
    submission.ProblemId = mapSubmission["problemId"].(string)
    submission.Language = mapSubmission["language"].(string)
    submission.Version = mapSubmission["version"].(string)
    submission.SubmissionTime = time.Unix(int64(mapSubmission["submissionDate"].(float64))/1000, 0).In(jstLocation).Format("2006-01-02 15:04:05")
    submission.CpuTime = int(mapSubmission["cpuTime"].(float64))
    submission.Memory = int(mapSubmission["memory"].(float64))

    return submission
}

func insertSubmission(db *sql.DB, submission Submission) (sql.Result, error) {
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

    return db.Exec(
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
}

func searchSubmission(db *sql.DB, status Status) (*sql.Rows, error) {
    searchSubmissionQuery :=
        `SELECT
            JUDGEID,
            USERID,
            PROBLEMID,
            LANGUAGE,
            VERSION,
            SUBMISSIONTIME,
            CPUTIME,
            MEMORY
        FROM (
            SELECT
                *,
                RANK() OVER (
                    ORDER BY
                        SUBMISSIONTIME DESC,
                        USERID ASC,
                        PROBLEMID ASC
                ) AS RNK
            FROM SUBMISSIONS
            WHERE
                1 = 1
                {{if .UserId}} AND USERID = ? {{end}}
                {{if .ProblemId}} AND PROBLEMID = ? {{end}}
                {{if .Language}} AND LANGUAGE = ? {{end}}
        ) AS RANKED_SUBMISSIONS
        WHERE
            RNK BETWEEN ? AND ?
        ORDER BY
            RNK ASC`

    var buf bytes.Buffer
    err := template.Must(template.New("tmpl").Parse(searchSubmissionQuery)).Execute(&buf, status)

    if err != nil {
        log.Print("Error text template: ", err)
    }

    var args []interface{}
    if status.UserId != "" {
        args = append(args, status.UserId)
    }
    if status.ProblemId != "" {
        args = append(args, status.ProblemId)
    }
    if status.Language != "" {
        args = append(args, status.Language)
    }
    args = append(args, status.PageSize*status.PageId+1)
    args = append(args, status.PageSize*(status.PageId+1))

    return db.Query(
        buf.String(),
        args...,
    )
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
        log.Print("Error opening database: ", err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    defer db.Close()

    _, err = db.Exec(fmt.Sprintf("USE %s", dbname))
    if err != nil {
        log.Print("Error using database: ", err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    var status Status
    err = json.NewDecoder(r.Body).Decode(&status)
    if err != nil {
        log.Print("Error decoding json: ", err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    url := "https://judgeapi.u-aizu.ac.jp/solutions/"
    if status.UserId != "" {
        url += "users/" + status.UserId + "/"
    }
    if status.ProblemId != "" {
        url += "problems/" + status.ProblemId + "/"
    }
    if (status.UserId == "" || status.ProblemId == "") && status.Language != "" {
        url += "lang/" + status.Language + "/"
    }
    url += "?page=" + strconv.Itoa(status.PageId)
    url += "&size=" + strconv.Itoa(status.PageSize)

    log.Print(url)

    response, err := http.Get(url)
    if err != nil {
        log.Print("Error http request: ", err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    defer response.Body.Close()

    body, err := io.ReadAll(response.Body)
    if err != nil {
        log.Print("Error reading response body: ", err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    var data []map[string]interface{}
    err = json.Unmarshal(body, &data)
    if err != nil {
        log.Print("Error decoding json: ", err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }

    for _, submission := range data {
        _, err = insertSubmission(db, getSubmissionFromMap(submission))
        if err != nil {
            log.Print("Error using database: ", err)
            w.WriteHeader(http.StatusBadRequest)
            return
        }
    }

    rows, err := searchSubmission(db, status)
    if err != nil {
        log.Print("Error selecting: ", err)
        w.WriteHeader(http.StatusBadRequest)
        return
    }
    defer rows.Close()

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
