-- Tables
CREATE TABLE Users (
	email VARCHAR(70) NOT NULL,
	pass VARCHAR(40) NOT NULL,
	PRIMARY KEY(email)
);
GO

-- Procedures
ALTER PROCEDURE SignUp
    @email VARCHAR(70),   
    @password VARCHAR(40)   
AS
BEGIN
    INSERT INTO Users(email, pass)
	VALUES (
		@email,
		@password
	)
END
GO

ALTER PROCEDURE ValidateUser
    @email VARCHAR(70),   
    @password VARCHAR(40)   
AS
BEGIN
    SELECT CAST(COUNT(1) AS BIT) AS is_valid
	FROM Users
	WHERE email = @email
	  AND pass = @password COLLATE SQL_Latin1_General_CP1_CS_AS
END
GO

-- Exec
SELECT * FROM Users
GO