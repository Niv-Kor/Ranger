-- Tables
CREATE TABLE Hits (
	id INT NOT NULL,
	range_id INT NOT NULL,
	x DECIMAL(6,3) NOT NULL,
	y DECIMAL(6,3) NOT NULL,
	score INT NOT NULL,
	round_no INT NOT NULL,

	PRIMARY KEY(id, range_id),

	CONSTRAINT FK_Hits_Ranges_id
	FOREIGN KEY(range_id) REFERENCES Ranges(id) ON DELETE CASCADE
)
GO

-- Procedures
CREATE PROCEDURE RecordHit
	@hit_id INT,
	@range_id INT,
	@cx DECIMAL(6,3),
	@cy DECIMAL(6,3),
	@score INT,
	@round INT
AS
BEGIN
	INSERT INTO Hits(id,
					 range_id,
					 x,
					 y,
					 score,
					 round_no)
	VALUES(
		@hit_id,
		@range_id,
		@cx,
		@cy,
		@score,
		@round
	)
END
GO

CREATE PROCEDURE RemoveHit
	@hit_id INT,
	@range_id INT
AS
BEGIN
	DELETE FROM Hits
	WHERE id = @hit_id
	  AND range_id = @range_id
END
GO

ALTER PROCEDURE LoadHits
	@range_id INT
AS
BEGIN
	SELECT *
	FROM Hits
	WHERE range_id = @range_id
	ORDER BY round_no, id ASC
END
GO

-- Exec
SELECT * FROM Hits
GO

DELETE FROM Hits
GO

DROP TABLE Hits
GO