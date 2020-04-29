-- Tables
CREATE TABLE Journals (
	id INT IDENTITY(1,1),
	journal_owner VARCHAR(70) NOT NULL,
	discipline VARCHAR(20) NOT NULL,
	journal_name VARCHAR(20) NOT NULL,
	target_id INT NOT NULL,
	theme_color VARCHAR(9) DEFAULT '#fafafa',
	sort_order INT NOT NULL,

	PRIMARY KEY(id),
	FOREIGN KEY(target_id) REFERENCES Targets(id),

	CONSTRAINT unique_journal UNIQUE CLUSTERED (
		journal_owner, discipline, journal_name
	)
);
GO

DROP TABLE Journals
GO

SELECT * FROM Journals
GO

-- Procedures
ALTER PROCEDURE JournalExists
	@user VARCHAR(70),
	@discipline VARCHAR(30),
	@journal_name VARCHAR(20)
AS
BEGIN
	SELECT CAST(COUNT(1) AS BIT) AS journal_exists
	FROM Journals
	WHERE journal_owner = @user
	  AND discipline = @discipline
	  AND journal_name = @journal_name
END
GO

ALTER PROCEDURE LoadJournals
	@user VARCHAR(70)
AS
BEGIN
	SELECT j.id,
		   j.discipline,
		   j.journal_name,
		   j.theme_color,
		   j.sort_order,
		   t.id AS target_id,
		   t.image_name AS target_name,
		   t.image_path AS target_path,
		   t.center_y AS target_center_x,
		   t.center_x AS target_center_y,
		   t.rings AS target_rings,
		   t.rings_diameter AS target_rings_diameter
	FROM Journals j
	INNER JOIN Targets t ON j.target_id = t.id
	WHERE journal_owner = @user
	ORDER BY sort_order ASC
END
GO

ALTER PROCEDURE UpdateJournalOrder
	@user VARCHAR(70),
	@discipline VARCHAR(20),
	@journal_name VARCHAR(20),
	@new_order INT
AS
BEGIN
	UPDATE Journals
	SET sort_order = @new_order
	WHERE journal_owner = @user
	  AND discipline = @discipline
	  AND journal_name = @journal_name
END
GO

ALTER PROCEDURE CreateJournal
	@user VARCHAR(70),
	@discipline VARCHAR(20),
	@journal_name VARCHAR(20),
	@target INT,
	@theme VARCHAR(9)
AS
BEGIN
	DECLARE @order INT;
	SET
	@order = (
		SELECT ISNULL(MAX(sort_order), 0)
		FROM Journals
		WHERE journal_owner = @user
	) + 1;

	INSERT INTO Journals(journal_owner,
						 discipline,
						 journal_name,
						 target_id,
						 theme_color,
						 sort_order)
	VALUES (
		@user,
		@discipline,
		@journal_name,
		@target,
		@theme,
		@order
	)
END
GO

CREATE PROCEDURE GetJournalId
	@user VARCHAR(70),
	@discipline VARCHAR(20),
	@journal_name VARCHAR(20)
AS
BEGIN
	SELECT id
	FROM Journals
	WHERE journal_owner = @user
	  AND discipline = @discipline
	  AND journal_name = @journal_name
END
GO

-- Exec
SELECT * FROM Journals;
DELETE FROM Journals

UPDATE Journals
SET sort_order = 2
WHERE journal_owner = 'nivkor23@gmail.com'
	AND discipline = 'Archery'
	AND journal_name = 'Test other'