-- Tables
CREATE TABLE Journals (
	journal_owner VARCHAR(70) NOT NULL,
	discipline VARCHAR(30) NOT NULL,
	journal_name VARCHAR(20) NOT NULL,
	stored_default_target VARCHAR(128) DEFAULT NULL,
	custom_default_target VARCHAR(512) DEFAULT NULL,
	is_target_custom TINYINT DEFAULT 0

	PRIMARY KEY(journal_owner, discipline, journal_name)
);
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

ALTER PROCEDURE CreateJournal
	@user VARCHAR(70),
	@discipline VARCHAR(30),
	@journal_name VARCHAR(20),
	@stored_default_target VARCHAR(128),
	@custom_default_target VARCHAR(512),
	@is_target_custom TINYINT
AS
BEGIN
	INSERT INTO Journals(journal_owner,
						 discipline,
						 journal_name,
						 stored_default_target,
						 custom_default_target,
						 is_target_custom)
	VALUES (
		@user,
		@discipline,
		@journal_name,
		@stored_default_target,
		@custom_default_target,
		@is_target_custom
	)
END
GO

-- Exec
SELECT * FROM Journals;
GO