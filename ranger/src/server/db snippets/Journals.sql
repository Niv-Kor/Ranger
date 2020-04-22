-- Tables
CREATE TABLE Journals (
	journal_owner VARCHAR(70) NOT NULL,
	discipline VARCHAR(20) NOT NULL,
	journal_name VARCHAR(20) NOT NULL,
	target_id INT NOT NULL,
	theme_color VARCHAR(9) DEFAULT '#fafafa',
	sort_order INT NOT NULL

	PRIMARY KEY(journal_owner, discipline, journal_name)
	FOREIGN KEY(target_id) REFERENCES Targets(id)
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

CREATE PROCEDURE LoadJournals
	@user VARCHAR(70)
AS
BEGIN
	SELECT *
	FROM Journals
	WHERE journal_owner = @user
END
GO

ALTER PROCEDURE CreateJournal
	@user VARCHAR(70),
	@discipline VARCHAR(30),
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

-- Exec
SELECT * FROM Journals;
DELETE FROM Journals