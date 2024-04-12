CREATE DATABASE IF NOT EXISTS submission_database;

USE submission_database;

CREATE TABLE IF NOT EXISTS submissions (
    judge_id        BIGINT      NOT NULL PRIMARY KEY,
    user_id         VARCHAR(32) NOT NULL,
    problem_id      VARCHAR(32) NOT NULL,
    language        VARCHAR(32) NOT NULL,
    version         VARCHAR(32) NOT NULL,
    submission_time DATETIME    NOT NULL,
    cpu_time        INT         NOT NULL,
    memory          INT         NOT NULL
);

CREATE INDEX index_submission ON submissions(submission_time);
CREATE INDEX index_user ON submissions(user_id);
CREATE INDEX index_problem ON submissions(problem_id);
