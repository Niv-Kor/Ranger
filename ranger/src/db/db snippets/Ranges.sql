-- Tables
CREATE TABLE Ranges (
	id INT IDENTITY(1,1),
	journal_id INT NOT NULL,
	shooting_date VARCHAR(19) NOT NULL,
	target_id INT DEFAULT NULL,
	is_protocoled TINYINT DEFAULT 1,

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

-- Procedures
ALTER PROCEDURE CreateRange
	@journal_id INT,
	@date VARCHAR(19),
	@target INT
AS
BEGIN
	DECLARE
		@user VARCHAR(70)
	SET
		@user = (SELECT journal_owner
				 FROM Journals
				 WHERE id = @journal_id)

	INSERT INTO Ranges(journal_id,
					   shooting_date,
					   target_id)
	VALUES(
		@journal_id,
		@date,
		@target
	)
	
	-- find the newly created range's ID
	SELECT MAX(r.id) AS 'new_id'
	FROM Ranges r
	INNER JOIN Journals j ON j.id = r.journal_id
	WHERE j.journal_owner = @user
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
		   r.is_protocoled,
		   r.target_id,
		   ISNULL(s.score, 0) AS 'score',
		   ISNULL(s.total, 0) AS 'total'
	FROM Ranges r
	INNER JOIN Journals j ON j.id = r.journal_id
	INNER JOIN @scores s ON s.id = r.id
	WHERE j.journal_owner = @shooter
	  AND j.id = @journal_id
	GROUP BY r.id,
			 r.shooting_date,
			 r.is_protocoled,
			 r.target_id,
			 s.score,
			 s.total
	ORDER BY CONVERT(DATETIME, r.shooting_date, 120) DESC
END
GO

CREATE PROCEDURE ClearRange
	@range_id INT
AS
BEGIN
	DELETE FROM Hits
	WHERE range_id = @range_id
END
GO

CREATE PROCEDURE DeleteRange
	@range_id INT
AS
BEGIN
	DELETE FROM Ranges
	WHERE id = @range_id
END
GO

CREATE PROCEDURE UpdateRange
	@range_id INT,
	@date VARCHAR(19),
	@protocoled TINYINT
AS
BEGIN
	UPDATE Ranges
	SET shooting_date = ISNULL(@date, shooting_date),
		is_protocoled = ISNULL(@protocoled, is_protocoled)
	WHERE id = @range_id
END
GO

-- Exec
SELECT * FROM Ranges
GO

DELETE FROM Ranges
GO

DROP TABLE Ranges
GO