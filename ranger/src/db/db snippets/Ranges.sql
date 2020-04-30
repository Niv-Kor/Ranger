-- Tables
CREATE TABLE Ranges (
	id INT IDENTITY(1,1),
	journal_id INT NOT NULL,
	shooting_date VARCHAR(19) NOT NULL,
	target_id INT NOT NULL,
	ends INT DEFAULT 1,

	PRIMARY KEY(id),
	FOREIGN KEY(journal_id) REFERENCES Journals(id),
	FOREIGN KEY(target_id) REFERENCES Targets(id),

	CONSTRAINT unique_range UNIQUE CLUSTERED (
		journal_id, shooting_date
	)
)

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

ALTER PROCEDURE LoadRanges
	@shooter VARCHAR(70),
	@journal_id INT
AS
BEGIN
	SELECT r.id,
		   r.shooting_date as 'date',
		   r.target_id,
		   r.ends
	FROM Ranges r
	INNER JOIN Journals j ON j.id = r.journal_id
	WHERE j.journal_owner = @shooter
	  AND j.id = @journal_id
	ORDER BY CONVERT(DATETIME, r.shooting_date, 120) DESC
END
GO

-- Exec
SELECT * FROM Ranges
DROP TABLE Ranges