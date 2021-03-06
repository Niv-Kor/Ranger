-- Tables
CREATE TABLE Ranges (
	id INT IDENTITY(1,1),
	journal_id INT NOT NULL,
	shooting_date VARCHAR(19) NOT NULL,
	target_id INT DEFAULT NULL,
	ends INT DEFAULT 1,
	is_training TINYINT DEFAULT 0,

	PRIMARY KEY(id),

	CONSTRAINT FK_Ranges_Journals_id
	FOREIGN KEY(journal_id) REFERENCES Journals(id) ON DELETE CASCADE,

	CONSTRAINT FK_Ranges_Targets_id
	FOREIGN KEY(target_id) REFERENCES Targets(id) ON DELETE NO ACTION,

	CONSTRAINT unique_range UNIQUE CLUSTERED (
		journal_id, shooting_date
	)
)
GO

ALTER TABLE Ranges
ALTER COLUMN target_id INT

ALTER TABLE Ranges
DROP CONSTRAINT FK_Ranges_Targets_id

ALTER TABLE Ranges
ADD CONSTRAINT FK_Ranges_Targets_id
FOREIGN KEY(target_id) REFERENCES Targets(id) ON DELETE NO ACTION


-- Procedures
ALTER PROCEDURE CreateRange
	@journal_id INT,
	@date VARCHAR(19),
	@target INT
AS
BEGIN
	INSERT INTO Ranges(journal_id,
					   shooting_date,
					   target_id)
	VALUES(
		@journal_id,
		@date,
		@target
	)
END
GO

CREATE PROCEDURE RangeExists
	@journal_id INT,
	@date VARCHAR(19)
AS
BEGIN
	SELECT CAST(COUNT(1) AS BIT) AS range_exists
	FROM Ranges
	WHERE journal_id = @journal_id
	  AND shooting_date = @date
END
GO

ALTER PROCEDURE GetRangeId
	@journal_id INT,
	@date VARCHAR(19)
AS
BEGIN
	SELECT id
	FROM Ranges
	WHERE journal_id = @journal_id
	  AND shooting_date = @date
END
GO

ALTER PROCEDURE AddRangeEnd
	@id INT,
	@amount INT
AS
BEGIN
	UPDATE Ranges
	SET ends = ends + @amount
	WHERE id = @id
END
GO

ALTER PROCEDURE RemoveRangeEnd
	@id INT,
	@amount INT
AS
BEGIN
	UPDATE Ranges
	SET ends = ends - @amount
	WHERE id = @id
	  AND ends > @amount
END
GO

ALTER PROCEDURE DeleteRange
	@id INT
AS
BEGIN
	DECLARE
		@user VARCHAR(70)
	SET
		@user = (SELECT t.target_owner
				 FROM Targets t
				 INNER JOIN Ranges r ON r.target_id = t.id
				 WHERE r.target_id = @id)

	DELETE FROM Ranges
	WHERE id = @id

	-- delete targets that are left orphins after the range deletion
	EXEC DeleteOrphinTargets @user;
END
GO

ALTER PROCEDURE LoadRanges
	@shooter VARCHAR(70),
	@journal_id INT
AS
BEGIN
	DECLARE
		@scores TABLE(
			id INT NOT NULL,
			score INT DEFAULT 0,
			total INT DEFAULT 0
		)
	
	-- get scores and total for each range
	INSERT INTO @scores(id, score, total)
	SELECT r.id,
		   ISNULL(SUM(h.score), 0) AS 'score',
		   ISNULL(COUNT(h.score), 0) * 10 AS 'total'
	FROM Ranges r
	FULL OUTER JOIN Hits h ON h.range_id = r.id
	WHERE r.journal_id = @journal_id
	GROUP BY r.id
	
	-- pull all ranges of a single journal
	SELECT r.id,
		   r.shooting_date AS 'date',
		   r.target_id,
		   r.ends,
		   ISNULL(s.score, 0) AS 'score',
		   ISNULL(s.total, 0) AS 'total'
	FROM Ranges r
	INNER JOIN Journals j ON j.id = r.journal_id
	INNER JOIN @scores s ON s.id = r.id
	WHERE j.journal_owner = @shooter
	  AND j.id = @journal_id
	GROUP BY r.id,
			 r.shooting_date,
			 r.target_id,
			 r.ends,
			 s.score,
			 s.total
	ORDER BY CONVERT(DATETIME, r.shooting_date, 120) DESC
END
GO

-- Exec
SELECT * FROM Ranges
GO

DELETE FROM Ranges
GO

DROP TABLE Ranges
GO

DELETE FROM Targets t
	WHERE t.id IN (SELECT t1.id
				   FROM Targets t1
				   WHERE t1.active = 0
					 AND t1.id NOT IN (SELECT r.target_id
				  					   FROM Ranges r
									   INNER JOIN Journals j ON j.id = r.journal_id
									   WHERE j.journal_owner = @user
									   AND r.id != @id))
