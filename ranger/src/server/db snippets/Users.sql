-- Tables
CREATE TABLE Users (
	email VARCHAR(70) NOT NULL,
	hashPass VARCHAR(512) NOT NULL,
	PRIMARY KEY(email)
);
GO

-- Procedures
ALTER PROCEDURE SignUp
    @email VARCHAR(70),   
    @hash VARCHAR(512)
AS
BEGIN
    INSERT INTO Users(email, hashPass)
	VALUES (
		@email,
		@hash
	)
END
GO

ALTER PROCEDURE ValidateUser
    @email VARCHAR(70),   
    @hash VARCHAR(512)   
AS
BEGIN
    SELECT CAST(COUNT(1) AS BIT) AS is_valid
	FROM Users
	WHERE email = @email
	  AND hashPass = @hash COLLATE SQL_Latin1_General_CP1_CS_AS
END
GO

ALTER PROCEDURE GetUserHashedPassword
	@email VARCHAR(70)
AS
BEGIN
	SELECT hashPass
	FROM Users
	WHERE email = @email
END
GO

-- Exec
SELECT * FROM Users
GO

DELETE FROM Users